'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell } from 'lucide-react';
import { Button } from "@/components/ui/button";

export function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    // Poll every 5 minutes
    fetchNotifications();
    // Poll removed as requested
  }, []);

  const fetchNotifications = async () => {
    try {
      const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const res = await axios.get(`${getApiUrl()}/notifications`);
      
      const serverNotifs = res.data.data.notifications || [];
      
      // Filter out invalid/expired ones locally if needed, but API does it.
      // Check read state from localStorage
      const readIds = getReadIds();
      
      const processed = serverNotifs.map(n => ({
        ...n,
        isRead: readIds.includes(n.id)
      }));

      setNotifications(processed);
      setUnreadCount(processed.filter(n => !n.isRead).length);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setLoading(false);
    }
  };

  const getReadIds = () => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('read_notifications');
    return stored ? JSON.parse(stored) : [];
  };

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    localStorage.setItem('read_notifications', JSON.stringify(allIds));
    
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const toggleOpen = () => setIsOpen(!isOpen);

  if (loading && notifications.length === 0) return null;

  return (
    <div className="relative">
      <Button 
        variant="outline"
        size="icon"
        onClick={toggleOpen}
        className="relative"
      >
        <Bell className="h-[1.2rem] w-[1.2rem]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full z-10">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-popover border border-border rounded-xl shadow-2xl z-50 overflow-hidden text-popover-foreground">
            <div className="p-3 border-b border-border flex justify-between items-center bg-muted/40">
              <span className="font-semibold text-sm">Notificaciones</span>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  Marcar leídas
                </button>
              )}
            </div>
            
            <div className="max-h-80 overflow-y-auto bg-card">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-sm">
                  No hay notificaciones
                </div>
              ) : (
                notifications.map(notif => (
                  <div 
                    key={notif.id}
                    className={`p-4 border-b border-border last:border-0 hover:bg-muted/50 transition-colors ${!notif.isRead ? 'bg-primary/5' : ''}`}
                  >
                    <div className="flex gap-3">
                      <div className="mt-1">
                        {notif.type === 'CONTEST' && <span className="text-xl">🏆</span>}
                        {notif.type === 'RANK_UP' && <span className="text-xl">🚀</span>}
                        {notif.type === 'SYSTEM' && <span className="text-xl">📢</span>}
                      </div>
                      <div>
                        <p className={`text-sm ${!notif.isRead ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                          {notif.message}
                        </p>
                        <span className="text-xs text-muted-foreground mt-1 block">
                          {new Date(notif.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
