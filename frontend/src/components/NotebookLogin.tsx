import React, { useState } from 'react';
import './NotebookLogin.css';

const NotebookLogin = () => {
  const [flipped, setFlipped] = useState(false);
  const [loginName, setLoginName] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (event: any) => {
    event.preventDefault();

    const obj = { login: loginName, password: loginPassword };
    const js = JSON.stringify(obj);

    try {
      const response = await fetch('https://merntest.anupucf.xyz/api/login', {
        method: 'POST',
        body: js,
        headers: { 'Content-Type': 'application/json' }
      });

      const res = JSON.parse(await response.text());

      if (res.id <= 0) {
        setMessage('User/Password combination incorrect');
      } else {
        const user = {
          firstName: res.firstName,
          lastName: res.lastName,
          id: res.id
        };
        localStorage.setItem('user_data', JSON.stringify(user));
        setMessage('');
        window.location.href = '/cards'; // Redirect on success
      }
    } catch (e: any) {
      alert(e.toString());
    }
  };

  return (
    <div className="book">
      {/* Left Page */}
      <div className="left-page">
        <h1>Welcome to Your Journal</h1>
        <p>
          Your journal is your space.<br />
          Let’s begin the next chapter.
        </p>
      </div>

      {/* Right Page Flip Area */}
      <div className="page-wrapper">
        <div className={`flipper ${flipped ? 'flipped' : ''}`}>
          {/* Front - Login */}
          <div className="page front">
            <div className="form-content">
              <h2>Login</h2>
              <p className="subheading">Start journaling your thoughts</p>
              <input
                type="text"
                placeholder="Username"
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
              <button onClick={handleLogin}>Log In</button>
              <button className="flip-toggle" onClick={() => setFlipped(true)}>
                Don’t have an account? Sign Up →
              </button>
              <p style={{ color: 'brown' }}>{message}</p>
            </div>
          </div>

          {/* Back - Sign Up (UI only for now) */}
          <div className="page back">
            <div className="form-content">
              <h2>Sign Up</h2>
              <p className="subheading">Create your journaling account</p>
              <input type="text" placeholder="First Name" />
              <input type="text" placeholder="Last Name" />
              <input type="text" placeholder="Username" />
              <input type="password" placeholder="Password" />
              <button>Create Account</button>
              <button className="flip-toggle" onClick={() => setFlipped(false)}>
                ← Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotebookLogin;
