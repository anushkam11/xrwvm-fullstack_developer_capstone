import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api';

export default function Login({ setUsername }) {
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      const result = await api('login', Object.fromEntries(new FormData(event.currentTarget)));
      setUsername(result.userName);
      navigate('/dealers');
    } catch (failure) {
      setError(failure.message);
    }
  }

  return <form className="panel form" onSubmit={submit}>
    <h1>Login</h1>
    <label>Username<input name="userName" autoComplete="username" required /></label>
    <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
    {error && <p role="alert">{error}</p>}
    <button type="submit">Login</button>
    <Link to="/register">Create an account</Link>
  </form>;
}
