'use client';

import { useState } from 'react';
import axios from 'axios';
import { Send, Bell, Link as LinkIcon } from 'lucide-react';

export function CreateNotification({ token, onSuccess }) {
    const [message, setMessage] = useState('');
    const [type, setType] = useState('SYSTEM');
    const [link, setLink] = useState('');
    const [expireHours, setExpireHours] = useState(24);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message) return;

        setLoading(true);
        try {
            const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
            await axios.post(
                `${getApiUrl()}/notifications`,
                { message, type, link, expireHours },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setMessage('');
            setLink('');
            alert('Notificación enviada exitosamente');
            if (onSuccess) onSuccess();
        } catch (err) {
            alert('Error al enviar notificación: ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-purple-500" /> Crear Notificación
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs text-neutral-400 mb-1">Mensaje</label>
                    <textarea 
                        className="w-full bg-neutral-950 border border-neutral-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-purple-500 min-h-[80px]"
                        placeholder="Escribe el contenido de la notificación..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs text-neutral-400 mb-1">Tipo</label>
                        <select 
                            className="w-full bg-neutral-950 border border-neutral-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-purple-500"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                        >
                            <option value="SYSTEM">📢 Sistema (Info)</option>
                            <option value="CONTEST">🏆 Contest</option>
                            <option value="RANK_UP">🚀 Rank Up</option>
                            <option value="WARNING">⚠️ Advertencia</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs text-neutral-400 mb-1 flex items-center gap-1"><LinkIcon className="w-3 h-3"/> Enlace de Redirección (Opcional)</label>
                        <input 
                            type="text" 
                            className="w-full bg-neutral-950 border border-neutral-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-purple-500"
                            placeholder="https://... o /ruta"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-neutral-400 mb-1">Expira en (Horas)</label>
                        <input 
                            type="number" 
                            min="1"
                            className="w-full bg-neutral-950 border border-neutral-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-purple-500"
                            value={expireHours}
                            onChange={(e) => setExpireHours(Number(e.target.value))}
                        />
                    </div>
                </div>

                <div className="flex justify-end">
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        {loading ? 'Enviando...' : <><Send className="w-4 h-4" /> Enviar Notificación</>}
                    </button>
                </div>
            </form>
        </div>
    );
}
