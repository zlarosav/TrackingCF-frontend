'use client';

import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Lock, Eye, EyeOff, UserPlus, FileText, Users, Activity, LogOut, Filter, X, Calendar, Megaphone, Trash2, AlertTriangle, RefreshCw, CheckCircle, XCircle, Edit, ChevronDown, ChevronUp, ArrowRight, MessageSquare } from 'lucide-react';
import { CreateNotification } from '@/components/admin/CreateNotification';

export default function AdminConsole() {
  const [token, setToken] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Dashboard State
  const [view, setView] = useState('users'); // users | audit | announcements | chat
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [newUser, setNewUser] = useState({
    handle: '',
    leetcodeHandle: '',
    atcoderHandle: '',
    codechefHandle: ''
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [nicknameEditorOpen, setNicknameEditorOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [nicknameForm, setNicknameForm] = useState({
    newHandle: '',
    leetcodeHandle: '',
    atcoderHandle: '',
    codechefHandle: ''
  });
  const [nicknameSaving, setNicknameSaving] = useState(false);
  const [featureFlags, setFeatureFlags] = useState({ atcoderSubmissions: false });
  const [featureSaving, setFeatureSaving] = useState(false);

  // Audit Filters
  const [filters, setFilters] = useState({ ip: '', method: '', endpoint: '', startDate: '', endDate: '' });
  const [activeFilters, setActiveFilters] = useState({});
  const [auditViewMode, setAuditViewMode] = useState('ip'); // 'ip' or 'list'
  const [auditSummary, setAuditSummary] = useState([]);
  const [expandedIp, setExpandedIp] = useState(null);
  const [ipLogs, setIpLogs] = useState([]);
  const [loadingIpLogs, setLoadingIpLogs] = useState(false);
  const [adminActionsOnly, setAdminActionsOnly] = useState(false);

  // Chat Audit State
  const [chatSummary, setChatSummary] = useState([]);
  const [loadingChatSummary, setLoadingChatSummary] = useState(false);

  // Banner State
  const [currentBanner, setCurrentBanner] = useState(null);
  const [bannerMsg, setBannerMsg] = useState('');
  const [bannerType, setBannerType] = useState('info');
  const [bannerDuration, setBannerDuration] = useState(24);

  // Initial Check
  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token');
    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
      fetchData(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchData = async (authToken, currentFilters = {}) => {
    setLoading(true);
    try {
      if (view === 'users') {
          await fetchUsers(authToken);
          await fetchFeatureFlags(authToken);
      } else if (view === 'audit') {
          if (auditViewMode === 'ip') {
              await fetchAuditSummary(authToken);
          } else {
              await fetchLogs(authToken, currentFilters);
          }
      } else if (view === 'announcements') {
          await fetchBanner(authToken);
      } else if (view === 'chat') {
          await fetchChatSummary(authToken);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
      if (isAuthenticated && token) {
        if (view === 'users') {
          fetchUsers(token);
          fetchFeatureFlags(token);
        }
          if (view === 'audit') {
               if (auditViewMode === 'ip') fetchAuditSummary(token);
               else fetchLogs(token, activeFilters);
          }
          if (view === 'announcements') fetchBanner(token);
          if (view === 'chat') fetchChatSummary(token);
      }
  }, [view, auditViewMode]); // Added auditViewMode dependency

  const logout = () => {
    localStorage.removeItem('admin_token');
    setToken('');
    setIsAuthenticated(false);
    setUsers([]);
    setLogs([]);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const res = await axios.post(`${API_URL}/admin/login`, { username, password });
      
      const newToken = res.data.token;
      setToken(newToken);
      localStorage.setItem('admin_token', newToken);
      setIsAuthenticated(true);
      // Fetch initial data based on default view
      await fetchUsers(newToken);
      await fetchFeatureFlags(newToken);
      setLoading(false);
    } catch (err) {
      setLoginError(err.response?.data?.error || 'Error al iniciar sesión');
      setLoading(false);
    }
  };

  const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  const fetchUsers = async (authToken) => {
    try {
      const res = await axios.get(`${getApiUrl()}/admin/users`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setUsers(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFeatureFlags = async (authToken) => {
    try {
      const res = await axios.get(`${getApiUrl()}/admin/feature-flags`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      setFeatureFlags({
        atcoderSubmissions: !!res.data?.data?.atcoderSubmissions
      });
    } catch (err) {
      console.error(err);
    }
  };

  const toggleAtcoderSubmissions = async () => {
    const nextValue = !featureFlags.atcoderSubmissions;
    setFeatureSaving(true);

    try {
      await axios.put(
        `${getApiUrl()}/admin/feature-flags/atcoder-submissions`,
        { enabled: nextValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setFeatureFlags((prev) => ({ ...prev, atcoderSubmissions: nextValue }));
      alert(`AtCoder submissions ${nextValue ? 'activado' : 'desactivado'}`);
    } catch (err) {
      alert('Error al actualizar flag: ' + (err.response?.data?.error || err.message));
    } finally {
      setFeatureSaving(false);
    }
  };

  const fetchLogs = async (authToken, currentFilters) => {
    // setLoading(true); // Don't block full UI, just table part ideally, but global loading is safer for now or use local state
    try {
      // Build query params
      const params = new URLSearchParams();
      if (currentFilters.ip) params.append('ip', currentFilters.ip);
      if (currentFilters.method) params.append('method', currentFilters.method);
      if (currentFilters.endpoint) params.append('endpoint', currentFilters.endpoint);
      if (currentFilters.startDate) params.append('startDate', currentFilters.startDate);
      if (currentFilters.endDate) params.append('endDate', currentFilters.endDate);

      const res = await axios.get(`${getApiUrl()}/admin/audit-logs?${params.toString()}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setLogs(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
        // setLoading(false);
    }
  };

  const fetchAuditSummary = async (authToken) => {
      setLoading(true);
      try {
          const res = await axios.get(`${getApiUrl()}/admin/audit-summary`, {
              headers: { Authorization: `Bearer ${authToken}` }
          });
          setAuditSummary(res.data.data);
      } catch (err) {
          console.error(err);
      } finally {
          setLoading(false);
      }
  };

  const fetchChatSummary = async (authToken) => {
      setLoading(true);
      try {
          // Filter summary by CHAT_QUERY action
          const res = await axios.get(`${getApiUrl()}/admin/audit-summary?action=CHAT_QUERY`, {
              headers: { Authorization: `Bearer ${authToken}` }
          });
          setChatSummary(res.data.data);
      } catch (err) {
          console.error(err);
      } finally {
          setLoading(false);
      }
  };

  const toggleIpExpand = async (ip, mode = 'audit') => {
      if (expandedIp === ip) {
          setExpandedIp(null);
          return;
      }
      
      setExpandedIp(ip);
      setIpLogs([]);
      setLoadingIpLogs(true);
      
      try {
           const encodedIp = encodeURIComponent(ip);
           let url = `${getApiUrl()}/admin/audit-logs?ip=${encodedIp}&limit=10`;
           if (mode === 'chat') {
               url += '&method=CHAT_QUERY'; // method maps to action in backend
           }
           
           const res = await axios.get(url, { 
              headers: { Authorization: `Bearer ${token}` }
           });
           setIpLogs(res.data.data);
      } catch (err) {
          console.error(err);
          alert('Error al cargar historial: ' + (err.response?.data?.error || err.message));
      } finally {
          setLoadingIpLogs(false);
      }
  };

  const fetchBanner = async (authToken) => {
      try {
          const res = await axios.get(`${getApiUrl()}/notifications`);
          setCurrentBanner(res.data.data.banner);
      } catch (err) {
          console.error(err);
      }
  };

  const applyFilter = (key, value) => {
      const newFilters = { ...activeFilters, [key]: value };
      if (!value) delete newFilters[key]; // Remove empty
      
      setActiveFilters(newFilters);
      setFilters({ ...filters, [key]: value || '' }); // Update inputs too
      fetchLogs(token, newFilters);
  };

  const clearFilter = (key) => {
      const newFilters = { ...activeFilters };
      delete newFilters[key];
      setActiveFilters(newFilters);
      setFilters({ ...filters, [key]: '' });
      fetchLogs(token, newFilters);
  }

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.handle) return;
    setActionLoading(true);

    try {
      const res = await axios.post(`${getApiUrl()}/admin/users`, 
        {
          handle: newUser.handle,
          leetcodeHandle: newUser.leetcodeHandle || undefined,
          atcoderHandle: newUser.atcoderHandle || undefined,
          codechefHandle: newUser.codechefHandle || undefined
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewUser({ handle: '', leetcodeHandle: '', atcoderHandle: '', codechefHandle: '' });
      fetchUsers(token); 
      
      const { newSubmissions, streak, rank, leetcodeHandle, atcoderHandle, codechefHandle } = res.data.data || {};
      alert(`✅ Usuario agregado exitosamente!\n\nDatos iniciales:\n- Submissions: ${newSubmissions}\n- Racha: ${streak} días\n- Rango: ${rank}\n- LeetCode: ${leetcodeHandle || '—'}\n- AtCoder: ${atcoderHandle || '—'}\n- CodeChef: ${codechefHandle || '—'}`);
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al agregar';
      alert(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const toggleVisibility = async (userHandle, currentStatus) => {
    if (!confirm(`¿${currentStatus ? 'Mostrar' : 'Ocultar'} a ${userHandle}?`)) return;

    try {
      await axios.put(`${getApiUrl()}/admin/users/${userHandle}/visibility`, 
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers(token);
    } catch (err) {
      alert('Error al actualizar');
    }
  };

  const handleSetBanner = async (e) => {
      e.preventDefault();
      if (!bannerMsg) return;

      try {
          await axios.post(`${getApiUrl()}/notifications/banner`, 
              { message: bannerMsg, type: bannerType, duration: bannerDuration },
              { headers: { Authorization: `Bearer ${token}` } }
          );
          alert('Banner actualizado');
          setBannerMsg('');
          fetchBanner(token);
      } catch (err) {
          alert('Error actualizando banner');
      }
  };

  const [loadingUsers, setLoadingUsers] = useState({});

  const toggleEnabled = async (userHandle, currentStatus) => {
    if (!confirm(`¿${currentStatus ? 'Deshabilitar' : 'Habilitar'} tracking para ${userHandle}?`)) return;

    try {
      await axios.put(`${getApiUrl()}/admin/users/${userHandle}/enable`, 
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers(token);
    } catch (err) {
      alert('Error al actualizar estado');
    }
  };

  const handleManualTrack = async (userHandle) => {
    setLoadingUsers(prev => ({ ...prev, [userHandle]: true }));
    try {
        const res = await axios.post(`${getApiUrl()}/admin/users/${userHandle}/track`, 
            {}, 
            { headers: { Authorization: `Bearer ${token}` } }
        );
        alert(`Actualizado: ${res.data.newSubmissions} nuevas submissions.\nRank: ${res.data.rank || 'N/A'}`);
        fetchUsers(token);
    } catch (err) {
        alert('Error ejecutando tracker: ' + (err.response?.data?.error || err.message));
    } finally {
        setLoadingUsers(prev => ({ ...prev, [userHandle]: false }));
    }
  };



  const handleDeleteUser = async (userHandle) => {
    if (!confirm(`⚠️ ¿ESTÁS SEGURO?\n\nVas a ELIMINAR a '${userHandle}' y todo su historial de la base de datos.\n\nEsta acción no se puede deshacer.`)) return;

    try {
        await axios.delete(`${getApiUrl()}/admin/users/${userHandle}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        alert('Usuario eliminado correctamente');
        fetchUsers(token);
    } catch (err) {
        alert('Error al eliminar usuario');
    }
  };

  const openNicknameEditor = (user) => {
    setEditingUser(user);
    setNicknameForm({
      newHandle: user.handle || '',
      leetcodeHandle: user.leetcode_handle || '',
      atcoderHandle: user.atcoder_handle || '',
      codechefHandle: user.codechef_handle || ''
    });
    setNicknameEditorOpen(true);
  };

  const closeNicknameEditor = () => {
    setNicknameEditorOpen(false);
    setEditingUser(null);
    setNicknameSaving(false);
    setNicknameForm({ newHandle: '', leetcodeHandle: '', atcoderHandle: '', codechefHandle: '' });
  };

  const saveNicknames = async () => {
    if (!editingUser) return;

    const currentHandle = editingUser.handle;
    const desiredHandle = nicknameForm.newHandle.trim();

    if (!desiredHandle) {
      alert('El handle principal no puede estar vacío');
      return;
    }

    setNicknameSaving(true);

    try {
      if (desiredHandle !== currentHandle) {
        await axios.put(
          `${getApiUrl()}/admin/users/${currentHandle}/rename`,
          { newHandle: desiredHandle },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      await axios.put(
        `${getApiUrl()}/admin/users/${desiredHandle}/platform-handles`,
        {
          leetcodeHandle: nicknameForm.leetcodeHandle.trim() || null,
          atcoderHandle: nicknameForm.atcoderHandle.trim() || null,
          codechefHandle: nicknameForm.codechefHandle.trim() || null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchUsers(token);
      closeNicknameEditor();
      alert('Nicknames actualizados correctamente');
    } catch (err) {
      alert('Error al guardar nicknames: ' + (err.response?.data?.error || err.message));
      setNicknameSaving(false);
    }
  };

  const handleDeleteBanner = async () => {
      if (!confirm('¿Eliminar banner actual?')) return;
      try {
          await axios.delete(`${getApiUrl()}/notifications/banner`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          setCurrentBanner(null);
      } catch (err) {
          alert('Error eliminando banner');
      }
  };

  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase();
    if (!query) return users;

    return users.filter((user) => {
      return [
        user.handle,
        user.leetcode_handle,
        user.atcoder_handle,
        user.codechef_handle
      ].some((value) => String(value || '').toLowerCase().includes(query));
    });
  }, [users, userSearch]);

  if (!isAuthenticated && !loading) {
    return (
      <div className="hero-grid min-h-screen bg-background flex items-center justify-center p-4">
        <div className="surface-panel w-full max-w-sm rounded-[1.5rem] overflow-hidden">
          <div className="p-8">
            <div className="flex justify-center mb-6">
              <div className="w-12 h-12 bg-primary/15 rounded-full flex items-center justify-center border border-primary/20">
                <Lock className="w-6 h-6 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center mb-2">Admin Console</h2>
            <p className="text-muted-foreground text-center mb-6 text-sm">Acceso restringido</p>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input 
                  type="text" 
                  placeholder="Usuario"
                  className="w-full bg-background border border-border px-4 py-2 rounded-lg focus:outline-none focus:border-primary transition-colors"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <input 
                  type="password" 
                  placeholder="Contraseña"
                  className="w-full bg-background border border-border px-4 py-2 rounded-lg focus:outline-none focus:border-primary transition-colors"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              
              {loginError && (
                <p className="text-red-500 text-xs text-center">{loginError}</p>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? 'Entrando...' : 'Iniciar Sesión'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-foreground">Cargando...</div>;
  }

  return (
    <div className="hero-grid min-h-screen bg-background text-foreground font-sans">
      {/* Navbar - Simplified for Admin */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Activity className="w-6 h-6 text-primary" />
              <span className="font-bold text-lg">TrackingCF Console</span>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={logout} className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm">
                <LogOut className="w-4 h-4" /> Salir
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setView('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium border transition-colors ${view === 'users' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground border-border hover:text-foreground'}`}
          >
            <Users className="w-4 h-4" /> Usuarios
          </button>
          <button 
            onClick={() => setView('audit')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium border transition-colors ${view === 'audit' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground border-border hover:text-foreground'}`}
          >
            <FileText className="w-4 h-4" /> Auditoría
          </button>
          <button 
            onClick={() => setView('chat')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium border transition-colors ${view === 'chat' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground border-border hover:text-foreground'}`}
          >
            <MessageSquare className="w-4 h-4" /> Chat IA
          </button>
          <button 
            onClick={() => setView('announcements')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium border transition-colors ${view === 'announcements' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground border-border hover:text-foreground'}`}
          >
            <Megaphone className="w-4 h-4" /> Anuncios
          </button>
        </div>

        {/* Content */}
        {view === 'users' && (
          <div className="space-y-6">
            <div className="surface-panel rounded-2xl p-4 md:p-5 flex flex-col gap-4">
                <div>
                  <h3 className="font-semibold">Feature Flag: AtCoder Submissions</h3>
                  <p className="text-sm text-muted-foreground">Controla si el tracker guarda submissions reales de AtCoder. Codeforces sigue funcionando igual.</p>
                </div>
                <button
                  onClick={toggleAtcoderSubmissions}
                  disabled={featureSaving}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${featureFlags.atcoderSubmissions ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-muted hover:bg-muted/80 text-foreground'}`}
                >
                  {featureSaving ? 'Guardando...' : featureFlags.atcoderSubmissions ? 'Activo' : 'Desactivado'}
                </button>
              </div>

            {/* Add User */}
            <div className="surface-panel rounded-2xl p-6 shadow-[0_10px_40px_-25px_rgba(2,51,82,0.55)]">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-green-500" /> Agregar Usuario
              </h3>
              <p className="text-sm text-muted-foreground mb-4">Puedes registrar el handle principal de Codeforces y, opcionalmente, los nicknames en otras plataformas.</p>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <input 
                    type="text" 
                    placeholder="Handle principal"
                    className="bg-background border border-border px-4 py-2 rounded-lg focus:outline-none focus:border-primary"
                    value={newUser.handle}
                    onChange={(e) => setNewUser(prev => ({ ...prev, handle: e.target.value }))}
                  />
                  <input 
                    type="text" 
                    placeholder="LeetCode username"
                    className="bg-background border border-border px-4 py-2 rounded-lg focus:outline-none focus:border-primary"
                    value={newUser.leetcodeHandle}
                    onChange={(e) => setNewUser(prev => ({ ...prev, leetcodeHandle: e.target.value }))}
                  />
                  <input 
                    type="text" 
                    placeholder="AtCoder username"
                    className="bg-background border border-border px-4 py-2 rounded-lg focus:outline-none focus:border-primary"
                    value={newUser.atcoderHandle}
                    onChange={(e) => setNewUser(prev => ({ ...prev, atcoderHandle: e.target.value }))}
                  />
                  <input 
                    type="text" 
                    placeholder="CodeChef username"
                    className="bg-background border border-border px-4 py-2 rounded-lg focus:outline-none focus:border-primary"
                    value={newUser.codechefHandle}
                    onChange={(e) => setNewUser(prev => ({ ...prev, codechefHandle: e.target.value }))}
                  />
                </div>
                <button 
                  type="submit"
                  disabled={actionLoading}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  {actionLoading ? '...' : 'Agregar'}
                </button>
              </form>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="surface-panel rounded-xl p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Total usuarios</p>
                <p className="text-2xl font-bold mt-1">{users.length}</p>
              </div>
              <div className="surface-panel rounded-xl p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Visibles</p>
                <p className="text-2xl font-bold mt-1 text-green-400">{users.filter((u) => !u.is_hidden).length}</p>
              </div>
              <div className="surface-panel rounded-xl p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Tracking activo</p>
                <p className="text-2xl font-bold mt-1 text-blue-400">{users.filter((u) => u.enabled).length}</p>
              </div>
            </div>

            <div className="surface-panel rounded-xl p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-muted-foreground">Edita nicknames con el botón <span className="text-cyan-400 font-semibold">Editar nicknames</span> en cada fila.</p>
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Buscar por handle, LC, AC o CC"
                  className="w-full md:w-80 bg-background border border-border px-3 py-2 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Users List */}
            <div className="surface-panel rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[980px]">
                <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold">
                  <tr>
                    <th className="p-4">Handle</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4">Última Act.</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/80">
                  {filteredUsers.map(user => (
                    <tr key={user.handle} className="hover:bg-muted/35 transition-colors">
                      <td className="p-4 font-medium">
                        <div className="space-y-1">
                          <div className="text-base">{user.handle}</div>
                          <div className="flex flex-wrap gap-2 text-xs">
                            <span className="bg-muted/60 border border-border px-2 py-0.5 rounded">LC: {user.leetcode_handle || '—'}</span>
                            <span className="bg-muted/60 border border-border px-2 py-0.5 rounded">AC: {user.atcoder_handle || '—'}</span>
                            <span className="bg-muted/60 border border-border px-2 py-0.5 rounded">CC: {user.codechef_handle || '—'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {user.is_hidden ? (
                          <span className="bg-red-500/10 text-red-500 px-2 py-1 rounded text-xs border border-red-500/20">Oculto</span>
                        ) : (
                          <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded text-xs border border-green-500/20">Visible</span>
                        )}
                      </td>
                      <td className="p-4 text-muted-foreground text-sm">
                        {user.last_updated ? new Date(user.last_updated).toLocaleString() : '-'}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap justify-end gap-2">
                        <button 
                          onClick={() => toggleVisibility(user.handle, user.is_hidden)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-background border border-border hover:border-primary/40 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                          title={user.is_hidden ? "Mostrar usuario" : "Ocultar usuario"}
                        >
                          {user.is_hidden ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          <span className="text-xs">Visibilidad</span>
                        </button>
                        
                        <button 
                          onClick={() => toggleEnabled(user.handle, user.enabled)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-background border rounded-lg transition-colors ${user.enabled ? 'text-green-400 border-green-500/40 hover:border-green-500/70' : 'text-red-400 border-red-500/40 hover:border-red-500/70'}`}
                          title={user.enabled ? "Deshabilitar tracking" : "Habilitar tracking"}
                        >
                          {user.enabled ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                          <span className="text-xs">Tracking</span>
                        </button>

                         <button 
                          onClick={() => handleManualTrack(user.handle)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-background border border-border hover:border-primary/50 rounded-lg transition-colors ${loadingUsers[user.handle] ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                          title="Forzar actualización ahora"
                          disabled={loadingUsers[user.handle]}
                        >
                          <RefreshCw className={`w-5 h-5 ${loadingUsers[user.handle] ? 'animate-spin' : ''}`} />
                          <span className="text-xs">Sync</span>
                        </button>

                         <button 
                          onClick={() => openNicknameEditor(user)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-cyan-950/40 border border-cyan-900/70 hover:border-cyan-500/60 rounded-lg transition-colors text-cyan-300 hover:text-cyan-200"
                          title="Editar handle principal y nicknames"
                        >
                          <Edit className="w-5 h-5" />
                          <span className="text-xs">Editar nicknames</span>
                        </button>

                         <button 
                          onClick={() => handleDeleteUser(user.handle)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-background border border-border hover:border-red-500/60 rounded-lg transition-colors text-muted-foreground hover:text-red-400"
                          title="Eliminar usuario permanentemente"
                        >
                          <Trash2 className="w-5 h-5" />
                          <span className="text-xs">Eliminar</span>
                        </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-muted-foreground">No hay usuarios para el filtro actual</td>
                    </tr>
                  )}
                </tbody>
              </table>
              </div>
            </div>
          </div>
        )}

        {/* Chat View */}
         {view === 'chat' && (
          <div className="space-y-4">
           <div className="surface-panel rounded-xl overflow-hidden divide-y divide-border">
             <div className="p-4 border-b border-border bg-muted/35 flex justify-between items-center">
                    <h3 className="font-bold flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Monitor de Chat IA</h3>
                    <button 
                        onClick={() => fetchChatSummary(token)} 
                        className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                    >
                        <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Refrescar
                    </button>
                 </div>

                 {chatSummary.map(item => (
                     <div key={item.ip} className="bg-transparent">
                         <div 
                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/35 transition-colors"
                            onClick={() => toggleIpExpand(item.ip, 'chat')}
                         >
                             <div className="flex items-center gap-4">
                                 <div className={`w-2 h-2 rounded-full ${expandedIp === item.ip ? 'bg-blue-500' : 'bg-neutral-600'}`}></div>
                                 <div className="flex flex-col">
                                     <span className="font-mono text-sm font-bold text-blue-400">{item.ip}</span>
                                     <span className="text-xs text-muted-foreground">Última pregunta: {new Date(item.lastActive).toLocaleString()}</span>
                                 </div>
                             </div>
                             
                             <div className="flex items-center gap-6">
                                 <div className="text-right">
                                     <div className="font-bold text-white">{item.totalRequests}</div>
                                     <div className="text-xs text-muted-foreground">Consultas</div>
                                 </div>
                                 
                                 <div className="text-muted-foreground">
                                     {expandedIp === item.ip ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                 </div>
                             </div>
                         </div>
                         
                         {expandedIp === item.ip && (
                             <div className="border-t border-border bg-muted/20 p-4 pl-12">
                                 {loadingIpLogs ? (
                                     <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                         <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div> Cargando historial...
                                     </div>
                                 ) : (
                                     <div className="space-y-4">
                                         {ipLogs.length === 0 ? (
                                             <div className="text-sm text-muted-foreground italic">No hay historial visible.</div>
                                         ) : (
                                             <div className="space-y-3">
                                                 {ipLogs.map(log => (
                                                     <div key={log.id} className="bg-background border border-border rounded-lg p-3 text-sm">
                                                         <div className="flex justify-between items-start mb-2">
                                                             <div className="flex items-center gap-2">
                                                                <span className="bg-blue-500/10 text-blue-400 text-xs px-2 py-0.5 rounded border border-blue-500/20">User: {log.details?.handle || 'Anon'}</span>
                                                                <span className="text-muted-foreground text-xs">{new Date(log.timestamp).toLocaleString()}</span>
                                                             </div>
                                                             <span className="text-xs font-mono text-muted-foreground">{log.details?.sessionId}</span>
                                                         </div>
                                                        <div className="text-foreground/85 whitespace-pre-wrap font-mono text-xs bg-muted/30 p-2 rounded">
                                                            {log.details?.message || JSON.stringify(log.details)}
                                                         </div>
                                                     </div>
                                                 ))}
                                             </div>
                                         )}
                                     </div>
                                 )}
                             </div>
                         )}
                     </div>
                 ))}
                 
                 {chatSummary.length === 0 && (
                     <div className="p-12 text-center text-muted-foreground">
                         <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
                         <p>No hay consultas al chat registradas.</p>
                     </div>
                 )}
             </div>
          </div>
         )}

        {view === 'audit' && (
          <div className="space-y-4">
             {/* Filter Controls */}
             <div className="surface-panel rounded-xl p-4 flex flex-wrap gap-4 items-end">
                  <div className="flex gap-2">
                      <button 
                          onClick={() => setAuditViewMode('ip')}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${auditViewMode === 'ip' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground border-border hover:text-foreground'}`}
                      >
                          Vista por IP
                      </button>
                      <button 
                          onClick={() => setAuditViewMode('list')}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${auditViewMode === 'list' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground border-border hover:text-foreground'}`}
                      >
                          Vista de Lista
                      </button>
                  </div>
                  
                  <div className="h-6 w-px bg-border mx-2"></div>

                  <div className="flex items-center gap-2">
                       <input 
                          type="checkbox" 
                          id="adminActionsOnly"
                          checked={adminActionsOnly}
                          onChange={(e) => {
                              setAdminActionsOnly(e.target.checked);
                              // Refetch if in list mode, or filter locally/refetch in IP mode
                              if (auditViewMode === 'list') {
                                   // We need to implement this filter in backend or simple frontend filter?
                                   // For now let's just use it to filter the displayed list if it's small, 
                                   // or trigger a fetch with a special param if backend supported it.
                                   // Let's assume standard fetch for now and maybe filter client side or add param later.
                                   // Actually, "Solo Acciones Admin" means excluding GET_REQUEST, etc.
                                   // We can filter by "NOT LIKE '%_REQUEST'" or just show specific actions.
                                   // Let's do client-side filter for now for responsiveness if list is small, 
                                   // or add a backend param 'excludeTraffic=true'.
                              }
                          }}
                          className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-primary"
                       />
                       <label htmlFor="adminActionsOnly" className="text-sm text-foreground/90 cursor-pointer select-none">
                           Solo Acciones Admin
                       </label>
                  </div>

                  <div className="flex-1"></div>

                  <div className="flex flex-col gap-1">
                      <label className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" /> Desde</label>
                      <input 
                          type="date" 
                          className="bg-background border border-border text-sm px-3 py-1.5 rounded-lg focus:outline-none focus:border-primary"
                          value={filters.startDate}
                          onChange={(e) => applyFilter('startDate', e.target.value)}
                      />
                  </div>
                  <div className="flex flex-col gap-1">
                      <label className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" /> Hasta</label>
                      <input 
                          type="date" 
                          className="bg-background border border-border text-sm px-3 py-1.5 rounded-lg focus:outline-none focus:border-primary"
                          value={filters.endDate}
                          onChange={(e) => applyFilter('endDate', e.target.value)}
                      />
                  </div>
                  
                  {(Object.keys(activeFilters).length > 0 || adminActionsOnly) && (
                      <button 
                        onClick={() => { 
                            setActiveFilters({}); 
                            setFilters({ ip: '', method: '', endpoint: '', startDate: '', endDate: '' }); 
                            setAdminActionsOnly(false);
                            if (auditViewMode === 'list') fetchLogs(token, {}); 
                            // Summary is auto-fetched on effect
                        }} 
                        className="text-xs text-muted-foreground hover:text-foreground underline pb-2 ml-2"
                      >
                          Limpiar todo
                      </button>
                  )}
             </div>

             {/* Chip Filters Display */}
             {(Object.keys(activeFilters).length > 0) && (
                 <div className="flex gap-2 items-center text-sm flex-wrap">
                     <span className="text-muted-foreground text-xs">Filtros Activos:</span>
                     {Object.entries(activeFilters).map(([key, val]) => (
                         <span key={key} className="bg-blue-600/20 text-blue-400 border border-blue-600/30 px-2 py-1 rounded-md flex items-center gap-1 text-xs">
                             {key}: {val}
                             <button onClick={() => clearFilter(key)}><X className="w-3 h-3" /></button>
                         </span>
                     ))}
                 </div>
             )}

             <div className="surface-panel rounded-xl overflow-hidden">
             <div className="p-4 border-b border-border bg-muted/35 flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2"><Filter className="w-4 h-4" /> {auditViewMode === 'ip' ? 'Resumen por IP' : 'Registro Detallado'}</h3>
                <button 
                    onClick={() => auditViewMode === 'ip' ? fetchAuditSummary(token) : fetchLogs(token, activeFilters)} 
                    className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                >
                    <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Refrescar
                </button>
             </div>

             {auditViewMode === 'ip' ? (
                 <div className="divide-y divide-border/80">
                     {auditSummary.filter(item => {
                         // Client side filtering for summary
                         if (activeFilters.ip && !item.ip.includes(activeFilters.ip)) return false;
                         // Smart filter: if adminActionsOnly, we could filter IPs that have 0 admin actions?
                         // But summary doesn't have detailed breakdown easily available to filter perfectly without backend support.
                         // For now, let's keep it simple or filter if we add more data to summary.
                         return true;
                     }).map(item => (
                         <div key={item.ip} className="bg-transparent">
                             <div 
                                className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/35 transition-colors"
                                onClick={() => toggleIpExpand(item.ip)}
                             >
                                 <div className="flex items-center gap-4">
                                     <div className={`w-2 h-2 rounded-full ${expandedIp === item.ip ? 'bg-blue-500' : 'bg-neutral-600'}`}></div>
                                     <div>
                                         <div className="font-mono text-sm font-bold text-blue-400">{item.ip}</div>
                                         <div className="text-xs text-muted-foreground">Última actividad: {new Date(item.lastActive).toLocaleString()}</div>
                                     </div>
                                 </div>
                                 
                                 <div className="flex items-center gap-6 text-sm">
                                     <div className="text-right">
                                         <div className="font-bold text-white">{item.totalRequests}</div>
                                         <div className="text-xs text-neutral-500">Peticiones</div>
                                     </div>
                                     
                                     {item.admins && item.admins.length > 0 && (
                                         <div className="text-right">
                                             <div className="font-bold text-green-400">{item.admins.join(', ')}</div>
                                             <div className="text-xs text-neutral-500">Admins</div>
                                         </div>
                                     )}
                                     
                                     <div className="text-muted-foreground">
                                         {expandedIp === item.ip ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                     </div>
                                 </div>
                             </div>
                             
                             {expandedIp === item.ip && (
                                 <div className="border-t border-border bg-muted/20 p-4 pl-12">
                                     {loadingIpLogs ? (
                                         <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                             <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div> Cargando detalles...
                                         </div>
                                     ) : (
                                         <div className="space-y-2">
                                             <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Últimos movimientos</h4>
                                             {ipLogs.length === 0 ? (
                                                 <div className="text-sm text-muted-foreground italic">No hay registros recientes visibles.</div>
                                             ) : (
                                                 <div className="space-y-1">
                                                     {ipLogs.map(log => {
                                                         if (adminActionsOnly && (log.action.includes('_REQUEST') || log.action === 'LOGIN_FAILED')) return null; // Simple client filter
                                                         return (
                                                             <div key={log.id} className="flex items-center gap-3 text-sm py-1 border-b border-border/60 last:border-0 hover:bg-muted/30 rounded px-2">
                                                               <span className="text-muted-foreground font-mono text-xs w-32 shrink-0">{new Date(log.timestamp).toLocaleString()}</span>
                                                                 <span className={`font-bold text-xs px-2 py-0.5 rounded ${
                                                                     log.action.includes('DELETE') ? 'bg-red-500/20 text-red-400' : 
                                                                     log.action.includes('CREATE') ? 'bg-green-500/20 text-green-400' : 
                                                                     log.action.includes('LOGIN') ? 'bg-blue-500/20 text-blue-400' :
                                                                     'bg-muted text-muted-foreground'
                                                                 }`}>
                                                                     {log.action}
                                                                 </span>
                                                                 <span className="text-muted-foreground truncate flex-1 font-mono text-xs" title={JSON.stringify(log.details)}>
                                                                     {log.details ? JSON.stringify(log.details) : '-'}
                                                                 </span>
                                                                 <span className="text-muted-foreground text-xs w-20 text-right truncate" title={log.username}>{log.username || 'System'}</span>
                                                             </div>
                                                         );
                                                     })}
                                                 </div>
                                             )}
                                             
                                             <div className="pt-2">
                                                 <button 
                                                    onClick={() => {
                                                        setAuditViewMode('list');
                                                        applyFilter('ip', item.ip);
                                                    }}
                                                    className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                                                 >
                                                     Ver historial completo de esta IP <ArrowRight className="w-3 h-3" />
                                                 </button>
                                             </div>
                                         </div>
                                     )}
                                 </div>
                             )}
                         </div>
                     ))}
                     {auditSummary.length === 0 && (
                         <div className="p-8 text-center text-muted-foreground">No hay actividad registrada.</div>
                     )}
                 </div>
             ) : (
                 /* LIST VIEW TABLE (Existing) */
                 <table className="w-full text-left text-sm">
                      <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold">
                      <tr>
                        <th className="p-4">Tiempo</th>
                        <th className="p-4">Admin</th>
                        <th className="p-4">Acción</th>
                        <th className="p-4">Detalles</th>
                        <th className="p-4">IP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/80">
                      {logs.filter(log => !adminActionsOnly || !log.action.includes('_REQUEST')).map(log => (
                        <tr key={log.id} className="hover:bg-muted/35">
                          <td className="p-4 text-muted-foreground whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="p-4 font-medium text-blue-400">
                            {log.username || 'System/Guest'}
                          </td>
                          <td className="p-4">
                            <span className={`font-bold text-xs px-2 py-0.5 rounded cursor-pointer ${
                              log.action.includes('DELETE') ? 'bg-red-500/20 text-red-400' : 
                              log.action.includes('CREATE') ? 'bg-green-500/20 text-green-400' : 
                              log.action.includes('LOGIN') ? 'bg-blue-500/20 text-blue-400' :
                              'bg-muted text-muted-foreground'
                            }`}
                            onClick={() => applyFilter('method', log.action)} // method maps to action in backend
                            title={log.action}
                            >
                              {log.action}
                            </span>
                          </td>
                          <td className="p-4 text-foreground/90 font-mono text-xs">
                            {log.details ? JSON.stringify(log.details) : '-'}
                          </td>
                          <td className="p-4 text-muted-foreground text-xs font-mono cursor-pointer hover:text-foreground" onClick={() => {
                              // Switch to IP view
                              setAuditViewMode('ip');
                              // Ideally expand this ip, but verify first.
                              // Actually maybe just filter list by ip is better.
                              applyFilter('ip', log.ip_address);
                          }}>
                              {log.ip_address}
                          </td>
                        </tr>
                      ))}
                      {logs.length === 0 && (
                          <tr>
                              <td colSpan="5" className="p-8 text-center text-muted-foreground">No se encontraron registros</td>
                          </tr>
                      )}
                    </tbody>
                 </table>
             )}
          </div>
          </div>
        )}

        {view === 'announcements' && (
            <div className="space-y-6">
                <CreateNotification token={token} onSuccess={() => {}} />

                {/* Active Banner Card */}
            <div className="surface-panel rounded-xl p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-500" /> Banner Activo
                    </h3>
                    
                    {currentBanner ? (
                        <div className={`p-4 rounded-lg border flex justify-between items-center ${
                            currentBanner.type === 'error' ? 'bg-red-900/20 border-red-900/50 text-red-200' :
                            currentBanner.type === 'warning' ? 'bg-amber-900/20 border-amber-900/50 text-amber-200' :
                            'bg-blue-900/20 border-blue-900/50 text-blue-200'
                        }`}>
                            <div>
                                <div className="font-bold text-sm uppercase mb-1 opacity-70">{currentBanner.type}</div>
                                <div className="text-lg">{currentBanner.message}</div>
                                <div className="text-xs opacity-60 mt-2">Expira: {new Date(currentBanner.expiresAt).toLocaleString()}</div>
                            </div>
                            <button 
                                onClick={handleDeleteBanner}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-red-400 hover:text-red-300"
                                title="Eliminar Banner"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <div className="text-neutral-500 italic p-4 text-center border border-neutral-800 border-dashed rounded-lg">
                            No hay ningún banner activo actualmente.
                        </div>
                    )}
                </div>

                {/* Create Banner Form */}
                <div className="surface-panel rounded-xl p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Megaphone className="w-5 h-5 text-green-500" /> Crear Nuevo Anuncio
                    </h3>
                    
                    <form onSubmit={handleSetBanner} className="space-y-4">
                        <div>
                            <label className="block text-sm text-muted-foreground mb-1">Mensaje</label>
                            <input 
                                type="text" 
                              className="w-full bg-background border border-border px-4 py-2 rounded-lg focus:outline-none focus:border-primary"
                                placeholder="Ej: Mantenimiento programado para esta noche..."
                                value={bannerMsg}
                                onChange={e => setBannerMsg(e.target.value)}
                                required
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-muted-foreground mb-1">Tipo</label>
                                <select 
                                  className="w-full bg-background border border-border px-4 py-2 rounded-lg focus:outline-none focus:border-primary"
                                    value={bannerType}
                                    onChange={e => setBannerType(e.target.value)}
                                >
                                    <option value="info">Información (Azul)</option>
                                    <option value="warning">Advertencia (Ambar)</option>
                                    <option value="error">Error / Crítico (Rojo)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-muted-foreground mb-1">Duración (Horas)</label>
                                <input 
                                    type="number" 
                                  className="w-full bg-background border border-border px-4 py-2 rounded-lg focus:outline-none focus:border-primary"
                                    value={bannerDuration}
                                    onChange={e => setBannerDuration(e.target.value)}
                                    min="1"
                                    max="72"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button 
                                type="submit" 
                              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-medium transition-colors w-full sm:w-auto"
                            >
                                Publicar Anuncio Global
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {nicknameEditorOpen && editingUser && (
          <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="surface-panel w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div>
                  <h3 className="text-lg font-bold">Editar Nicknames</h3>
                  <p className="text-sm text-muted-foreground">Usuario actual: {editingUser.handle}</p>
                </div>
                <button
                  onClick={closeNicknameEditor}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  title="Cerrar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Handle principal (Codeforces)</label>
                  <input
                    type="text"
                    value={nicknameForm.newHandle}
                    onChange={(e) => setNicknameForm((prev) => ({ ...prev, newHandle: e.target.value }))}
                    className="w-full bg-background border border-border px-4 py-2 rounded-lg focus:outline-none focus:border-primary"
                    placeholder="Nuevo handle principal"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">LeetCode</label>
                    <input
                      type="text"
                      value={nicknameForm.leetcodeHandle}
                      onChange={(e) => setNicknameForm((prev) => ({ ...prev, leetcodeHandle: e.target.value }))}
                      className="w-full bg-background border border-border px-4 py-2 rounded-lg focus:outline-none focus:border-primary"
                      placeholder="nickname o vacío"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">AtCoder</label>
                    <input
                      type="text"
                      value={nicknameForm.atcoderHandle}
                      onChange={(e) => setNicknameForm((prev) => ({ ...prev, atcoderHandle: e.target.value }))}
                      className="w-full bg-background border border-border px-4 py-2 rounded-lg focus:outline-none focus:border-primary"
                      placeholder="nickname o vacío"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">CodeChef</label>
                    <input
                      type="text"
                      value={nicknameForm.codechefHandle}
                      onChange={(e) => setNicknameForm((prev) => ({ ...prev, codechefHandle: e.target.value }))}
                      className="w-full bg-background border border-border px-4 py-2 rounded-lg focus:outline-none focus:border-primary"
                      placeholder="nickname o vacío"
                    />
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">Si dejas un campo de plataforma vacío, se guarda como null.</p>
              </div>

              <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3 bg-muted/20">
                <button
                  onClick={closeNicknameEditor}
                  disabled={nicknameSaving}
                  className="px-4 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveNicknames}
                  disabled={nicknameSaving}
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors"
                >
                  {nicknameSaving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
