// CircularProgressWithLabel.js
import React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

function CircularProgressWithLabel({ value }) {
  return (
    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
      <CircularProgress variant="determinate" value={value}/>
      {/* <Typography variant="caption" component="div" color="textSecondary">
        {`${Math.round(value)}%`}
      </Typography> */}
      <h4>{`${Math.round(value)}%`}</h4>
      <h2>AUTO SEARCH IS IN PROGRESS</h2>
    </div>
  );
}

export default CircularProgressWithLabel;
