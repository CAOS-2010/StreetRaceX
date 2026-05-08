// Navigation bar with notification badge

import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocketEvent } from '../hooks/useSocket';
import { notificationApi } from '../services/api';

const RANK_COLORS: Record<string, string> = {
  S: '#FFD700',
  A: '#FF4500',
  B: '#4169E1',
  C: '#32CD32',
  D: '#808080',
};

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = useCallback(async () => {
    try {
      const res = await notificationApi.getAll({ limit: 50 });
      const notifications = res.data.data.notifications;
      setUnreadCount(notifications.filter((n: { leida: boolean }) => !n.leida).length);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (user) fetchUnread();
  }, [user, fetchUnread]);

  useSocketEvent('notification:new', useCallback(() => {
    setUnreadCount((c) => c + 1);
  }, []));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>
        <Link to="/dashboard" style={styles.brandLink}>
          🏁 StreetRaceX
        </Link>
      </div>

      <div style={styles.links}>
        <Link to="/dashboard" style={styles.link}>Discover</Link>
        <Link to="/challenges" style={styles.link}>Challenges</Link>
        <Link to="/vehicles" style={styles.link}>Vehicles</Link>
        <Link to="/notifications" style={{ ...styles.link, position: 'relative' }}>
          Notifications
          {unreadCount > 0 && (
            <span style={styles.badge}>{unreadCount}</span>
          )}
        </Link>
      </div>

      <div style={styles.user}>
        <span style={{ ...styles.rank, color: RANK_COLORS[user.rango] ?? '#fff' }}>
          [{user.rango}]
        </span>
        <Link to="/profile" style={styles.link}>{user.username}</Link>
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </div>
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1.5rem',
    background: '#111',
    borderBottom: '2px solid #FF4500',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  brand: { fontSize: '1.25rem', fontWeight: 'bold' },
  brandLink: { color: '#FF4500', textDecoration: 'none' },
  links: { display: 'flex', gap: '1.5rem' },
  link: { color: '#eee', textDecoration: 'none', fontSize: '0.9rem' },
  user: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  rank: { fontWeight: 'bold', fontSize: '0.85rem' },
  badge: {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    background: '#FF4500',
    color: '#fff',
    borderRadius: '50%',
    width: '18px',
    height: '18px',
    fontSize: '0.65rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutBtn: {
    background: 'transparent',
    border: '1px solid #FF4500',
    color: '#FF4500',
    padding: '0.25rem 0.75rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
};
