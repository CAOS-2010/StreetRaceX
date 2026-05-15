import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', zona_ciudad: '', zona_pais: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Error al registrar';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Left panel */}
      <div style={styles.leftPanel}>
        <div style={styles.leftContent}>
          <h1 style={styles.bigLogo}>STREET<br /><span style={styles.bigLogoRed}>RACE</span>X</h1>
          <p style={styles.tagline}>Reta. Compite. Asciende.</p>
          <div style={styles.infoBox}>
            <p style={styles.infoTitle}>Sistema de Rangos</p>
            <p style={styles.infoText}>Empieza en <strong style={{ color: '#808080' }}>Rango D</strong> y asciende ganando 2 retos consecutivos hasta llegar a <strong style={{ color: '#FFD700' }}>Rango S — Leyenda</strong>.</p>
          </div>
        </div>
        <div style={styles.stripe} />
      </div>

      {/* Right panel */}
      <div style={styles.rightPanel}>
        <div style={styles.card}>
          <h2 style={styles.title}>Unirse al Circuito</h2>
          <p style={styles.subtitle}>Crea tu cuenta de piloto — comenzarás en Rango D</p>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            {[
              { name: 'username', label: 'Username', type: 'text', placeholder: 'SpeedMaster', hint: 'Mín. 3 caracteres. Solo letras, números y guion bajo.' },
              { name: 'email', label: 'Email', type: 'email', placeholder: 'speed@race.com', hint: 'Debe ser un email válido.' },
              { name: 'password', label: 'Contraseña', type: 'password', placeholder: '6+ caracteres', hint: 'Al menos 6 caracteres.' },
              { name: 'zona_ciudad', label: 'Ciudad (opcional)', type: 'text', placeholder: 'Medellín', hint: null },
              { name: 'zona_pais', label: 'País (opcional)', type: 'text', placeholder: 'Colombia', hint: null },
            ].map(({ name, label, type, placeholder, hint }) => (
              <div key={name}>
                <label style={styles.label}>{label}</label>
                {hint && <p style={styles.hint}>{hint}</p>}
                <input
                  name={name}
                  type={type}
                  value={form[name as keyof typeof form]}
                  onChange={handleChange}
                  required={!['zona_ciudad', 'zona_pais'].includes(name)}
                  style={styles.input}
                  placeholder={placeholder}
                />
              </div>
            ))}

            <button type="submit" disabled={loading} style={styles.btn}>
              {loading ? 'Creando cuenta...' : 'Entrar al Circuito'}
            </button>
          </form>

          <p style={styles.footer}>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" style={styles.footerLink}>Iniciar sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { minHeight: '100vh', display: 'flex' },
  leftPanel: {
    flex: 1,
    background: '#080808',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  leftContent: { textAlign: 'center', padding: '2rem', zIndex: 1 },
  bigLogo: {
    fontFamily: "'Orbitron', monospace",
    fontSize: '3.5rem',
    fontWeight: 900,
    color: '#fff',
    lineHeight: 1,
    letterSpacing: '4px',
    marginBottom: '1rem',
  },
  bigLogoRed: { color: '#FF4500' },
  tagline: {
    color: '#888',
    fontSize: '1rem',
    fontWeight: 600,
    letterSpacing: '3px',
    textTransform: 'uppercase',
    marginBottom: '2.5rem',
  },
  infoBox: {
    background: 'rgba(255,69,0,0.06)',
    border: '1px solid rgba(255,69,0,0.2)',
    borderRadius: '8px',
    padding: '1rem 1.25rem',
    maxWidth: '320px',
    margin: '0 auto',
    textAlign: 'left',
  },
  infoTitle: { color: '#FF4500', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.5rem' },
  infoText: { color: '#888', fontSize: '0.85rem', lineHeight: 1.6 },
  stripe: {
    position: 'absolute',
    right: 0, top: 0, bottom: 0,
    width: '4px',
    background: 'linear-gradient(180deg, transparent 0%, #FF4500 30%, #FF4500 70%, transparent 100%)',
  },
  rightPanel: {
    width: '460px',
    minWidth: '340px',
    background: '#0d0d0d',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    borderLeft: '1px solid #1a1a1a',
  },
  card: { width: '100%' },
  title: {
    fontFamily: "'Orbitron', monospace",
    color: '#fff',
    fontSize: '1.3rem',
    fontWeight: 700,
    marginBottom: '0.35rem',
  },
  subtitle: { color: '#666', fontSize: '0.82rem', marginBottom: '1.5rem' },
  error: {
    background: 'rgba(255,69,0,0.08)',
    border: '1px solid rgba(255,69,0,0.4)',
    color: '#ff8070',
    padding: '0.75rem',
    borderRadius: '6px',
    marginBottom: '1rem',
    fontSize: '0.85rem',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '0.2rem' },
  label: { color: '#777', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', marginTop: '0.65rem', display: 'block' },
  hint: { color: '#444', fontSize: '0.7rem', margin: '2px 0 4px' },
  input: {
    background: '#141414',
    border: '1px solid #252525',
    color: '#f0f0f0',
    padding: '0.65rem 0.85rem',
    borderRadius: '6px',
    fontSize: '0.9rem',
    width: '100%',
  },
  btn: {
    marginTop: '1.25rem',
    background: '#FF4500',
    color: '#fff',
    border: 'none',
    padding: '0.85rem',
    borderRadius: '6px',
    fontSize: '0.95rem',
    cursor: 'pointer',
    fontWeight: 700,
    letterSpacing: '1px',
    textTransform: 'uppercase',
    fontFamily: "'Rajdhani', sans-serif",
  },
  footer: { textAlign: 'center', color: '#555', marginTop: '1.5rem', fontSize: '0.85rem' },
  footerLink: { color: '#FF4500', fontWeight: 600 },
};
