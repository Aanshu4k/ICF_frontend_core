import React, { useState, useEffect, useCallback } from "react";
import "../SearchOutput.css";
import { Paper, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';

function RequestTable({ onSelectRow }) {
  const [requestData, setRequestData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestCount, setRequestCount] = useState(0); // New state for request count
  const [selectedRow, setSelectedRow] = useState(null); // New state for selected row
  const [selectedRowData, setSelectedRowData] = useState(null);

 
  const navigate = useNavigate();

  // Add a click event handler for the "Manual Search" button
  const handleManualSearchClick = () => {
    if (selectedRow) {
      // If a row is selected, navigate to the '/manual' route with the 'aufnr' parameter
      navigate(`/manual/${selectedRow.AUFNR}`);
    } else {
      alert('Please select a row before manual search.');
    }
  };

  const getSelectedRow = () => {
    return selectedRow;
  };

  const containerStyle = {
    maxHeight: "650px", // Set the maximum height for the container div
    overflowY: "scroll", // Make the container div scrollable vertically
  };

  const tableStyle = {
    width: "100%", // Ensure the table takes full width of the container
  };

  const handleRowClick = (row) => {
    setSelectedRow(row);
    onSelectRow(row);
  };

  useEffect(() => {
    // Fetch data from the /fetch_request_cases API when the component mounts
    fetch("http://localhost:5000/fetch_request_cases")
      .then((response) => response.json())
      .then((data) => {
        setRequestData(data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching request data:", error);
      });
    // Fetch the count from the /get_request_count API
    fetch("http://localhost:5000/get_request_count")
      .then((response) => response.json())
      .then((data) => {
        setRequestCount(data.count);
      })
      .catch((error) => {
        console.error("Error fetching request count:", error);
      });
  }, []);

  return (
    <div
      style={{
        borderRadius: "10px",
        margin: "5px",
        boxShadow: "2px 2px 5px rgba(0.3, 0.3, 0.3, 0.3)",
        paddingTop: "5px",
        marginBottom: "20px",
      }}
    >
      <h3 style={{ marginLeft: "10px", marginBottom: "0px" }}>
        REQUEST GRID ({requestCount} requests)
      </h3>{" "}
      <div style={containerStyle}>
        {loading ? (
          <p>Loading data...</p>
        ) : (
          <Paper elevation={3} style={{ padding: "16px" }}>
            <table>
              <thead>
                <tr>
                  <th>REQUEST NO</th>
                  <th>COMPANY</th>
                  <th>DIVISION</th>
                  <th>NAME</th>
                  <th>REQUEST ADDRESS</th>
                  <th>REQUEST TYPE</th>
                  <th>EMAIL</th>
                </tr>
              </thead>
              <tbody>
                {requestData.map((row) => (
                  <tr
                    key={row.AUFNR}
                    onClick={() => handleRowClick(row)} // Handle row click
                    className={selectedRow === row ? "selected-row" : ""} // Apply the "selected-row" class if selected
                  >
                    {/* <tr key={row.AUFNR} onClick={() => onSelectRow(row)}> */}
                    <td>{row.REQUEST_NO}</td>
                    <td>{row.BUKRS}</td>
                    <td>{row.VAPLZ}</td>
                    <td>{row.NAME}</td>
                    <td>{row.SAP_ADDRESS}</td>
                    <td>{row.ILART}</td>
                    <td>{row.E_MAIL}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Paper>
        )}
      </div>
      <div style={{display:"flex",justifyContent:"space-evenly"}}>
        <span>
          If you are not satisfied with the results of Auto Search , Please
          select the case and perform manual search
        </span>
        <button onClick={handleManualSearchClick}>Manual Search</button>
      </div>
    </div>
  );
}

export default RequestTable;
