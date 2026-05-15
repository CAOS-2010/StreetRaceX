import { useState, useEffect, useCallback } from 'react';
import { challengeApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocketEvent } from '../hooks/useSocket';
import { Challenge, EstadoChallenge } from '../types';

const STATE_COLORS: Record<EstadoChallenge, string> = {
  pendiente: '#FFA500',
  aceptado: '#4169E1',
  rechazado: '#f44336',
  en_curso: '#9C27B0',
  completado: '#4CAF50',
  cancelado: '#444',
};

const STATE_LABELS: Record<EstadoChallenge, string> = {
  pendiente: 'Pendiente',
  aceptado: 'Aceptado',
  rechazado: 'Rechazado',
  en_curso: 'En Curso',
  completado: 'Completado',
  cancelado: 'Cancelado',
};

const TIPO_LABELS: Record<string, string> = {
  cuarto_milla: '🏁 Cuarto de Milla',
  vueltas: '🔄 Carrera por Vueltas',
  derrape: '💨 Derrape',
};

export function ChallengesPage() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [filter, setFilter] = useState<'all' | 'retador' | 'retado'>('all');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchChallenges = useCallback(async () => {
    try {
      const res = await challengeApi.getHistory({ rol: filter, page: 1 });
      setChallenges(res.data.data.challenges);
    } catch { showToast('Error al cargar retos'); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetchChallenges(); }, [fetchChallenges]);

  useSocketEvent('challenge:received', useCallback(() => { fetchChallenges(); }, [fetchChallenges]));
  useSocketEvent('challenge:accepted', useCallback(() => { fetchChallenges(); }, [fetchChallenges]));
  useSocketEvent('challenge:rejected', useCallback(() => { fetchChallenges(); }, [fetchChallenges]));
  useSocketEvent('challenge:completed', useCallback(() => { fetchChallenges(); }, [fetchChallenges]));

  const handleStatus = async (id: string, estado: string) => {
    try {
      await challengeApi.updateStatus(id, estado);
      showToast(`Reto ${estado} ✅`);
      fetchChallenges();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Error';
      showToast(`Error: ${msg}`);
    }
  };

  const handleResult = async (challenge: Challenge, winnerId: string) => {
    try {
      const res = await challengeApi.registerResult(challenge.id, winnerId);
      const { winnerRankUpgraded } = res.data.data;
      showToast(winnerRankUpgraded ? '🏆 ¡El ganador subió de rango!' : 'Resultado registrado ✅');
      fetchChallenges();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Error';
      showToast(`Error: ${msg}`);
    }
  };

  const FILTERS = [
    { key: 'all', label: 'Todos' },
    { key: 'retador', label: 'Enviados' },
    { key: 'retado', label: 'Recibidos' },
  ] as const;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2 style={styles.title}>Retos</h2>
        <div style={styles.filters}>
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{ ...styles.filterBtn, ...(filter === key ? styles.filterActive : {}) }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {toast && <div style={styles.toast}>{toast}</div>}

      {loading ? (
        <p style={styles.muted}>Cargando...</p>
      ) : challenges.length === 0 ? (
        <div style={styles.empty}>
          <p style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>⚔️</p>
          <p>No hay retos. ¡Ve a descubrir pilotos!</p>
        </div>
      ) : (
        <div style={styles.list}>
          {challenges.map((c) => {
            const isRetador = c.retador_id === user?.id;
            const isRetado = c.retado_id === user?.id;
            const stateColor = STATE_COLORS[c.estado];

            return (
              <div key={c.id} style={styles.card}>
                {/* Top accent */}
                <div style={{ ...styles.cardAccent, background: stateColor }} />

                <div style={styles.cardBody}>
                  <div style={styles.cardTop}>
                    <div style={styles.cardMeta}>
                      <span style={{ ...styles.estado, color: stateColor }}>
                        ● {STATE_LABELS[c.estado]}
                      </span>
                      <span style={styles.tipo}>{TIPO_LABELS[c.tipo_carrera]}</span>
                    </div>
                    <p style={styles.participants}>
                      {isRetador ? '⚔️ Tú retaste' : '🎯 Te retaron'}
                    </p>
                  </div>

                  <div style={styles.details}>
                    {c.ubicacion_acordada && <span style={styles.detail}>📍 {c.ubicacion_acordada}</span>}
                    {c.fecha_acordada && <span style={styles.detail}>📅 {new Date(c.fecha_acordada).toLocaleDateString()}</span>}
                  </div>

                  {c.notas && <p style={styles.notes}>"{c.notas}"</p>}

                  {/* Actions */}
                  <div style={styles.actions}>
                    {isRetado && c.estado === 'pendiente' && (
                      <>
                        <button onClick={() => handleStatus(c.id, 'aceptado')} style={styles.acceptBtn}>✓ Aceptar</button>
                        <button onClick={() => handleStatus(c.id, 'rechazado')} style={styles.rejectBtn}>✗ Rechazar</button>
                      </>
                    )}

                    {isRetador && c.estado === 'pendiente' && (
                      <button
                        onClick={() => challengeApi.cancel(c.id).then(() => { fetchChallenges(); showToast('Reto cancelado'); })}
                        style={styles.cancelBtn}
                      >
                        Cancelar
                      </button>
                    )}

                    {(c.estado === 'aceptado' || c.estado === 'en_curso') && (isRetador || isRetado) && (
                      <div style={styles.resultSection}>
                        <span style={styles.resultLabel}>Registrar resultado:</span>
                        <button onClick={() => handleResult(c, user!.id)} style={styles.winBtn}>🏆 Yo Gané</button>
                        <button
                          onClick={() => handleResult(c, isRetador ? c.retado_id : c.retador_id)}
                          style={styles.loseBtn}
                        >
                          Ganó el rival
                        </button>
                      </div>
                    )}

                    {c.estado === 'completado' && c.ganador_id && (
                      <p style={{ ...styles.winner, color: c.ganador_id === user?.id ? '#FFD700' : '#555' }}>
                        {c.ganador_id === user?.id ? '🏆 ¡Ganaste!' : '💀 Perdiste'}
                      </p>
                    )}
                  </div>
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
  page: { padding: '1.5rem', maxWidth: '800px', margin: '0 auto' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' },
  title: { fontFamily: "'Orbitron', monospace", color: '#fff', fontSize: '1.3rem', fontWeight: 700 },
  filters: { display: 'flex', gap: '0.4rem' },
  filterBtn: {
    background: '#111', color: '#555', border: '1px solid #1e1e1e',
    padding: '0.35rem 1rem', borderRadius: '20px', cursor: 'pointer',
    fontSize: '0.8rem', fontWeight: 600, fontFamily: "'Rajdhani', sans-serif",
  },
  filterActive: { background: '#FF4500', color: '#fff', borderColor: '#FF4500' },
  toast: {
    background: 'rgba(76,175,80,0.08)', border: '1px solid rgba(76,175,80,0.3)',
    color: '#81c784', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem',
  },
  muted: { color: '#555' },
  empty: { textAlign: 'center', color: '#555', padding: '4rem 2rem', border: '1px dashed #1e1e1e', borderRadius: '10px' },
  list: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  card: { background: '#111', border: '1px solid #1e1e1e', borderRadius: '10px', overflow: 'hidden' },
  cardAccent: { height: '3px', width: '100%' },
  cardBody: { padding: '1.1rem' },
  cardTop: { marginBottom: '0.6rem' },
  cardMeta: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' },
  estado: { fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5px' },
  tipo: { color: '#777', fontSize: '0.85rem' },
  participants: { color: '#bbb', fontSize: '0.9rem', fontWeight: 600 },
  details: { display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.5rem' },
  detail: { color: '#555', fontSize: '0.78rem' },
  notes: { color: '#444', fontSize: '0.82rem', fontStyle: 'italic', marginBottom: '0.5rem' },
  actions: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #1a1a1a' },
  acceptBtn: { background: '#4CAF50', color: '#fff', border: 'none', padding: '0.4rem 0.9rem', borderRadius: '5px', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', fontFamily: "'Rajdhani', sans-serif" },
  rejectBtn: { background: 'transparent', color: '#f44336', border: '1px solid #f44336', padding: '0.4rem 0.9rem', borderRadius: '5px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700 },
  cancelBtn: { background: 'transparent', color: '#555', border: '1px solid #222', padding: '0.4rem 0.8rem', borderRadius: '5px', cursor: 'pointer', fontSize: '0.8rem' },
  resultSection: { display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' },
  resultLabel: { color: '#555', fontSize: '0.75rem' },
  winBtn: { background: '#FFD700', color: '#000', border: 'none', padding: '0.4rem 0.9rem', borderRadius: '5px', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', fontFamily: "'Rajdhani', sans-serif" },
  loseBtn: { background: 'transparent', color: '#666', border: '1px solid #222', padding: '0.4rem 0.8rem', borderRadius: '5px', cursor: 'pointer', fontSize: '0.8rem' },
  winner: { fontWeight: 700, fontSize: '0.95rem' },
};
