import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline, Container, Paper, Tab, Tabs } from '@mui/material';
import AutoSearch from './components/AutoSearch';
import ManualSearch from './components/ManualSearch';
import SearchOutput from './components/SearchOutput';

function App() {
  return (
    <Router> {/* Wrap your content with the Router component */}
      <CssBaseline />
      <Container maxWidth="2000px">
        <Paper elevation={3}>
          <Tabs
            value={0} // Set the initial tab value here
            indicatorColor="primary"
            textColor="primary"
            centered
          >
            <Tab label="Auto Search" href="/auto" />
            <Tab label="Manual Search" href="/manual" />
            <Tab label="Search Output" href="/output" />
          </Tabs>
        </Paper>

        <Routes>
          <Route path="/auto" element={<AutoSearch />} /> {/* Use "element" instead of "component" */}
          <Route path="/manual" element={<ManualSearch />} /> {/* Use "element" instead of "component" */}
          <Route path="/output" element={<SearchOutput />} />
          <Route path="/manual/:aufnr" element={<ManualSearch />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
