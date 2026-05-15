import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Credenciales incorrectas';
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
          <h1 style={styles.bigLogo}>STREET<br /><span style={styles.bigLogoRed}>RACE</span><span style={styles.bigLogoX}>X</span></h1>
          <p style={styles.tagline}>Reta. Compite. Asciende.</p>
          <div style={styles.rankRow}>
            {[{ r: 'D', c: '#808080', n: 'Novato' }, { r: 'C', c: '#32CD32', n: 'Intermedio' }, { r: 'B', c: '#4169E1', n: 'Avanzado' }, { r: 'A', c: '#FF4500', n: 'Élite' }, { r: 'S', c: '#FFD700', n: 'Leyenda' }].map(({ r, c, n }) => (
              <div key={r} style={styles.rankItem}>
                <span style={{ ...styles.rankLetter, color: c, borderColor: c }}>{r}</span>
                <span style={styles.rankName}>{n}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={styles.stripe} />
      </div>

      {/* Right panel — form */}
      <div style={styles.rightPanel}>
        <div style={styles.card}>
          <h2 style={styles.title}>Iniciar Sesión</h2>
          <p style={styles.subtitle}>Accede a tu cuenta de piloto</p>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
              placeholder="speed@race.com"
            />

            <label style={styles.label}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
              placeholder="••••••••"
            />

            <button type="submit" disabled={loading} style={styles.btn}>
              {loading ? 'Ingresando...' : 'Entrar al Circuito'}
            </button>
          </form>

          <p style={styles.footer}>
            ¿Nuevo piloto?{' '}
            <Link to="/register" style={styles.footerLink}>Crear cuenta</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
  },
  leftPanel: {
    flex: 1,
    background: '#080808',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  leftContent: {
    textAlign: 'center',
    padding: '2rem',
    zIndex: 1,
  },
  bigLogo: {
    fontFamily: "'Orbitron', monospace",
    fontSize: '4rem',
    fontWeight: 900,
    color: '#fff',
    lineHeight: 1,
    letterSpacing: '4px',
    marginBottom: '1rem',
  },
  bigLogoRed: { color: '#FF4500' },
  bigLogoX: { color: '#fff' },
  tagline: {
    color: '#888',
    fontSize: '1.1rem',
    fontWeight: 600,
    letterSpacing: '3px',
    textTransform: 'uppercase',
    marginBottom: '2.5rem',
  },
  rankRow: { display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' },
  rankItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' },
  rankLetter: {
    fontFamily: "'Orbitron', monospace",
    fontWeight: 900,
    fontSize: '1.1rem',
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    border: '2px solid currentColor',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankName: { color: '#555', fontSize: '0.65rem', letterSpacing: '0.5px' },
  stripe: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '4px',
    background: 'linear-gradient(180deg, transparent 0%, #FF4500 30%, #FF4500 70%, transparent 100%)',
  },
  rightPanel: {
    width: '440px',
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
    fontSize: '1.4rem',
    fontWeight: 700,
    marginBottom: '0.35rem',
  },
  subtitle: { color: '#666', fontSize: '0.85rem', marginBottom: '1.75rem' },
  error: {
    background: 'rgba(255,69,0,0.08)',
    border: '1px solid rgba(255,69,0,0.4)',
    color: '#ff8070',
    padding: '0.75rem',
    borderRadius: '6px',
    marginBottom: '1rem',
    fontSize: '0.85rem',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { color: '#777', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', marginTop: '0.75rem' },
  input: {
    background: '#141414',
    border: '1px solid #252525',
    color: '#f0f0f0',
    padding: '0.7rem 0.85rem',
    borderRadius: '6px',
    fontSize: '0.95rem',
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
