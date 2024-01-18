import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';

function TopNavBar() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div">
          Your App Name
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default TopNavBar;