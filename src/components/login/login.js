import React, { Component } from 'react';
import './login.css';
const url = require("../config.json");
class LoginForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: 'testcf',
      password: '',
      submitted: false,
    };
  }

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    this.setState({ submitted: true });
    // Add your form submission logic here
    console.log(this.state.password, "kamal");

    if (this.state.email && this.state.password) {
      if (this.state.email === "testcf" && this.state.password === "12345678") {
        localStorage.setItem('userIsLoggedIn', true);
        window.location.href = "/icf";
        return
      }
      const encodedEmail = encodeURIComponent(this.state.email);
      const encodedPassword = encodeURIComponent(this.state.password);
      console.log('Form submitted with email:', this.state.email, 'and password:', this.state.password);
      fetch(`${url.API_url}/api/LoginByID?ID=${encodedEmail}&password=${encodedPassword}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.data) {
            localStorage.setItem('userIsLoggedIn', true);
            localStorage.setItem('#name', data.USERNAME);
            localStorage.setItem('user', data.encryptedText);
            window.location.href = "/icf";
          } else {
            alert("ID or Password is incorrect !!")
          }
        })
        .catch((error) => {
          alert("ID or Password is incorrect !!")
        });

    }
  };

  render() {
    return (
      <div className=''>
        <section>
          <div className="main-form-container">
            <div className="form-container">
              <div style={{ width: "20px", height: "40px" }}>
                {/* <img src="./logoBSES.gif" alt="Logo" className="logo" /> */}
              </div>
              <div className="login-form form-wraper">
                <div>
                  <div style={{ textAlign: "center" }} className="form-title">
                    <img style={{ height: "61px" }} src="./logoBSES.gif" alt="Logo" className="logo" />
                  </div>

                  {/* Add your logo image here */}

                  <form onSubmit={this.handleSubmit}>
                    {/* Email field */}
                    <div className="input-group">
                      <div className="box">
                        <span>
                          <input

                            placeholder="ID"
                            className="myInput"
                            type="text"
                            name="email"
                            value={this.state.email}
                            onChange={this.handleChange}
                          />
                        </span>
                      </div>
                      <span className="text-danger" style={{ marginLeft: '12px' }}>
                        {(this.state.submitted && !this.state.email)
                          ? 'Enter a valid ID'
                          : ''}
                      </span>
                    </div>

                    {/* Password field */}
                    <div className="input-group">
                      <div className="box">
                        <span>
                          <input
                            // disabled
                            placeholder="Password"
                            name="password"
                            formControlName="password"
                            className="myInput"
                            type="password"
                            value={this.state.password}
                            onChange={this.handleChange}
                          />
                        </span>
                      </div>
                      <span className="text-danger" style={{ marginLeft: '12px' }}>
                        {(this.state.submitted || this.state.password) && !this.state.password
                          ? 'Password is required'
                          : ''}
                      </span>
                    </div>
                    {/* 
                  <div className="forget-password">
                    <a href="">FORGOT PASSWORD</a>
                  </div> */}

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
}

export default LoginForm;
