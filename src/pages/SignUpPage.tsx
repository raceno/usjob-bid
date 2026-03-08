import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { signup } from '../api/client.ts';
import { useAuth } from '../AuthContext.tsx';

const SignUpPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const auth = useAuth();

  React.useEffect(() => {
    if (auth.token) {
      navigate('/', { replace: true });
    }
  }, [auth.token, navigate]);

  const mutation = useMutation({
    mutationFn: () => signup(email, password),
    onSuccess: (data) => {
      auth.login(data.token);
      navigate('/', { replace: true });
    },
    onError: (err: any) => {
      console.error('Signup error', err);
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <div className="stack" style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h1>Sign up</h1>
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
            {mutation.isPending ? 'Signing up…' : 'Create account'}
          </button>
        </div>
        {mutation.isError && (
          <p className="muted">{(mutation.error as any)?.error || 'Signup failed'}</p>
        )}
      </form>
      <p className="muted">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
};

export default SignUpPage;
