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

const TIPO_COLORS: Record<string, string> = {
  reto_recibido: '#FF4500',
  reto_aceptado: '#4169E1',
  reto_rechazado: '#f44336',
  resultado: '#4CAF50',
  rango_subido: '#FFD700',
};

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notificationApi.getAll({ limit: 50 });
      setNotifications(res.data.data.notifications);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  useSocketEvent('notification:new', useCallback((data: unknown) => {
    const notif = data as Notification;
    setNotifications((prev) => [notif, ...prev]);
  }, []));

  const handleMarkRead = async (id: string) => {
    try {
      await notificationApi.markRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, leida: true } : n)));
    } catch { /* ignore */ }
  };

  const handleMarkAll = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, leida: true })));
    } catch { /* ignore */ }
  };

  const unread = notifications.filter((n) => !n.leida).length;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.titleRow}>
          <h2 style={styles.title}>Notificaciones</h2>
          {unread > 0 && <span style={styles.badge}>{unread}</span>}
        </div>
        {unread > 0 && (
          <button onClick={handleMarkAll} style={styles.markAllBtn}>
            Marcar todas leídas
          </button>
        )}
      </div>

      {loading ? (
        <p style={styles.muted}>Cargando...</p>
      ) : notifications.length === 0 ? (
        <div style={styles.empty}>
          <p style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔔</p>
          <p>Sin notificaciones. ¡Ve a competir!</p>
        </div>
      ) : (
        <div style={styles.list}>
          {notifications.map((n) => {
            const tc = TIPO_COLORS[n.tipo] ?? '#FF4500';
            return (
              <div
                key={n.id}
                style={{ ...styles.item, opacity: n.leida ? 0.55 : 1, cursor: n.leida ? 'default' : 'pointer' }}
                onClick={() => !n.leida && handleMarkRead(n.id)}
              >
                <div style={{ ...styles.iconBox, background: `${tc}18`, color: tc }}>
                  {TIPO_ICONS[n.tipo] ?? '🔔'}
                </div>
                <div style={styles.content}>
                  <p style={styles.message}>{n.mensaje}</p>
                  <p style={styles.time}>{new Date(n.created_at).toLocaleString('es-CO')}</p>
                </div>
                {!n.leida && <div style={{ ...styles.dot, background: tc }} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { padding: '1.5rem', maxWidth: '700px', margin: '0 auto' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' },
  titleRow: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  title: { fontFamily: "'Orbitron', monospace", color: '#fff', fontSize: '1.3rem', fontWeight: 700 },
  badge: {
    background: '#FF4500', color: '#fff', borderRadius: '20px',
    padding: '2px 10px', fontSize: '0.75rem', fontWeight: 700,
  },
  markAllBtn: {
    background: 'transparent', color: '#555', border: '1px solid #1e1e1e',
    padding: '0.4rem 0.85rem', borderRadius: '5px', cursor: 'pointer',
    fontSize: '0.78rem', fontWeight: 600, fontFamily: "'Rajdhani', sans-serif",
  },
  muted: { color: '#555' },
  empty: { textAlign: 'center', color: '#555', padding: '4rem 2rem', border: '1px dashed #1e1e1e', borderRadius: '10px' },
  list: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  item: {
    background: '#111', border: '1px solid #1e1e1e', borderRadius: '8px',
    padding: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.85rem',
    transition: 'background 0.15s',
  },
  iconBox: {
    width: '38px', height: '38px', borderRadius: '8px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.1rem', flexShrink: 0,
  },
  content: { flex: 1 },
  message: { color: '#ddd', margin: '0 0 0.25rem 0', fontSize: '0.9rem', lineHeight: 1.4 },
  time: { color: '#444', fontSize: '0.72rem' },
  dot: { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, marginTop: '6px' },
};
