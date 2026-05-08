// Page: Notifications with real-time updates

import { useState, useEffect, useCallback } from 'react';
import { notificationApi } from '../services/api';
import { useSocketEvent } from '../hooks/useSocket';
import { Notification } from '../types';

const TIPO_ICONS: Record<string, string> = {
  reto_recibido: '⚔️',
  reto_aceptado: '✅',
  reto_rechazado: '❌',
  resultado: '🏁',
  rango_subido: '🏆',
};

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notificationApi.getAll({ limit: 50 });
      setNotifications(res.data.data.notifications);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  // Add new real-time notifications at the top
  useSocketEvent('notification:new', useCallback((data: unknown) => {
    const notif = data as Notification;
    setNotifications((prev) => [notif, ...prev]);
  }, []));

  const handleMarkRead = async (id: string) => {
    try {
      await notificationApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leida: true } : n)),
      );
    } catch {
      // ignore
    }
  };

  const handleMarkAll = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, leida: true })));
    } catch {
      // ignore
    }
  };

  const unread = notifications.filter((n) => !n.leida).length;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2 style={styles.title}>
          Notifications{unread > 0 && <span style={styles.badge}>{unread}</span>}
        </h2>
        {unread > 0 && (
          <button onClick={handleMarkAll} style={styles.markAllBtn}>
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <p style={styles.muted}>Loading...</p>
      ) : notifications.length === 0 ? (
        <div style={styles.empty}>No notifications yet. Go race! 🏁</div>
      ) : (
        <div style={styles.list}>
          {notifications.map((n) => (
            <div
              key={n.id}
              style={{ ...styles.item, background: n.leida ? '#111' : '#1a1a1a', borderColor: n.leida ? '#222' : '#333' }}
              onClick={() => !n.leida && handleMarkRead(n.id)}
            >
              <span style={styles.icon}>{TIPO_ICONS[n.tipo] ?? '🔔'}</span>
              <div style={styles.content}>
                <p style={styles.message}>{n.mensaje}</p>
                <p style={styles.time}>{new Date(n.created_at).toLocaleString()}</p>
              </div>
              {!n.leida && <span style={styles.dot} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { padding: '1.5rem', maxWidth: '700px', margin: '0 auto' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' },
  title: { color: '#eee', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  badge: {
    background: '#FF4500', color: '#fff', borderRadius: '20px',
    padding: '2px 8px', fontSize: '0.75rem', fontWeight: 'bold',
  },
  markAllBtn: {
    background: 'transparent', color: '#888', border: '1px solid #444',
    padding: '0.4rem 0.75rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem',
  },
  muted: { color: '#666' },
  empty: { textAlign: 'center', color: '#888', padding: '3rem', border: '1px dashed #333', borderRadius: '8px' },
  list: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  item: {
    border: '1px solid #333', borderRadius: '8px', padding: '1rem',
    display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer',
  },
  icon: { fontSize: '1.25rem', flexShrink: 0 },
  content: { flex: 1 },
  message: { color: '#eee', margin: '0 0 0.25rem 0', fontSize: '0.9rem' },
  time: { color: '#666', fontSize: '0.75rem', margin: 0 },
  dot: {
    width: '8px', height: '8px', borderRadius: '50%',
    background: '#FF4500', flexShrink: 0, marginTop: '4px',
  },
};
