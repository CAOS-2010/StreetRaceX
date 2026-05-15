import { useState, useEffect, useCallback } from 'react';
import { vehicleApi } from '../services/api';
import { Vehicle } from '../types';

const TIPO_LABELS: Record<string, string> = {
  auto: '🚗 Automóvil',
  moto: '🏍️ Motocicleta',
  monopatin_electrico: '🛴 Monopatín Eléctrico',
};

const TIPO_BG: Record<string, string> = {
  auto: '#FF4500',
  moto: '#4169E1',
  monopatin_electrico: '#32CD32',
};

export function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState('');
  const [form, setForm] = useState({
    tipo_vehiculo: 'auto',
    marca: '',
    modelo: '',
    anio: new Date().getFullYear(),
    color: '',
    placa: '',
    modificaciones: '',
  });

  const fetchVehicles = useCallback(async () => {
    try {
      const res = await vehicleApi.getAll();
      setVehicles(res.data.data);
    } catch { setToast('Error al cargar vehículos'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await vehicleApi.create({ ...form, anio: Number(form.anio) });
      showToast('Vehículo agregado 🚗');
      setShowForm(false);
      setForm({ tipo_vehiculo: 'auto', marca: '', modelo: '', anio: new Date().getFullYear(), color: '', placa: '', modificaciones: '' });
      fetchVehicles();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Error';
      showToast(`Error: ${msg}`);
    }
  };

  const handleActivate = async (id: string) => {
    try { await vehicleApi.activate(id); showToast('Vehículo activado ✅'); fetchVehicles(); }
    catch { showToast('Error al activar'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este vehículo?')) return;
    try { await vehicleApi.delete(id); showToast('Vehículo eliminado'); fetchVehicles(); }
    catch { showToast('Error al eliminar'); }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Mis Vehículos</h2>
          <p style={styles.subtitle}>Máximo 3 vehículos · Solo 1 activo a la vez</p>
        </div>
        {vehicles.length < 3 && (
          <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
            {showForm ? '✕ Cancelar' : '+ Agregar Vehículo'}
          </button>
        )}
      </div>

      {toast && <div style={styles.toast}>{toast}</div>}

      {loading ? (
        <p style={styles.muted}>Cargando...</p>
      ) : (
        <div style={styles.grid}>
          {vehicles.map((v) => {
            const tc = TIPO_BG[v.tipo_vehiculo] ?? '#FF4500';
            return (
              <div key={v.id} style={{ ...styles.card, borderColor: v.activo ? '#FF4500' : '#1e1e1e' }}>
                <div style={{ ...styles.cardTop, background: `linear-gradient(135deg, ${tc}22, transparent)` }}>
                  {v.activo && <span style={styles.activeBadge}>● ACTIVO</span>}
                  <p style={styles.vehicleIcon}>{TIPO_LABELS[v.tipo_vehiculo]}</p>
                  <p style={styles.vehicleName}>{v.marca} {v.modelo}</p>
                  <p style={styles.vehicleMeta}>
                    {v.anio}{v.color ? ` · ${v.color}` : ''}{v.placa ? ` · ${v.placa}` : ''}
                  </p>
                </div>
                {v.modificaciones && (
                  <div style={styles.mods}>
                    <p style={styles.modsText}>🔧 {v.modificaciones}</p>
                  </div>
                )}
                <div style={styles.actions}>
                  {!v.activo && (
                    <button onClick={() => handleActivate(v.id)} style={styles.activateBtn}>
                      Activar
                    </button>
                  )}
                  <button onClick={() => handleDelete(v.id)} style={styles.deleteBtn}>
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}

          {vehicles.length === 0 && !showForm && (
            <div style={styles.emptyCard}>
              <p style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🚗</p>
              <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Sin vehículos</p>
              <p style={{ fontSize: '0.8rem' }}>Agrega tu primer vehículo para poder competir</p>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>Nuevo Vehículo</h3>
          <form onSubmit={handleCreate} style={styles.form}>
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Tipo</label>
                <select value={form.tipo_vehiculo} onChange={(e) => setForm({ ...form, tipo_vehiculo: e.target.value })} style={styles.input}>
                  <option value="auto">🚗 Automóvil</option>
                  <option value="moto">🏍️ Motocicleta</option>
                  <option value="monopatin_electrico">🛴 Monopatín Eléctrico</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Año</label>
                <input type="number" value={form.anio} onChange={(e) => setForm({ ...form, anio: parseInt(e.target.value) })} style={styles.input} min={1900} max={2026} required />
              </div>
            </div>
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Marca</label>
                <input value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })} style={styles.input} required placeholder="Toyota" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Modelo</label>
                <input value={form.modelo} onChange={(e) => setForm({ ...form, modelo: e.target.value })} style={styles.input} required placeholder="Supra" />
              </div>
            </div>
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Color</label>
                <input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} style={styles.input} placeholder="Naranja" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Placa</label>
                <input value={form.placa} onChange={(e) => setForm({ ...form, placa: e.target.value })} style={styles.input} placeholder="ABC-123" />
              </div>
            </div>
            <label style={styles.label}>Modificaciones</label>
            <textarea
              value={form.modificaciones}
              onChange={(e) => setForm({ ...form, modificaciones: e.target.value })}
              style={{ ...styles.input, height: '80px', resize: 'vertical' }}
              placeholder="Motor 2JZ-GTE, turbo HKS, escape deportivo..."
            />
            <button type="submit" style={styles.submitBtn}>Agregar Vehículo</button>
          </form>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { padding: '1.5rem', maxWidth: '900px', margin: '0 auto' },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' },
  title: { fontFamily: "'Orbitron', monospace", color: '#fff', fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.25rem' },
  subtitle: { color: '#555', fontSize: '0.85rem' },
  addBtn: {
    background: '#FF4500', color: '#fff', border: 'none',
    padding: '0.6rem 1.1rem', borderRadius: '6px', cursor: 'pointer',
    fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.5px', fontFamily: "'Rajdhani', sans-serif",
    whiteSpace: 'nowrap',
  },
  toast: {
    background: 'rgba(76,175,80,0.08)', border: '1px solid rgba(76,175,80,0.3)',
    color: '#81c784', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem',
  },
  muted: { color: '#555' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '1rem' },
  card: {
    background: '#111', border: '2px solid', borderRadius: '10px',
    overflow: 'hidden', display: 'flex', flexDirection: 'column',
  },
  cardTop: { padding: '1.25rem', borderBottom: '1px solid #1a1a1a' },
  activeBadge: { color: '#FF4500', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '1px', display: 'block', marginBottom: '0.5rem' },
  vehicleIcon: { color: '#888', fontSize: '0.9rem', margin: '0 0 0.4rem 0' },
  vehicleName: { color: '#eee', fontWeight: 700, fontSize: '1.1rem', margin: '0 0 0.25rem 0' },
  vehicleMeta: { color: '#555', fontSize: '0.8rem', margin: 0 },
  mods: { padding: '0.75rem 1.25rem', borderBottom: '1px solid #1a1a1a' },
  modsText: { color: '#444', fontSize: '0.75rem', fontStyle: 'italic', margin: 0 },
  actions: { display: 'flex', gap: '0.5rem', padding: '0.75rem 1.25rem' },
  activateBtn: {
    background: '#FF4500', color: '#fff', border: 'none',
    padding: '0.4rem 0.85rem', borderRadius: '5px', cursor: 'pointer',
    fontSize: '0.8rem', fontWeight: 700, fontFamily: "'Rajdhani', sans-serif",
  },
  deleteBtn: {
    background: 'transparent', color: '#444', border: '1px solid #1e1e1e',
    padding: '0.4rem 0.85rem', borderRadius: '5px', cursor: 'pointer', fontSize: '0.8rem',
  },
  emptyCard: {
    background: '#0d0d0d', border: '2px dashed #1e1e1e', borderRadius: '10px',
    padding: '3rem 2rem', textAlign: 'center', color: '#444',
    gridColumn: '1 / -1',
  },
  formCard: { background: '#111', border: '1px solid #1e1e1e', borderRadius: '10px', padding: '1.5rem', marginTop: '1.5rem' },
  formTitle: { fontFamily: "'Orbitron', monospace", color: '#eee', fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  label: { color: '#555', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' },
  input: {
    background: '#0d0d0d', border: '1px solid #1e1e1e', color: '#eee',
    padding: '0.65rem 0.75rem', borderRadius: '6px', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box',
  },
  submitBtn: {
    background: '#FF4500', color: '#fff', border: 'none',
    padding: '0.75rem', borderRadius: '6px', cursor: 'pointer',
    fontWeight: 700, fontSize: '0.9rem', marginTop: '0.5rem',
    fontFamily: "'Rajdhani', sans-serif", letterSpacing: '1px',
  },
};
