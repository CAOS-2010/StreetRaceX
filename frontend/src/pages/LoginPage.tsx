// Page: Login

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
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Login failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🏁 StreetRaceX</h1>
        <p style={styles.subtitle}>Sign in to your pilot account</p>

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

          <label style={styles.label}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
            placeholder="••••••••"
          />

          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={styles.footer}>
          New pilot?{' '}
          <Link to="/register" style={styles.footerLink}>
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0a0a0a',
  },
  card: {
    background: '#1a1a1a',
    padding: '2.5rem',
    borderRadius: '12px',
    border: '1px solid #333',
    width: '100%',
    maxWidth: '400px',
  },
  title: { textAlign: 'center', color: '#FF4500', marginBottom: '0.25rem' },
  subtitle: { textAlign: 'center', color: '#888', marginBottom: '1.5rem', fontSize: '0.9rem' },
  error: {
    background: '#3d0000',
    border: '1px solid #FF4500',
    color: '#ff6b6b',
    padding: '0.75rem',
    borderRadius: '6px',
    marginBottom: '1rem',
    fontSize: '0.85rem',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  label: { color: '#aaa', fontSize: '0.8rem', marginTop: '0.5rem' },
  input: {
    background: '#111',
    border: '1px solid #333',
    color: '#eee',
    padding: '0.6rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.9rem',
  },
  btn: {
    marginTop: '1rem',
    background: '#FF4500',
    color: '#fff',
    border: 'none',
    padding: '0.75rem',
    borderRadius: '6px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  footer: { textAlign: 'center', color: '#888', marginTop: '1.5rem', fontSize: '0.85rem' },
  footerLink: { color: '#FF4500', textDecoration: 'none' },
};
