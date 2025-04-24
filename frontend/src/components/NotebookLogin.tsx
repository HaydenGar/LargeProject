import React, { useState } from 'react';
import './NotebookLogin.css';

const NotebookLogin: React.FC = () => {
  const [flipped, setFlipped] = useState(false);

  // ─── LOGIN STATE ─────────────────────────────────────────────────────────────
  const [loginName, setLoginName] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginMsg, setLoginMsg] = useState('');

  // ─── SIGNUP STATE ────────────────────────────────────────────────────────────
  const [signupFirstName, setSignupFirstName] = useState('');
  const [signupLastName, setSignupLastName] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupMsg, setSignupMsg] = useState('');

  // ─── HANDLE LOGIN ────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginMsg('');

    try {
      const response = await fetch('https://journal.lemmons.my/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          login: loginName,
          password: loginPassword,
        }),
      });

      const { id, firstName, lastName, error } = await response.json();

      if (id > 0) {
        localStorage.setItem(
          'user_data',
          JSON.stringify({ id, firstName, lastName })
        );
        window.location.href = '/dashboard';
      } else {
        setLoginMsg(error || 'Login failed');
      }
    } catch (err: any) {
      setLoginMsg('Login error: ' + err.toString());
    }
  };

  // ─── HANDLE SIGNUP ───────────────────────────────────────────────────────────
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupMsg('');

    try {
      const response = await fetch('https://journal.lemmons.my/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: signupFirstName,
          lastName:  signupLastName,
          username:  signupUsername,
          password:  signupPassword,
        }),
      });

      // server returns { UserId, FirstName, LastName, Login, error }
      const { UserId, error } = await response.json();

      if (UserId > 0) {
        setSignupMsg('Signup successful! Please log in.');
        // clear fields
        setSignupFirstName('');
        setSignupLastName('');
        setSignupUsername('');
        setSignupPassword('');
        // flip back to login
        setTimeout(() => setFlipped(false), 1000);
      } else {
        setSignupMsg(error || 'Signup failed');
      }
    } catch (err: any) {
      setSignupMsg('Signup error: ' + err.toString());
    }
  };

  return (
    <div className="notebook-wrapper">
      <div className="book">
        <div className="left-page">
          <h1>Welcome to Your Journal</h1>
          <p>
            Your journal is your space.
            <br />
            Let’s begin the next chapter.
          </p>
        </div>

        <div className="page-wrapper">
          <div className={`flipper ${flipped ? 'flipped' : ''}`}>
            {/* LOGIN SIDE */}
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
                <button
                  className="flip-toggle"
                  onClick={() => {
                    setFlipped(true);
                    setLoginMsg('');
                    setSignupMsg('');
                  }}
                >
                  Don’t have an account? Sign Up →
                </button>
                {loginMsg && <p className="message error">{loginMsg}</p>}
              </div>
            </div>

            {/* SIGNUP SIDE */}
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
                <button
                  className="flip-toggle"
                  onClick={() => {
                    setFlipped(false);
                    setLoginMsg('');
                    setSignupMsg('');
                  }}
                >
                  ← Back to Login
                </button>
                {signupMsg && (
                  <p
                    className={`message ${
                      signupMsg.includes('successful') ? 'success' : 'error'
                    }`}
                  >
                    {signupMsg}
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
