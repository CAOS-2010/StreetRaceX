// Page: Profile — own profile with stats

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { userApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, Vehicle } from '../types';

const RANK_COLORS: Record<string, string> = {
  S: '#FFD700', A: '#FF4500', B: '#4169E1', C: '#32CD32', D: '#808080',
};

const RANK_NAMES: Record<string, string> = {
  S: 'Legend', A: 'Elite', B: 'Advanced', C: 'Intermediate', D: 'Novice',
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

  if (loading) return <p style={{ color: '#888', padding: '2rem' }}>Loading profile...</p>;
  if (!profile) return <p style={{ color: '#f44336', padding: '2rem' }}>Profile not found</p>;

  const { user, vehicles } = profile;
  const isOwnProfile = user.id === me?.id;
  const winRate = user.victorias + user.derrotas > 0
    ? Math.round((user.victorias / (user.victorias + user.derrotas)) * 100)
    : 0;

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.avatar}>{user.username[0].toUpperCase()}</div>
        <div>
          <h2 style={styles.username}>
            {user.username}
            {isOwnProfile && <span style={styles.youBadge}> (You)</span>}
          </h2>
          <p style={{ ...styles.rank, color: RANK_COLORS[user.rango] }}>
            Rank {user.rango} — {RANK_NAMES[user.rango]}
          </p>
          {user.zona_ciudad && (
            <p style={styles.zone}>📍 {user.zona_ciudad}{user.zona_pais ? `, ${user.zona_pais}` : ''}</p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{user.victorias}</span>
          <span style={styles.statLabel}>Wins</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{user.derrotas}</span>
          <span style={styles.statLabel}>Losses</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{winRate}%</span>
          <span style={styles.statLabel}>Win Rate</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{user.retos_consecutivos}</span>
          <span style={styles.statLabel}>Win Streak</span>
        </div>
      </div>

      {/* Rank Progress */}
      {user.rango !== 'S' && (
        <div style={styles.progressSection}>
          <p style={styles.progressLabel}>
            Rank Up Progress: {user.retos_consecutivos}/2 consecutive wins
          </p>
          <div style={styles.progressBar}>
            <div
              style={{
                ...styles.progressFill,
                width: `${Math.min((user.retos_consecutivos / 2) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Vehicles */}
      <div style={styles.vehiclesSection}>
        <h3 style={styles.sectionTitle}>Vehicles ({vehicles.length}/3)</h3>
        <div style={styles.vehicleList}>
          {vehicles.map((v) => (
            <div key={v.id} style={{ ...styles.vehicleCard, borderColor: v.activo ? '#FF4500' : '#333' }}>
              {v.activo && <span style={styles.activeBadge}>ACTIVE</span>}
              <p style={styles.vehicleName}>{v.marca} {v.modelo}</p>
              <p style={styles.vehicleMeta}>{v.anio} · {v.tipo_vehiculo.replace('_', ' ')}</p>
              {v.modificaciones && <p style={styles.mods}>{v.modificaciones}</p>}
            </div>
          ))}
          {vehicles.length === 0 && (
            <p style={{ color: '#666', fontSize: '0.9rem' }}>No vehicles registered</p>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { padding: '1.5rem', maxWidth: '800px', margin: '0 auto' },
  header: { display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' },
  avatar: {
    width: '70px', height: '70px', borderRadius: '50%', background: '#FF4500',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.8rem', fontWeight: 'bold', color: '#fff', flexShrink: 0,
  },
  username: { color: '#eee', margin: '0 0 0.25rem 0' },
  youBadge: { color: '#888', fontSize: '0.75rem', fontWeight: 'normal' },
  rank: { margin: '0 0 0.25rem 0', fontWeight: 'bold' },
  zone: { color: '#888', fontSize: '0.85rem', margin: 0 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' },
  statCard: {
    background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px',
    padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
  },
  statValue: { color: '#FF4500', fontSize: '1.5rem', fontWeight: 'bold' },
  statLabel: { color: '#888', fontSize: '0.8rem' },
  progressSection: { marginBottom: '1.5rem' },
  progressLabel: { color: '#888', fontSize: '0.85rem', marginBottom: '0.5rem' },
  progressBar: { height: '8px', background: '#222', borderRadius: '4px', overflow: 'hidden' },
  progressFill: { height: '100%', background: '#FF4500', borderRadius: '4px', transition: 'width 0.3s' },
  vehiclesSection: {},
  sectionTitle: { color: '#eee', marginBottom: '1rem' },
  vehicleList: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' },
  vehicleCard: {
    background: '#1a1a1a', border: '2px solid #333', borderRadius: '8px',
    padding: '1rem', position: 'relative',
  },
  activeBadge: {
    position: 'absolute', top: '8px', right: '8px',
    background: '#FF4500', color: '#fff', fontSize: '0.6rem',
    padding: '2px 5px', borderRadius: '3px', fontWeight: 'bold',
  },
  vehicleName: { color: '#eee', fontWeight: 'bold', margin: '0 0 0.25rem 0' },
  vehicleMeta: { color: '#888', fontSize: '0.8rem', margin: '0 0 0.25rem 0' },
  mods: { color: '#666', fontSize: '0.75rem', fontStyle: 'italic', margin: 0 },
};
