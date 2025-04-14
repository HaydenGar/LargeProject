import React, { useState } from 'react';
import './NotebookLogin.css';

const NotebookLogin = () => {
  const [flipped, setFlipped] = useState(false);
  const [loginName, setLoginName] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupFirstName, setSignupFirstName] = useState('');
  const [signupLastName, setSignupLastName] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [message, setMessage] = useState('');
  const [signupMessage, setSignupMessage] = useState('');

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

      const res = await response.json();

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
        window.location.href = '/dashboard';
      }
    } catch (e: any) {
      setMessage('Login error: ' + e.toString());
    }
  };

  const handleSignup = async (event: any) => {
    event.preventDefault();
    const obj = {
      firstName: signupFirstName,
      lastName: signupLastName,
      username: signupUsername,
      password: signupPassword
    };

    try {
      const response = await fetch('https://merntest.anupucf.xyz/api/register', {
        method: 'POST',
        body: JSON.stringify(obj),
        headers: { 'Content-Type': 'application/json' }
      });

      const res = await response.json();

      if (res.UserId > 0) {
        setSignupMessage('Signup successful! Please log in.');
        setSignupFirstName('');
        setSignupLastName('');
        setSignupUsername('');
        setSignupPassword('');

        setTimeout(() => {
          setFlipped(false);
        }, 1000);
      } else {
        setSignupMessage(res.error || 'Signup failed');
      }
    } catch (e: any) {
      setSignupMessage('Signup error: ' + e.toString());
    }
  };

  return (
    <div className="notebook-wrapper">
      <div className="book">
        <div className="left-page">
          <h1>Welcome to Your Journal</h1>
          <p>
            Your journal is your space.<br />
            Let’s begin the next chapter.
          </p>
        </div>

        <div className="page-wrapper">
          <div className={`flipper ${flipped ? 'flipped' : ''}`}>
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
                <button className="flip-toggle" onClick={() => {
                  setFlipped(true);
                  setMessage('');
                  setSignupMessage('');
                }}>
                  Don’t have an account? Sign Up →
                </button>
                {message && <p className="message error">{message}</p>}
              </div>
            </div>

            <div className="page back">
              <div className="form-content">
                <h2>Sign Up</h2>
                <p className="subheading">Create your journaling account</p>
                <input
                  type="text"
                  placeholder="First Name"
                  value={signupFirstName}
                  onChange={(e) => setSignupFirstName(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={signupLastName}
                  onChange={(e) => setSignupLastName(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Username"
                  value={signupUsername}
                  onChange={(e) => setSignupUsername(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                />
                <button onClick={handleSignup}>Create Account</button>
                <button className="flip-toggle" onClick={() => {
                  setFlipped(false);
                  setMessage('');
                  setSignupMessage('');
                }}>
                  ← Back to Login
                </button>
                {signupMessage && (
                  <p className={`message ${signupMessage.includes('successful') ? 'success' : 'error'}`}>
                    {signupMessage}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotebookLogin;
