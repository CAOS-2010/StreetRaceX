// Page: Register

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
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Registration failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🏁 Join StreetRaceX</h1>
        <p style={styles.subtitle}>Start at Rank D — race your way to the top</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {[
            { name: 'username', label: 'Username', type: 'text', placeholder: 'SpeedMaster', hint: 'Min 3 characters. Letters, numbers and underscores only.' },
            { name: 'email', label: 'Email', type: 'email', placeholder: 'speed@race.com', hint: 'Must be a valid email address.' },
            { name: 'password', label: 'Password', type: 'password', placeholder: '6+ characters', hint: 'At least 6 characters.' },
            { name: 'zona_ciudad', label: 'City (optional)', type: 'text', placeholder: 'Bogotá', hint: null },
            { name: 'zona_pais', label: 'Country (optional)', type: 'text', placeholder: 'Colombia', hint: null },
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
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={styles.footer}>
          Already a pilot?{' '}
          <Link to="/login" style={styles.footerLink}>Sign in</Link>
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
    padding: '1rem',
  },
  card: {
    background: '#1a1a1a',
    padding: '2.5rem',
    borderRadius: '12px',
    border: '1px solid #333',
    width: '100%',
    maxWidth: '420px',
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
  form: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  label: { color: '#aaa', fontSize: '0.8rem', marginTop: '0.5rem', display: 'block' },
  hint: { color: '#666', fontSize: '0.72rem', margin: '2px 0 4px', padding: 0 },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    background: '#111',
    border: '1px solid #333',
    color: '#eee',
    padding: '0.6rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.9rem',
  },
  btn: {
    marginTop: '1.25rem',
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
