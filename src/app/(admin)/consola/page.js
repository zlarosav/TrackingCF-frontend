'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Lock, Eye, EyeOff, UserPlus, FileText, Users, Activity, LogOut, Filter, X, Calendar, Megaphone, Trash2, AlertTriangle, RefreshCw, CheckCircle, XCircle, Edit } from 'lucide-react';

export default function AdminConsole() {
  const [token, setToken] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Dashboard State
  const [view, setView] = useState('users'); // users | audit | announcements
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [newHandle, setNewHandle] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Audit Filters
  const [filters, setFilters] = useState({ ip: '', method: '', endpoint: '', startDate: '', endDate: '' });
  const [activeFilters, setActiveFilters] = useState({});

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
      } else if (view === 'audit') {
          await fetchLogs(authToken, currentFilters);
      } else if (view === 'announcements') {
          await fetchBanner(authToken);
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
          if (view === 'users') fetchUsers(token);
          if (view === 'audit') fetchLogs(token, activeFilters);
          if (view === 'announcements') fetchBanner(token);
      }
  }, [view]);

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
      fetchUsers(newToken);
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

  const fetchLogs = async (authToken, currentFilters) => {
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
    if (!newHandle) return;
    setActionLoading(true);

    try {
      const res = await axios.post(`${getApiUrl()}/admin/users`, 
        { handle: newHandle },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewHandle('');
      fetchUsers(token); 
      
      const { newSubmissions, streak, rank } = res.data.data || {};
      alert(`✅ Usuario agregado exitosamente!\n\nDatos iniciales:\n- Submissions: ${newSubmissions}\n- Racha: ${streak} días\n- Rango: ${rank}`);
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

  const handleRenameUser = async (userHandle) => {
    const newHandle = prompt(`Renombrar usuario '${userHandle}'\n\nIngresa el NUEVO handle de Codeforces:`);
    if (!newHandle || newHandle === userHandle) return;

    try {
        await axios.put(`${getApiUrl()}/admin/users/${userHandle}/rename`, 
            { newHandle },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        alert(`Usuario renombrado a '${newHandle}'`);
        fetchUsers(token);
    } catch (err) {
        alert('Error al renombrar: ' + (err.response?.data?.error || err.message));
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

  if (!isAuthenticated && !loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden">
          <div className="p-8">
            <div className="flex justify-center mb-6">
              <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center">
                <Lock className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white text-center mb-2">Admin Console</h2>
            <p className="text-neutral-400 text-center mb-6 text-sm">Acceso restringido</p>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input 
                  type="text" 
                  placeholder="Usuario"
                  className="w-full bg-neutral-950 border border-neutral-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <input 
                  type="password" 
                  placeholder="Contraseña"
                  className="w-full bg-neutral-950 border border-neutral-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
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
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
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
    return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans">
      {/* Navbar - Simplified for Admin */}
      <nav className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Activity className="w-6 h-6 text-blue-500" />
              <span className="font-bold text-lg">TrackingCF Console</span>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={logout} className="text-neutral-400 hover:text-white flex items-center gap-2 text-sm">
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
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${view === 'users' ? 'bg-blue-600 text-white' : 'bg-neutral-900 text-neutral-400 hover:text-white'}`}
          >
            <Users className="w-4 h-4" /> Usuarios
          </button>
          <button 
            onClick={() => setView('audit')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${view === 'audit' ? 'bg-blue-600 text-white' : 'bg-neutral-900 text-neutral-400 hover:text-white'}`}
          >
            <FileText className="w-4 h-4" /> Auditoría
          </button>
          <button 
            onClick={() => setView('announcements')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${view === 'announcements' ? 'bg-blue-600 text-white' : 'bg-neutral-900 text-neutral-400 hover:text-white'}`}
          >
            <Megaphone className="w-4 h-4" /> Anuncios
          </button>
        </div>

        {/* Content */}
        {view === 'users' && (
          <div className="space-y-6">
            {/* Add User */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-green-500" /> Agregar Usuario
              </h3>
              <form onSubmit={handleAddUser} className="flex gap-4">
                <input 
                  type="text" 
                  placeholder="Codeforces Handle"
                  className="flex-1 bg-neutral-950 border border-neutral-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500"
                  value={newHandle}
                  onChange={(e) => setNewHandle(e.target.value)}
                />
                <button 
                  type="submit"
                  disabled={actionLoading}
                  className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  {actionLoading ? '...' : 'Agregar'}
                </button>
              </form>
            </div>

            {/* Users List */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-neutral-950 text-neutral-400 text-xs uppercase font-semibold">
                  <tr>
                    <th className="p-4">Handle</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4">Última Act.</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {users.map(user => (
                    <tr key={user.handle} className="hover:bg-neutral-800/50 transition-colors">
                      <td className="p-4 font-medium">{user.handle}</td>
                      <td className="p-4">
                        {user.is_hidden ? (
                          <span className="bg-red-500/10 text-red-500 px-2 py-1 rounded text-xs border border-red-500/20">Oculto</span>
                        ) : (
                          <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded text-xs border border-green-500/20">Visible</span>
                        )}
                      </td>
                      <td className="p-4 text-neutral-400 text-sm">
                        {user.last_updated ? new Date(user.last_updated).toLocaleString() : '-'}
                      </td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        <button 
                          onClick={() => toggleVisibility(user.handle, user.is_hidden)}
                          className="p-1 hover:bg-neutral-800 rounded transition-colors text-neutral-400 hover:text-white"
                          title={user.is_hidden ? "Mostrar usuario" : "Ocultar usuario"}
                        >
                          {user.is_hidden ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                        
                        <button 
                          onClick={() => toggleEnabled(user.handle, user.enabled)}
                          className={`p-1 hover:bg-neutral-800 rounded transition-colors ${user.enabled ? 'text-green-500 hover:text-green-400' : 'text-red-500 hover:text-red-400'}`}
                          title={user.enabled ? "Deshabilitar tracking" : "Habilitar tracking"}
                        >
                          {user.enabled ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                        </button>

                         <button 
                          onClick={() => handleManualTrack(user.handle)}
                          className={`p-1 hover:bg-neutral-800 rounded transition-colors ${loadingUsers[user.handle] ? 'animate-spin text-blue-500' : 'text-neutral-400 hover:text-blue-400'}`}
                          title="Forzar actualización ahora"
                          disabled={loadingUsers[user.handle]}
                        >
                          <RefreshCw className="w-5 h-5" />
                        </button>

                         <button 
                          onClick={() => handleRenameUser(user.handle)}
                          className="p-1 hover:bg-neutral-800 rounded transition-colors text-neutral-400 hover:text-amber-500"
                          title="Renombrar usuario"
                        >
                          <Edit className="w-5 h-5" />
                        </button>

                         <button 
                          onClick={() => handleDeleteUser(user.handle)}
                          className="p-1 hover:bg-neutral-800 rounded transition-colors text-neutral-400 hover:text-red-500"
                          title="Eliminar usuario permanentemente"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-neutral-500">No hay usuarios</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {view === 'audit' && (
          <div className="space-y-4">
             {/* Filter Controls */}
             <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-wrap gap-4 items-end">
                  <div className="flex flex-col gap-1">
                      <label className="text-xs text-neutral-400 flex items-center gap-1"><Calendar className="w-3 h-3" /> Desde</label>
                      <input 
                          type="date" 
                          className="bg-neutral-950 border border-neutral-800 text-white text-sm px-3 py-1.5 rounded-lg focus:outline-none focus:border-blue-500"
                          value={filters.startDate}
                          onChange={(e) => applyFilter('startDate', e.target.value)}
                      />
                  </div>
                  <div className="flex flex-col gap-1">
                      <label className="text-xs text-neutral-400 flex items-center gap-1"><Calendar className="w-3 h-3" /> Hasta</label>
                      <input 
                          type="date" 
                          className="bg-neutral-950 border border-neutral-800 text-white text-sm px-3 py-1.5 rounded-lg focus:outline-none focus:border-blue-500"
                          value={filters.endDate}
                          onChange={(e) => applyFilter('endDate', e.target.value)}
                      />
                  </div>
                  <div className="flex-1"></div>
                  {(Object.keys(activeFilters).length > 0) && (
                      <button 
                        onClick={() => { setActiveFilters({}); setFilters({ ip: '', method: '', endpoint: '', startDate: '', endDate: '' }); fetchLogs(token, {}); }} 
                        className="text-xs text-neutral-400 hover:text-white underline pb-2"
                      >
                          Limpiar todo
                      </button>
                  )}
             </div>

             {/* Chip Filters Display */}
             {(Object.keys(activeFilters).length > 0) && (
                 <div className="flex gap-2 items-center text-sm flex-wrap">
                     <span className="text-neutral-400 text-xs">Filtros:</span>
                     {Object.entries(activeFilters).map(([key, val]) => (
                         <span key={key} className="bg-blue-600/20 text-blue-400 border border-blue-600/30 px-2 py-1 rounded-md flex items-center gap-1 text-xs">
                             {key}: {val}
                             <button onClick={() => clearFilter(key)}><X className="w-3 h-3" /></button>
                         </span>
                     ))}
                 </div>
             )}

             <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
             <div className="p-4 border-b border-neutral-800 bg-neutral-950/50 flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2"><Filter className="w-4 h-4" /> Auditoría</h3>
                <button onClick={() => fetchLogs(token, activeFilters)} className="text-xs text-blue-400 hover:text-blue-300">Refrescar</button>
             </div>
             <table className="w-full text-left text-sm">
                <thead className="bg-neutral-950 text-neutral-400 text-xs uppercase font-semibold">
                  <tr>
                    <th className="p-4">Tiempo</th>
                    <th className="p-4">Admin</th>
                    <th className="p-4">Acción</th>
                    <th className="p-4">Detalles</th>
                    <th className="p-4">IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-neutral-800/50">
                      <td className="p-4 text-neutral-400 whitespace-nowrap">
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
                          'bg-neutral-700 text-neutral-300'
                        }`}
                        onClick={() => applyFilter('method', log.action)} // method maps to action in backend
                        title={log.action}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4 text-neutral-300 font-mono text-xs">
                        {log.details ? JSON.stringify(log.details) : '-'}
                      </td>
                      <td className="p-4 text-neutral-500 text-xs font-mono">
                          {log.ip_address}
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                      <tr>
                          <td colSpan="5" className="p-8 text-center text-neutral-500">No se encontraron registros</td>
                      </tr>
                  )}
                </tbody>
             </table>
          </div>
          </div>
        )}

        {view === 'announcements' && (
            <div className="space-y-6">
                {/* Active Banner Card */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
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
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Megaphone className="w-5 h-5 text-green-500" /> Crear Nuevo Anuncio
                    </h3>
                    
                    <form onSubmit={handleSetBanner} className="space-y-4">
                        <div>
                            <label className="block text-sm text-neutral-400 mb-1">Mensaje</label>
                            <input 
                                type="text" 
                                className="w-full bg-neutral-950 border border-neutral-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500"
                                placeholder="Ej: Mantenimiento programado para esta noche..."
                                value={bannerMsg}
                                onChange={e => setBannerMsg(e.target.value)}
                                required
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-neutral-400 mb-1">Tipo</label>
                                <select 
                                    className="w-full bg-neutral-950 border border-neutral-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500"
                                    value={bannerType}
                                    onChange={e => setBannerType(e.target.value)}
                                >
                                    <option value="info">Información (Azul)</option>
                                    <option value="warning">Advertencia (Ambar)</option>
                                    <option value="error">Error / Crítico (Rojo)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-neutral-400 mb-1">Duración (Horas)</label>
                                <input 
                                    type="number" 
                                    className="w-full bg-neutral-950 border border-neutral-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500"
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
                                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-colors w-full sm:w-auto"
                            >
                                Publicar Anuncio Global
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}
