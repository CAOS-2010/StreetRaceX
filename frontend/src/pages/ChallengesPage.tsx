// Page: Challenges — list, accept, reject, register result

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
  cancelado: '#666',
};

const TIPO_LABELS: Record<string, string> = {
  cuarto_milla: '🏁 1/4 Mile',
  vueltas: '🔄 Lap Race',
  derrape: '💨 Drift',
};

export function ChallengesPage() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [filter, setFilter] = useState<'all' | 'retador' | 'retado'>('all');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchChallenges = useCallback(async () => {
    try {
      const res = await challengeApi.getHistory({ rol: filter, page: 1 });
      setChallenges(res.data.data.challenges);
    } catch {
      showToast('Failed to load challenges');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchChallenges(); }, [fetchChallenges]);

  // Refresh on real-time events
  useSocketEvent('challenge:received', useCallback(() => { fetchChallenges(); }, [fetchChallenges]));
  useSocketEvent('challenge:accepted', useCallback(() => { fetchChallenges(); }, [fetchChallenges]));
  useSocketEvent('challenge:rejected', useCallback(() => { fetchChallenges(); }, [fetchChallenges]));
  useSocketEvent('challenge:completed', useCallback(() => { fetchChallenges(); }, [fetchChallenges]));

  const handleStatus = async (id: string, estado: string) => {
    try {
      await challengeApi.updateStatus(id, estado);
      showToast(`Challenge ${estado} ✅`);
      fetchChallenges();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Failed';
      showToast(`Error: ${msg}`);
    }
  };

  const handleResult = async (challenge: Challenge, winnerId: string) => {
    try {
      const res = await challengeApi.registerResult(challenge.id, winnerId);
      const { winnerRankUpgraded } = res.data.data;
      showToast(winnerRankUpgraded ? '🏆 Winner ranked up!' : 'Result registered ✅');
      fetchChallenges();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Failed';
      showToast(`Error: ${msg}`);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2 style={styles.title}>Challenges</h2>
        <div style={styles.filters}>
          {(['all', 'retador', 'retado'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{ ...styles.filterBtn, ...(filter === f ? styles.filterActive : {}) }}
            >
              {f === 'all' ? 'All' : f === 'retador' ? 'Sent' : 'Received'}
            </button>
          ))}
        </div>
      </div>

      {toast && <div style={styles.toast}>{toast}</div>}

      {loading ? (
        <p style={styles.muted}>Loading...</p>
      ) : challenges.length === 0 ? (
        <div style={styles.empty}>No challenges found. Go discover pilots!</div>
      ) : (
        <div style={styles.list}>
          {challenges.map((c) => {
            const isRetador = c.retador_id === user?.id;
            const isRetado = c.retado_id === user?.id;

            return (
              <div key={c.id} style={styles.card}>
                <div style={styles.cardTop}>
                  <span style={{ ...styles.estado, color: STATE_COLORS[c.estado] }}>
                    {c.estado.toUpperCase()}
                  </span>
                  <span style={styles.tipo}>{TIPO_LABELS[c.tipo_carrera]}</span>
                </div>

                <p style={styles.participants}>
                  {isRetador ? '⚔️ You challenged someone' : '🎯 You were challenged'}
                </p>

                {c.ubicacion_acordada && (
                  <p style={styles.meta}>📍 {c.ubicacion_acordada}</p>
                )}
                {c.fecha_acordada && (
                  <p style={styles.meta}>📅 {new Date(c.fecha_acordada).toLocaleDateString()}</p>
                )}
                {c.notas && <p style={styles.notes}>{c.notas}</p>}

                {/* Actions */}
                <div style={styles.actions}>
                  {/* Retado can accept/reject pending challenges */}
                  {isRetado && c.estado === 'pendiente' && (
                    <>
                      <button onClick={() => handleStatus(c.id, 'aceptado')} style={styles.acceptBtn}>Accept</button>
                      <button onClick={() => handleStatus(c.id, 'rechazado')} style={styles.rejectBtn}>Reject</button>
                    </>
                  )}

                  {/* Retador can cancel pending challenges */}
                  {isRetador && c.estado === 'pendiente' && (
                    <button onClick={() => challengeApi.cancel(c.id).then(() => { fetchChallenges(); showToast('Cancelled'); })} style={styles.cancelBtn}>
                      Cancel
                    </button>
                  )}

                  {/* Either party can register result on accepted/en_curso */}
                  {(c.estado === 'aceptado' || c.estado === 'en_curso') && (isRetador || isRetado) && (
                    <div style={styles.resultSection}>
                      <p style={{ color: '#888', fontSize: '0.8rem', margin: '0 0 0.5rem 0' }}>Register winner:</p>
                      <button onClick={() => handleResult(c, user!.id)} style={styles.winBtn}>I Won 🏆</button>
                      <button
                        onClick={() => {
                          const opponent = isRetador ? c.retado_id : c.retador_id;
                          handleResult(c, opponent);
                        }}
                        style={styles.loseBtn}
                      >
                        Opponent Won
                      </button>
                    </div>
                  )}

                  {c.estado === 'completado' && c.ganador_id && (
                    <p style={styles.winner}>
                      {c.ganador_id === user?.id ? '🏆 You won!' : '💀 You lost'}
                    </p>
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
  page: { padding: '1.5rem', maxWidth: '800px', margin: '0 auto' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' },
  title: { color: '#eee', margin: 0 },
  filters: { display: 'flex', gap: '0.5rem' },
  filterBtn: {
    background: '#1a1a1a', color: '#888', border: '1px solid #333',
    padding: '0.35rem 0.85rem', borderRadius: '20px', cursor: 'pointer', fontSize: '0.85rem',
  },
  filterActive: { background: '#FF4500', color: '#fff', borderColor: '#FF4500' },
  toast: { background: '#1a3a1a', border: '1px solid #4CAF50', color: '#81c784', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem' },
  muted: { color: '#666' },
  empty: { textAlign: 'center', color: '#888', padding: '3rem', border: '1px dashed #333', borderRadius: '8px' },
  list: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  card: { background: '#1a1a1a', border: '1px solid #333', borderRadius: '10px', padding: '1.25rem' },
  cardTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' },
  estado: { fontWeight: 'bold', fontSize: '0.8rem' },
  tipo: { color: '#888', fontSize: '0.9rem' },
  participants: { color: '#eee', margin: '0 0 0.5rem 0', fontSize: '0.95rem' },
  meta: { color: '#888', fontSize: '0.8rem', margin: '0.15rem 0' },
  notes: { color: '#aaa', fontSize: '0.85rem', fontStyle: 'italic', margin: '0.5rem 0' },
  actions: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem', alignItems: 'center' },
  acceptBtn: { background: '#4CAF50', color: '#fff', border: 'none', padding: '0.4rem 0.85rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' },
  rejectBtn: { background: '#f44336', color: '#fff', border: 'none', padding: '0.4rem 0.85rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' },
  cancelBtn: { background: 'transparent', color: '#888', border: '1px solid #444', padding: '0.4rem 0.75rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' },
  resultSection: { display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' },
  winBtn: { background: '#FFD700', color: '#000', border: 'none', padding: '0.4rem 0.85rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' },
  loseBtn: { background: 'transparent', color: '#888', border: '1px solid #444', padding: '0.4rem 0.75rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' },
  winner: { color: '#FFD700', fontWeight: 'bold' },
};
