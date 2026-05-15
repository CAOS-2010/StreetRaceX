import { useState, useEffect, useCallback } from 'react';
import { userApi, challengeApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocketEvent } from '../hooks/useSocket';
import { User } from '../types';

const RANK_COLORS: Record<string, string> = {
  S: '#FFD700', A: '#FF4500', B: '#4169E1', C: '#32CD32', D: '#808080',
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
      setError(msg ?? 'Error al cargar pilotos. Asegúrate de tener un vehículo activo.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPilots(); }, [fetchPilots]);

  useSocketEvent('rank:upgraded', useCallback(() => { fetchPilots(); }, [fetchPilots]));

  const sendChallenge = async (retadoId: string) => {
    setSending(true);
    try {
      await challengeApi.create({ retado_id: retadoId, tipo_carrera: challengeForm.tipo });
      setToast('¡Reto enviado! 🏁');
      setChallengeForm({ targetId: null, tipo: 'cuarto_milla' });
      setTimeout(() => setToast(''), 3000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Error al enviar reto';
      setToast(`Error: ${msg}`);
      setTimeout(() => setToast(''), 4000);
    } finally {
      setSending(false);
    }
  };

  const rankColor = RANK_COLORS[user?.rango ?? 'D'];

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Descubrir Pilotos</h2>
          <p style={styles.subtitle}>
            Pilotos de Rango{' '}
            <span style={{ color: rankColor, fontFamily: "'Orbitron', monospace", fontWeight: 700 }}>
              {user?.rango}
            </span>{' '}
            listos para competir
          </p>
        </div>
        <div style={{ ...styles.myRankBadge, color: rankColor, borderColor: rankColor }}>
          <span style={styles.myRankLabel}>MI RANGO</span>
          <span style={styles.myRankLetter}>{user?.rango}</span>
        </div>
      </div>

      {toast && <div style={styles.toast}>{toast}</div>}
      {error && <div style={styles.error}>{error}</div>}

      {loading ? (
        <p style={styles.muted}>Buscando rivales...</p>
      ) : pilots.length === 0 ? (
        <div style={styles.empty}>
          <p style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🏁</p>
          <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>No hay pilotos disponibles en tu rango</p>
          <p style={{ fontSize: '0.85rem' }}>Asegúrate de tener un vehículo activo configurado.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {pilots.map((pilot) => {
            const rc = RANK_COLORS[pilot.rango];
            const isSelected = challengeForm.targetId === pilot.id;
            return (
              <div key={pilot.id} style={{ ...styles.card, ...(isSelected ? styles.cardSelected : {}) }}>
                {/* Card stripe */}
                <div style={{ ...styles.cardStripe, background: rc }} />

                <div style={styles.cardInner}>
                  {/* Header */}
                  <div style={styles.cardHeader}>
                    <div style={{ ...styles.avatar, borderColor: rc }}>
                      {pilot.username[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={styles.username}>{pilot.username}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ ...styles.rankPill, color: rc, borderColor: rc }}>
                          RANGO {pilot.rango}
                        </span>
                        {pilot.zona_ciudad && (
                          <span style={styles.zone}>📍 {pilot.zona_ciudad}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={styles.statsRow}>
                    <div style={styles.stat}>
                      <span style={styles.statVal}>{pilot.victorias}</span>
                      <span style={styles.statLbl}>Victorias</span>
                    </div>
                    <div style={styles.statDivider} />
                    <div style={styles.stat}>
                      <span style={{ ...styles.statVal, color: '#f44336' }}>{pilot.derrotas}</span>
                      <span style={styles.statLbl}>Derrotas</span>
                    </div>
                    <div style={styles.statDivider} />
                    <div style={styles.stat}>
                      <span style={styles.statVal}>
                        {pilot.victorias + pilot.derrotas > 0
                          ? Math.round((pilot.victorias / (pilot.victorias + pilot.derrotas)) * 100)
                          : 0}%
                      </span>
                      <span style={styles.statLbl}>Win Rate</span>
                    </div>
                  </div>

                  {/* Challenge form / button */}
                  {isSelected ? (
                    <div style={styles.challengeForm}>
                      <select
                        value={challengeForm.tipo}
                        onChange={(e) => setChallengeForm({ ...challengeForm, tipo: e.target.value })}
                        style={styles.select}
                      >
                        <option value="cuarto_milla">🏁 Cuarto de Milla</option>
                        <option value="vueltas">🔄 Carrera por Vueltas</option>
                        <option value="derrape">💨 Derrape (Drift)</option>
                      </select>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => sendChallenge(pilot.id)} disabled={sending} style={styles.sendBtn}>
                          {sending ? '...' : '¡RETAR! 🏁'}
                        </button>
                        <button onClick={() => setChallengeForm({ targetId: null, tipo: 'cuarto_milla' })} style={styles.cancelBtn}>
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setChallengeForm({ targetId: pilot.id, tipo: 'cuarto_milla' })}
                      style={styles.challengeBtn}
                    >
                      ⚔️ Enviar Reto
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { padding: '1.5rem', maxWidth: '1100px', margin: '0 auto' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' },
  title: { fontFamily: "'Orbitron', monospace", color: '#fff', fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.3rem' },
  subtitle: { color: '#777', fontSize: '0.9rem' },
  myRankBadge: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    border: '2px solid', borderRadius: '10px', padding: '0.5rem 1rem', gap: '0.1rem',
  },
  myRankLabel: { fontSize: '0.6rem', letterSpacing: '1.5px', color: '#555', fontWeight: 700 },
  myRankLetter: { fontFamily: "'Orbitron', monospace", fontSize: '1.5rem', fontWeight: 900 },
  toast: {
    background: 'rgba(76,175,80,0.1)', border: '1px solid rgba(76,175,80,0.4)',
    color: '#81c784', padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1rem',
  },
  error: {
    background: 'rgba(255,69,0,0.08)', border: '1px solid rgba(255,69,0,0.3)',
    color: '#ff8070', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem',
  },
  muted: { color: '#555', textAlign: 'center', marginTop: '4rem', fontSize: '0.9rem' },
  empty: {
    textAlign: 'center', color: '#555', padding: '4rem 2rem',
    border: '1px dashed #222', borderRadius: '12px',
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '1rem' },
  card: {
    background: '#111',
    border: '1px solid #1e1e1e',
    borderRadius: '10px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'border-color 0.2s',
  },
  cardSelected: { borderColor: '#FF4500' },
  cardStripe: { height: '3px', width: '100%' },
  cardInner: { padding: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', flex: 1 },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  avatar: {
    width: '42px', height: '42px', borderRadius: '50%',
    background: '#1a1a1a', border: '2px solid',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1rem', fontWeight: 700, color: '#fff', flexShrink: 0,
  },
  username: { color: '#eee', fontWeight: 700, margin: '0 0 0.3rem 0', fontSize: '0.95rem' },
  rankPill: {
    fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.5px',
    fontFamily: "'Orbitron', monospace",
    border: '1px solid', borderRadius: '4px', padding: '1px 5px',
  },
  zone: { color: '#555', fontSize: '0.75rem' },
  statsRow: { display: 'flex', alignItems: 'center', background: '#0d0d0d', borderRadius: '6px', padding: '0.6rem 0' },
  stat: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.1rem' },
  statVal: { color: '#4CAF50', fontWeight: 700, fontSize: '1rem', fontFamily: "'Orbitron', monospace" },
  statLbl: { color: '#444', fontSize: '0.65rem', letterSpacing: '0.5px' },
  statDivider: { width: '1px', height: '24px', background: '#1e1e1e' },
  challengeForm: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  select: {
    background: '#0d0d0d', border: '1px solid #2a2a2a', color: '#eee',
    padding: '0.5rem 0.6rem', borderRadius: '6px', fontSize: '0.85rem', width: '100%',
  },
  sendBtn: {
    background: '#FF4500', color: '#fff', border: 'none',
    padding: '0.55rem 1rem', borderRadius: '6px', cursor: 'pointer',
    fontWeight: 700, flex: 1, fontSize: '0.85rem', letterSpacing: '0.5px',
    fontFamily: "'Rajdhani', sans-serif",
  },
  cancelBtn: {
    background: 'transparent', color: '#555', border: '1px solid #2a2a2a',
    padding: '0.55rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem',
  },
  challengeBtn: {
    background: 'transparent',
    color: '#FF4500',
    border: '1px solid #FF4500',
    padding: '0.55rem 1rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '0.85rem',
    letterSpacing: '0.5px',
    fontFamily: "'Rajdhani', sans-serif",
    width: '100%',
  },
};
