import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api';

export default function Header({ username, setUsername }) {
  const navigate = useNavigate();

  async function logout() {
    try {
      await api('logout', {});
      setUsername('');
      navigate('/');
    } catch (error) {
      alert(error.message);
    }
  }

  return <header className="site-header">
    <nav aria-label="Main navigation">
      <Link className="brand" to="/">Cars Dealership</Link>
      <Link to="/dealers">Dealerships</Link>
      <a href="/about">About Us</a>
      <a href="/contact">Contact Us</a>
      <div className="account">
        {username ? <><span>{username}</span><button onClick={logout}>Logout</button></> :
          <><Link to="/login">Login</Link><Link to="/register">Register</Link></>}
      </div>
    </nav>
  </header>;
}
