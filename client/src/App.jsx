import { useState, useEffect } from 'react';
import { useSocket } from './socket/socket.js';
import Login from './components/Login.jsx';
import ChatRoom from './components/ChatRoom.jsx';
import './App.css';

function App() {
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { isConnected, connect, disconnect } = useSocket();

  const handleLogin = (user) => {
    setUsername(user);
    connect(user);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    disconnect();
    setUsername('');
    setIsLoggedIn(false);
  };

  useEffect(() => {
    if (!isConnected && isLoggedIn) {
      setIsLoggedIn(false);
    }
  }, [isConnected, isLoggedIn]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Socket.io Chat App</h1>
        {isLoggedIn && (
          <div className="user-info">
            <span>Welcome, {username}!</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        )}
      </header>

      <main className="app-main">
        {!isLoggedIn ? (
          <Login onLogin={handleLogin} />
        ) : (
          <ChatRoom username={username} />
        )}
      </main>

      <footer className="app-footer">
        <p>Connection Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}</p>
      </footer>
    </div>
  );
}

export default App;