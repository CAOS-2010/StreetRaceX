import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { userApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, Vehicle } from '../types';

const RANK_COLORS: Record<string, string> = {
  S: '#FFD700', A: '#FF4500', B: '#4169E1', C: '#32CD32', D: '#808080',
};

const RANK_NAMES: Record<string, string> = {
  S: 'Leyenda', A: 'Élite', B: 'Avanzado', C: 'Intermedio', D: 'Novato',
};

const TIPO_LABELS: Record<string, string> = {
  auto: '🚗 Automóvil', moto: '🏍️ Motocicleta', monopatin_electrico: '🛴 Monopatín Eléctrico',
};

export function ProfilePage() {
  const { user: me } = useAuth();
  const { id } = useParams<{ id?: string }>();
  const targetId = id ?? me?.id ?? '';

  const [profile, setProfile] = useState<{ user: User; vehicles: Vehicle[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!targetId) return;
    userApi.getById(targetId)
      .then((res) => setProfile(res.data.data))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [targetId]);

  if (loading) return <p style={{ color: '#555', padding: '2rem', fontWeight: 600 }}>Cargando perfil...</p>;
  if (!profile) return <p style={{ color: '#f44336', padding: '2rem' }}>Perfil no encontrado</p>;

  const { user, vehicles } = profile;
  const isOwnProfile = user.id === me?.id;
  const winRate = user.victorias + user.derrotas > 0
    ? Math.round((user.victorias / (user.victorias + user.derrotas)) * 100)
    : 0;
  const rc = RANK_COLORS[user.rango];

  return (
    <div style={styles.page}>
      {/* Banner */}
      <div style={{ ...styles.banner, background: `radial-gradient(ellipse at 20% 50%, ${rc}18 0%, transparent 60%), #0d0d0d` }}>
        <div style={styles.bannerInner}>
          <div style={{ ...styles.avatar, borderColor: rc }}>
            {user.username[0].toUpperCase()}
          </div>
          <div style={styles.bannerInfo}>
            <h2 style={styles.username}>
              {user.username}
              {isOwnProfile && <span style={styles.youBadge}> — tú</span>}
            </h2>
            <div style={styles.rankRow}>
              <span style={{ ...styles.rankBadge, color: rc, borderColor: rc }}>
                {user.rango}
              </span>
              <span style={{ color: rc, fontWeight: 700, fontSize: '1rem' }}>
                {RANK_NAMES[user.rango]}
              </span>
            </div>
            {user.zona_ciudad && (
              <p style={styles.zone}>📍 {user.zona_ciudad}{user.zona_pais ? `, ${user.zona_pais}` : ''}</p>
            )}
          </div>
        </div>
      </div>

      <div style={styles.content}>
        {/* Stats */}
        <div style={styles.statsGrid}>
          {[
            { label: 'Victorias', value: user.victorias, color: '#4CAF50' },
            { label: 'Derrotas', value: user.derrotas, color: '#f44336' },
            { label: 'Win Rate', value: `${winRate}%`, color: '#FF4500' },
            { label: 'Racha Actual', value: user.retos_consecutivos, color: '#FFD700' },
          ].map(({ label, value, color }) => (
            <div key={label} style={styles.statCard}>
              <span style={{ ...styles.statValue, color }}>{value}</span>
              <span style={styles.statLabel}>{label}</span>
            </div>
          ))}
        </div>

        {/* Rank Progress */}
        {user.rango !== 'S' && (
          <div style={styles.progressSection}>
            <div style={styles.progressHeader}>
              <p style={styles.progressLabel}>Progreso para subir de rango</p>
              <p style={{ ...styles.progressLabel, color: rc }}>{user.retos_consecutivos}/2 victorias consecutivas</p>
            </div>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${Math.min((user.retos_consecutivos / 2) * 100, 100)}%`, background: rc }} />
            </div>
          </div>
        )}

        {/* Vehicles */}
        <div>
          <h3 style={styles.sectionTitle}>Vehículos ({vehicles.length}/3)</h3>
          <div style={styles.vehicleList}>
            {vehicles.map((v) => (
              <div key={v.id} style={{ ...styles.vehicleCard, borderColor: v.activo ? rc : '#1e1e1e' }}>
                {v.activo && <span style={{ ...styles.activeBadge, background: rc }}>ACTIVO</span>}
                <p style={styles.vehicleType}>{TIPO_LABELS[v.tipo_vehiculo] ?? v.tipo_vehiculo}</p>
                <p style={styles.vehicleName}>{v.marca} {v.modelo}</p>
                <p style={styles.vehicleMeta}>{v.anio}{v.color ? ` · ${v.color}` : ''}</p>
                {v.modificaciones && <p style={styles.mods}>{v.modificaciones}</p>}
              </div>
            ))}
            {vehicles.length === 0 && (
              <p style={{ color: '#555', fontSize: '0.9rem' }}>Sin vehículos registrados</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: '800px', margin: '0 auto' },
  banner: {
    padding: '2rem 1.5rem',
    borderBottom: '1px solid #1a1a1a',
  },
  bannerInner: { display: 'flex', alignItems: 'center', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' },
  avatar: {
    width: '80px', height: '80px', borderRadius: '50%',
    background: '#1a1a1a', border: '3px solid',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '2rem', fontWeight: 700, color: '#fff', flexShrink: 0,
  },
  bannerInfo: { flex: 1 },
  username: { color: '#fff', fontFamily: "'Orbitron', monospace", fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' },
  youBadge: { color: '#555', fontSize: '0.8rem', fontFamily: 'inherit', fontWeight: 400 },
  rankRow: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' },
  rankBadge: {
    fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: '1rem',
    width: '36px', height: '36px', borderRadius: '50%', border: '2px solid',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  zone: { color: '#555', fontSize: '0.85rem' },
  content: { padding: '1.5rem' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' },
  statCard: {
    background: '#111', border: '1px solid #1e1e1e', borderRadius: '8px',
    padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem',
  },
  statValue: { fontFamily: "'Orbitron', monospace", fontSize: '1.4rem', fontWeight: 700 },
  statLabel: { color: '#555', fontSize: '0.72rem', letterSpacing: '0.5px', textTransform: 'uppercase' },
  progressSection: { marginBottom: '1.75rem' },
  progressHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' },
  progressLabel: { color: '#555', fontSize: '0.8rem', fontWeight: 600 },
  progressBar: { height: '6px', background: '#1a1a1a', borderRadius: '3px', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: '3px', transition: 'width 0.4s' },
  sectionTitle: { color: '#eee', fontFamily: "'Orbitron', monospace", fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', letterSpacing: '1px' },
  vehicleList: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' },
  vehicleCard: {
    background: '#111', border: '2px solid', borderRadius: '8px',
    padding: '1rem', position: 'relative',
  },
  activeBadge: {
    position: 'absolute', top: '8px', right: '8px',
    color: '#fff', fontSize: '0.6rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 700,
  },
  vehicleType: { color: '#555', fontSize: '0.8rem', margin: '0 0 0.3rem 0' },
  vehicleName: { color: '#eee', fontWeight: 700, margin: '0 0 0.2rem 0' },
  vehicleMeta: { color: '#555', fontSize: '0.78rem', margin: '0 0 0.25rem 0' },
  mods: { color: '#444', fontSize: '0.72rem', fontStyle: 'italic', margin: 0 },
};
