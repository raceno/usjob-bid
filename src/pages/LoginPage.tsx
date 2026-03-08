import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { login } from '../api/client.ts';
import { useAuth } from '../AuthContext.tsx';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const auth = useAuth();

  // if already logged in redirect to home
  React.useEffect(() => {
    if (auth.token) {
      navigate('/', { replace: true });
    }
  }, [auth.token, navigate]);

  const mutation = useMutation({
    mutationFn: () => login(email, password),
    onSuccess: (data) => {
      auth.login(data.token);
      navigate('/', { replace: true });
    },
    onError: (err: any) => {
      // error state handled below by mutation.isError
      console.error('Login error', err);
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <div className="stack" style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h1>Log in</h1>
      <form onSubmit={onSubmit} className="stack">
        <div className="field">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="card-actions">
          <button className="btn btn-primary" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Signing in…' : 'Sign in'}
          </button>
        </div>
        {mutation.isError && (
          <p className="muted">{(mutation.error as any)?.error || 'Login failed'}</p>
        )}
      </form>
      <p className="muted">
        Don&apos;t have an account? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
};

export default LoginPage;
