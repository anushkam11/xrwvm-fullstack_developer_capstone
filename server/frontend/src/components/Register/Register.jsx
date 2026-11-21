import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';

export default function Register({ setUsername }) {
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      const result = await api('register', Object.fromEntries(new FormData(event.currentTarget)));
      setUsername(result.userName);
      navigate('/dealers');
    } catch (failure) {
      setError(failure.message);
    }
  }

  return <form className="panel form" onSubmit={submit}>
    <h1>Sign up</h1>
    <label>Username<input name="userName" autoComplete="username" maxLength={150} required /></label>
    <label>First Name<input name="firstName" autoComplete="given-name" maxLength={150} required /></label>
    <label>Last Name<input name="lastName" autoComplete="family-name" maxLength={150} required /></label>
    <label>Email<input name="email" type="email" autoComplete="email" required /></label>
    <label>Password<input name="password" type="password" autoComplete="new-password" required /></label>
    {error && <p role="alert">{error}</p>}
    <button type="submit">Register</button>
  </form>;
}
