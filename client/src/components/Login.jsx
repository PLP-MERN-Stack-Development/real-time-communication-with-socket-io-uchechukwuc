import { useState } from 'react';
import './Login.css';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username.trim());
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Join the Chat</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              maxLength={20}
            />
          </div>
          <button type="submit" className="login-btn">
            Join Chat
          </button>
        </form>
        <p className="login-info">
          Choose a unique username to start chatting with others in real-time!
        </p>
      </div>
    </div>
  );
}

export default Login;