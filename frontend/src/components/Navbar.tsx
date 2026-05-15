import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocketEvent } from '../hooks/useSocket';
import { notificationApi } from '../services/api';

const RANK_COLORS: Record<string, string> = {
  S: '#FFD700', A: '#FF4500', B: '#4169E1', C: '#32CD32', D: '#808080',
};

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = useCallback(async () => {
    try {
      const res = await notificationApi.getAll({ limit: 50 });
      const notifications = res.data.data.notifications;
      setUnreadCount(notifications.filter((n: { leida: boolean }) => !n.leida).length);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { if (user) fetchUnread(); }, [user, fetchUnread]);

  useSocketEvent('notification:new', useCallback(() => {
    setUnreadCount((c) => c + 1);
  }, []));

  const handleLogout = () => { logout(); navigate('/login'); };

  if (!user) return null;

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav style={styles.nav}>
      {/* Brand */}
      <Link to="/dashboard" style={styles.brand}>
        <span style={styles.brandText}>STREET<span style={styles.brandX}>RACE</span>X</span>
      </Link>

      {/* Links */}
      <div style={styles.links}>
        {[
          { to: '/dashboard', label: 'Descubrir' },
          { to: '/challenges', label: 'Retos' },
          { to: '/vehicles', label: 'Vehículos' },
        ].map(({ to, label }) => (
          <Link key={to} to={to} style={{ ...styles.link, ...(isActive(to) ? styles.linkActive : {}) }}>
            {label}
            {isActive(to) && <span style={styles.activeDot} />}
          </Link>
        ))}

        <Link to="/notifications" style={{ ...styles.link, position: 'relative', ...(isActive('/notifications') ? styles.linkActive : {}) }}>
          Notificaciones
          {unreadCount > 0 && <span style={styles.badge}>{unreadCount}</span>}
          {isActive('/notifications') && <span style={styles.activeDot} />}
        </Link>
      </div>

      {/* User */}
      <div style={styles.user}>
        <span style={{ ...styles.rankBadge, color: RANK_COLORS[user.rango] ?? '#fff' }}>
          {user.rango}
        </span>
        <Link to="/profile" style={styles.username}>{user.username}</Link>
        <button onClick={handleLogout} style={styles.logoutBtn}>Salir</button>
      </div>
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 1.5rem',
    height: '56px',
    background: '#0a0a0a',
    borderBottom: '2px solid #FF4500',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  brand: { display: 'flex', alignItems: 'center', textDecoration: 'none' },
  brandText: {
    fontFamily: "'Orbitron', monospace",
    fontSize: '1.1rem',
    fontWeight: 900,
    color: '#fff',
    letterSpacing: '1px',
  },
  brandX: { color: '#FF4500' },
  links: { display: 'flex', gap: '0.25rem' },
  link: {
    color: '#aaa',
    fontSize: '0.85rem',
    fontWeight: 600,
    letterSpacing: '0.5px',
    padding: '0.4rem 0.75rem',
    borderRadius: '4px',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    textDecoration: 'none',
  },
  linkActive: { color: '#fff' },
  activeDot: {
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    background: '#FF4500',
    display: 'block',
  },
  badge: {
    position: 'absolute',
    top: '2px',
    right: '2px',
    background: '#FF4500',
    color: '#fff',
    borderRadius: '50%',
    width: '16px',
    height: '16px',
    fontSize: '0.6rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
  },
  user: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  rankBadge: {
    fontFamily: "'Orbitron', monospace",
    fontWeight: 900,
    fontSize: '1rem',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: '2px solid currentColor',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  username: { color: '#eee', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' },
  logoutBtn: {
    background: 'transparent',
    border: '1px solid #333',
    color: '#666',
    padding: '0.25rem 0.65rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.5px',
  },
};
