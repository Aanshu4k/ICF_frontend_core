import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

function LoginForm({ setUserIsLoggedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

 let is_login = localStorage.getItem("isLoggedIn");

 if(is_login && is_login==='true'){
  setUserIsLoggedIn(true)
  navigate('/auto');
 }else{
  setUserIsLoggedIn(false)
  navigate('/');
 }
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);

    // Add your form submission logic here
    if (email === 'admin@gmail.com' && password === 'admin@123') {
      // Set a flag in localStorage to indicate that the user is logged in
      localStorage.setItem('isLoggedIn', 'true');
      // Redirect to a protected route (e.g., /auto)
      navigate('/auto');
    }
  };

  return (
    <div className="">
      <section>
        <div style={{ textAlign: 'left' }}>
          <img style={{ height: '50px' }} src="./logoBSES.gif" alt="Logo" className="logo" />
        </div>
        <div className="main-form-container">
          <div className="form-container">
            <div className="login-form form-wraper">
              <div>
                <form onSubmit={handleSubmit}>
                  {/* Email field */}
                  <div className="input-group">
                    <div className="box">
                      <span>
                        <input
                          placeholder="Email"
                          className="myInput"
                          type="text"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </span>
                    </div>
                    <span className="text-danger" style={{ marginLeft: '12px' }}>
                      {(submitted || email) && !/^\S+@\S+$/.test(email) ? 'Enter a valid email address' : ''}
                    </span>
                  </div>

                  {/* Password field */}
                  <div className="input-group">
                    <div className="box">
                      <span>
                        <input
                          placeholder="Password"
                          className="myInput"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </span>
                    </div>
                    <span className="text-danger" style={{ marginLeft: '12px' }}>
                      {(submitted || password) && !password ? 'Password is required' : ''}
                    </span>
                  </div>

                  <div className="action-button">
                    <button type="submit">Login</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LoginForm;
