// Page: Dashboard — discover pilots to challenge

import { useState, useEffect, useCallback } from 'react';
import { userApi, challengeApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocketEvent } from '../hooks/useSocket';
import { User } from '../types';

const RANK_COLORS: Record<string, string> = {
  S: '#FFD700', A: '#FF4500', B: '#4169E1', C: '#32CD32', D: '#808080',
};

const VEHICLE_ICONS: Record<string, string> = {
  auto: '🚗', moto: '🏍️', monopatin_electrico: '🛴',
};

export function DashboardPage() {
  const { user } = useAuth();
  const [pilots, setPilots] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [challengeForm, setChallengeForm] = useState<{ targetId: string | null; tipo: string }>({
    targetId: null,
    tipo: 'cuarto_milla',
  });
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState('');

  const fetchPilots = useCallback(async () => {
    try {
      setLoading(true);
      const res = await userApi.discover({ page: 1, limit: 20 });
      setPilots(res.data.data.users);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? 'Failed to load pilots. Make sure you have an active vehicle.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPilots(); }, [fetchPilots]);

  // Refresh when a challenge result comes in
  useSocketEvent('rank:upgraded', useCallback(() => { fetchPilots(); }, [fetchPilots]));

  const sendChallenge = async (retadoId: string) => {
    setSending(true);
    try {
      await challengeApi.create({ retado_id: retadoId, tipo_carrera: challengeForm.tipo });
      setToast('Challenge sent! 🏁');
      setChallengeForm({ targetId: null, tipo: 'cuarto_milla' });
      setTimeout(() => setToast(''), 3000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Failed to send challenge';
      setToast(`Error: ${msg}`);
      setTimeout(() => setToast(''), 4000);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2 style={styles.title}>Discover Pilots</h2>
        <p style={styles.subtitle}>
          Rank <span style={{ color: RANK_COLORS[user?.rango ?? 'D'], fontWeight: 'bold' }}>{user?.rango}</span> pilots ready to race
        </p>
      </div>

      {toast && <div style={styles.toast}>{toast}</div>}
      {error && <div style={styles.error}>{error}</div>}

      {loading ? (
        <p style={styles.muted}>Loading pilots...</p>
      ) : pilots.length === 0 ? (
        <div style={styles.empty}>
          <p>No pilots found at your rank with the same vehicle type.</p>
          <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Make sure you have an active vehicle set.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {pilots.map((pilot) => (
            <div key={pilot.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.avatar}>{pilot.username[0].toUpperCase()}</span>
                <div>
                  <p style={styles.username}>{pilot.username}</p>
                  <p style={{ ...styles.rankBadge, color: RANK_COLORS[pilot.rango] }}>Rank {pilot.rango}</p>
                </div>
              </div>

              <div style={styles.stats}>
                <span style={{ color: '#4CAF50' }}>✓ {pilot.victorias} W</span>
                <span style={{ color: '#f44336' }}>✗ {pilot.derrotas} L</span>
                {pilot.zona_ciudad && <span style={styles.zone}>📍 {pilot.zona_ciudad}</span>}
              </div>

              {challengeForm.targetId === pilot.id ? (
                <div style={styles.challengeForm}>
                  <select
                    value={challengeForm.tipo}
                    onChange={(e) => setChallengeForm({ ...challengeForm, tipo: e.target.value })}
                    style={styles.select}
                  >
                    <option value="cuarto_milla">1/4 Mile</option>
                    <option value="vueltas">Lap Race</option>
                    <option value="derrape">Drift</option>
                  </select>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => sendChallenge(pilot.id)}
                      disabled={sending}
                      style={styles.challengeBtn}
                    >
                      {sending ? '...' : 'Send! 🏁'}
                    </button>
                    <button
                      onClick={() => setChallengeForm({ targetId: null, tipo: 'cuarto_milla' })}
                      style={styles.cancelBtn}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setChallengeForm({ targetId: pilot.id, tipo: 'cuarto_milla' })}
                  style={styles.challengeBtn}
                >
                  Challenge
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { padding: '1.5rem', maxWidth: '1100px', margin: '0 auto' },
  header: { marginBottom: '1.5rem' },
  title: { color: '#eee', marginBottom: '0.25rem' },
  subtitle: { color: '#888', fontSize: '0.9rem' },
  toast: {
    background: '#1a3a1a',
    border: '1px solid #4CAF50',
    color: '#81c784',
    padding: '0.75rem 1rem',
    borderRadius: '6px',
    marginBottom: '1rem',
  },
  error: {
    background: '#3d0000',
    border: '1px solid #f44336',
    color: '#ff6b6b',
    padding: '0.75rem',
    borderRadius: '6px',
    marginBottom: '1rem',
  },
  muted: { color: '#666', textAlign: 'center', marginTop: '3rem' },
  empty: {
    textAlign: 'center',
    color: '#888',
    padding: '3rem',
    border: '1px dashed #333',
    borderRadius: '8px',
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' },
  card: {
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '10px',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#FF4500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#fff',
  },
  username: { color: '#eee', fontWeight: 'bold', margin: 0 },
  rankBadge: { fontSize: '0.8rem', margin: 0, fontWeight: 'bold' },
  stats: { display: 'flex', gap: '0.75rem', fontSize: '0.85rem', color: '#888' },
  zone: { color: '#888' },
  challengeForm: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  select: {
    background: '#111',
    border: '1px solid #444',
    color: '#eee',
    padding: '0.4rem',
    borderRadius: '4px',
    fontSize: '0.85rem',
  },
  challengeBtn: {
    background: '#FF4500',
    color: '#fff',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    flex: 1,
  },
  cancelBtn: {
    background: 'transparent',
    color: '#888',
    border: '1px solid #444',
    padding: '0.5rem 0.75rem',
    borderRadius: '6px',
    cursor: 'pointer',
  },
};
