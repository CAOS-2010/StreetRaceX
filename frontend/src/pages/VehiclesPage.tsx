// Page: Vehicle management — add, activate, delete

import { useState, useEffect, useCallback } from 'react';
import { vehicleApi } from '../services/api';
import { Vehicle } from '../types';

const TIPO_LABELS: Record<string, string> = {
  auto: '🚗 Car',
  moto: '🏍️ Motorcycle',
  monopatin_electrico: '🛴 E-Scooter',
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
    } catch {
      setToast('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await vehicleApi.create({ ...form, anio: Number(form.anio) });
      showToast('Vehicle added! 🚗');
      setShowForm(false);
      setForm({ tipo_vehiculo: 'auto', marca: '', modelo: '', anio: new Date().getFullYear(), color: '', placa: '', modificaciones: '' });
      fetchVehicles();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Failed';
      showToast(`Error: ${msg}`);
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await vehicleApi.activate(id);
      showToast('Vehicle activated ✅');
      fetchVehicles();
    } catch {
      showToast('Failed to activate');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this vehicle?')) return;
    try {
      await vehicleApi.delete(id);
      showToast('Vehicle deleted');
      fetchVehicles();
    } catch {
      showToast('Failed to delete');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2 style={styles.title}>My Vehicles</h2>
        <p style={styles.subtitle}>Max 3 vehicles • Only 1 active at a time</p>
      </div>

      {toast && <div style={styles.toast}>{toast}</div>}

      {loading ? (
        <p style={styles.muted}>Loading...</p>
      ) : (
        <div style={styles.grid}>
          {vehicles.map((v) => (
            <div key={v.id} style={{ ...styles.card, borderColor: v.activo ? '#FF4500' : '#333' }}>
              {v.activo && <span style={styles.activeBadge}>ACTIVE</span>}
              <p style={styles.vehicleType}>{TIPO_LABELS[v.tipo_vehiculo]}</p>
              <p style={styles.vehicleName}>{v.marca} {v.modelo}</p>
              <p style={styles.vehicleMeta}>{v.anio}{v.color ? ` • ${v.color}` : ''}{v.placa ? ` • ${v.placa}` : ''}</p>
              {v.modificaciones && (
                <p style={styles.mods}>{v.modificaciones}</p>
              )}
              <div style={styles.actions}>
                {!v.activo && (
                  <button onClick={() => handleActivate(v.id)} style={styles.activateBtn}>
                    Set Active
                  </button>
                )}
                <button onClick={() => handleDelete(v.id)} style={styles.deleteBtn}>
                  Delete
                </button>
              </div>
            </div>
          ))}

          {vehicles.length < 3 && (
            <button onClick={() => setShowForm(!showForm)} style={styles.addCard}>
              <span style={{ fontSize: '2rem' }}>+</span>
              <span>Add Vehicle</span>
            </button>
          )}
        </div>
      )}

      {showForm && (
        <div style={styles.formCard}>
          <h3 style={{ color: '#eee', marginBottom: '1rem' }}>New Vehicle</h3>
          <form onSubmit={handleCreate} style={styles.form}>
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Type</label>
                <select
                  value={form.tipo_vehiculo}
                  onChange={(e) => setForm({ ...form, tipo_vehiculo: e.target.value })}
                  style={styles.input}
                >
                  <option value="auto">🚗 Car</option>
                  <option value="moto">🏍️ Motorcycle</option>
                  <option value="monopatin_electrico">🛴 E-Scooter</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Year</label>
                <input
                  type="number"
                  value={form.anio}
                  onChange={(e) => setForm({ ...form, anio: parseInt(e.target.value) })}
                  style={styles.input}
                  min={1900}
                  max={2025}
                  required
                />
              </div>
            </div>
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Brand</label>
                <input value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })} style={styles.input} required placeholder="Toyota" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Model</label>
                <input value={form.modelo} onChange={(e) => setForm({ ...form, modelo: e.target.value })} style={styles.input} required placeholder="Supra" />
              </div>
            </div>
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Color</label>
                <input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} style={styles.input} placeholder="White" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Plate</label>
                <input value={form.placa} onChange={(e) => setForm({ ...form, placa: e.target.value })} style={styles.input} placeholder="ABC-123" />
              </div>
            </div>
            <label style={styles.label}>Modifications</label>
            <textarea
              value={form.modificaciones}
              onChange={(e) => setForm({ ...form, modificaciones: e.target.value })}
              style={{ ...styles.input, height: '80px', resize: 'vertical' }}
              placeholder="2JZ-GTE, turbo HKS..."
            />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button type="submit" style={styles.submitBtn}>Add Vehicle</button>
              <button type="button" onClick={() => setShowForm(false)} style={styles.cancelBtn}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { padding: '1.5rem', maxWidth: '900px', margin: '0 auto' },
  header: { marginBottom: '1.5rem' },
  title: { color: '#eee', marginBottom: '0.25rem' },
  subtitle: { color: '#888', fontSize: '0.9rem' },
  toast: {
    background: '#1a3a1a', border: '1px solid #4CAF50', color: '#81c784',
    padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem',
  },
  muted: { color: '#666' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' },
  card: {
    background: '#1a1a1a', border: '2px solid #333', borderRadius: '10px',
    padding: '1.25rem', position: 'relative',
  },
  activeBadge: {
    position: 'absolute', top: '10px', right: '10px',
    background: '#FF4500', color: '#fff', fontSize: '0.65rem',
    padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold',
  },
  vehicleType: { color: '#888', fontSize: '0.85rem', margin: '0 0 0.25rem 0' },
  vehicleName: { color: '#eee', fontWeight: 'bold', fontSize: '1.1rem', margin: '0 0 0.25rem 0' },
  vehicleMeta: { color: '#888', fontSize: '0.8rem', margin: '0 0 0.5rem 0' },
  mods: { color: '#666', fontSize: '0.75rem', fontStyle: 'italic', margin: '0 0 0.75rem 0' },
  actions: { display: 'flex', gap: '0.5rem', marginTop: '0.75rem' },
  activateBtn: {
    background: '#FF4500', color: '#fff', border: 'none',
    padding: '0.4rem 0.75rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem',
  },
  deleteBtn: {
    background: 'transparent', color: '#f44336', border: '1px solid #f44336',
    padding: '0.4rem 0.75rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem',
  },
  addCard: {
    background: '#111', border: '2px dashed #444', borderRadius: '10px',
    padding: '1.25rem', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
    color: '#666', cursor: 'pointer', minHeight: '150px', fontSize: '0.9rem',
  },
  formCard: {
    background: '#1a1a1a', border: '1px solid #333', borderRadius: '10px',
    padding: '1.5rem', marginTop: '1.5rem',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  label: { color: '#aaa', fontSize: '0.8rem' },
  input: {
    background: '#111', border: '1px solid #333', color: '#eee',
    padding: '0.6rem 0.75rem', borderRadius: '6px', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box',
  },
  submitBtn: {
    background: '#FF4500', color: '#fff', border: 'none',
    padding: '0.6rem 1.5rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold',
  },
  cancelBtn: {
    background: 'transparent', color: '#888', border: '1px solid #444',
    padding: '0.6rem 1rem', borderRadius: '6px', cursor: 'pointer',
  },
};
