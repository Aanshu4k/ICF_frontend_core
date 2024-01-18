import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, Container, Paper, capitalize } from '@mui/material';
import AutoSearch from './components/AutoSearch';
import ManualSearch from './components/ManualSearch';
import SearchOutput from './components/SearchOutput';
import LoginForm from './components/login/login';
import SealingRequestTable from './components/sealingSearch';
import SealingManual from './components/SealingManual';

function App() {
  const [userIsLoggedIn, setUserIsLoggedIn] = useState(false); // Placeholder for user authentication
  const pathname = window.location.pathname;
  const goToHome = () => {
    window.location.href = "/auto";
  }
  const logOut = () => {
    localStorage.clear();
    window.location.href = "/login"
  }

  //  alert(pathname,"pathname")
  useEffect(() => {
    const isUserLoggedIn = localStorage.getItem('userIsLoggedIn');
    if (isUserLoggedIn === 'true') {
      setUserIsLoggedIn(true);
    }
  }, []);
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  // Example usage

  // console.log('Generated UUID:', uuid);
  useEffect(() => {
    const systemId = sessionStorage.getItem('systemId');
    if (!systemId) {
      const uuid = generateUUID();
      sessionStorage.setItem("systemId", uuid);
    }
  }, []);

  return (
    <Router> {/* Wrap your content with the Router component */}
      <CssBaseline classes={{ '@global': { body: { paddingLeft: '0px !important' } } }} />

      {/* <Container maxWidth="2000px"> */}
      {localStorage.getItem('userIsLoggedIn') && (< Paper
        className='d-flex align-items-center justify-content-between'
        style={{
          position: "sticky", top: "0px",
          width: "100% !important", // Set the width to 100%
          padding: " 5px 40px",
          backgroundColor: "#e7e7e7",
          zIndex: "99999",
          backgroundImage: "linear-gradient(-90deg, #fff, #eee)", // Light gray background color
          // boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // Adding a shadow
        }}
        elevation={3}
      >
        <div onClick={goToHome} className='d-flex align-items-center' >
          <figure style={{ margin: "0px" }}>
            <img
              style={{ height: "22px" }}
              src="./layout_set_logo.png"
              alt="Logo"
              className="logo"
            />
            <figcaption style={{ color: "black", fontWeight: 500, fontSize: "10px" }}>
              <span>BSES Rajdhani Power Ltd </span> <br />
              <span className='span'> BSES Yamuna Power Ltd</span>
            </figcaption>
          </figure>

        </div>

        <div style={{ color: "#0000009e", textTransform: "UpperCase", textDecoration: "underline" }}>
          <h3 style={{ fontWeight: "700" }}>
            Intelligent CF
          </h3>
        </div>

        <div onClick={logOut} className='d-flex align-items-center' style={{ marginRight: "10px", cursor: 'pointer' }}>
          <a className="sign-out pull-right"
            style={{
              color: "white",
              textDecoration: "none",
              borderBottom: "1px solid white",
            }}
          >
            <i style={{ color: "red" }} className="fa fa-sign-out"></i>{" "}
            <span style={{ fontSize: "bold", color: "red" }}>Sign Out</span>
          </a>
        </div>
      </Paper>)}


      <Routes>
        <Route
          path="/login"
          element={
            localStorage.getItem('userIsLoggedIn') ? <Navigate to="/auto" /> : <LoginForm setUserIsLoggedIn={setUserIsLoggedIn} />
          }
        />
        {/* <Route path="/auto" element={localStorage.getItem('userIsLoggedIn') ? <AutoSearch /> : <Navigate to="/login" />} />
        <Route path="/manual" element={localStorage.getItem('userIsLoggedIn') ? <ManualSearch /> : <Navigate to="/login" />} />
        <Route path="/output" element={localStorage.getItem('userIsLoggedIn') ? <SearchOutput /> : <Navigate to="/login" />} /> */}

        <Route path="/icf" element={true ? <AutoSearch /> : <Navigate to="/login" />} />
        <Route path="/manual" element={true ? <ManualSearch /> : <Navigate to="/login" />} />
        <Route path="/sealing" element={true ? <SealingRequestTable /> : <Navigate to="/login" />} />
        <Route path="/sealingManual" element={true ? <SealingManual /> : <Navigate to="/login" />} />
        <Route path="/output" element={true ? <SearchOutput /> : <Navigate to="/login" />} />
        <Route path="/*" element={<Navigate to="icf" />} />

      </Routes>
      {/* </Container> */}
    </Router>
  );
}

export default App;
