import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import Dealers from './components/Dealers/Dealers';
import Dealer from './components/Dealers/Dealer';
import PostReview from './components/Dealers/PostReview';
import './App.css';

import { api } from './api';

export default function App() {
  const [username, setUsername] = useState('');
  useEffect(() => {
    api('session').then(result => setUsername(result.userName)).catch(() => {});
  }, []);

  return <>
    <Header username={username} setUsername={setUsername} />
    <main className="shell">
      <Routes>
        <Route path="/" element={<Dealers username={username} />} />
        <Route path="/dealers" element={<Dealers username={username} />} />
        <Route path="/login" element={<Login setUsername={setUsername} />} />
        <Route path="/register" element={<Register setUsername={setUsername} />} />
        <Route path="/dealer/:id" element={<Dealer username={username} />} />
        <Route path="/postreview/:id" element={<PostReview />} />
      </Routes>
    </main>
  </>;
}
