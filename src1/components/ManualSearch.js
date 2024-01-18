import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { TextField, Button, Grid, CircularProgress } from "@mui/material";
import "../components/ManualSearch.css"

function ManualSearch() {
  const { aufnr } = useParams();
  const [caseData, setCaseData] = useState({});
  const [loading, setLoading] = useState(true);
  const [addressPart1, setAddressPart1] = useState("");
  const [addressPart2, setAddressPart2] = useState("");
  const [addressPart3, setAddressPart3] = useState("");
  const [searchResults, setSearchResults] = useState([]); // New state for search results
   // State for pagination
   const [currentPage, setCurrentPage] = useState(1);
   const resultsPerPage = 10;

   // State to control loading display
  const [showLoading, setShowLoading] = useState(false);
 
   // Calculate the starting and ending index for the current page
   const startIndex = (currentPage - 1) * resultsPerPage;
   const endIndex = startIndex + resultsPerPage;
 
   // Function to handle forward and next pagination controls
   const handleForwardClick = () => {
     if (currentPage < Math.ceil(searchResults.length / resultsPerPage)) {
       setCurrentPage(currentPage + 1);
     }
   };
 
   const handleNextClick = () => {
     if (currentPage > 1) {
       setCurrentPage(currentPage - 1);
     }
   }; 


  useEffect(() => {
    if (!aufnr) {
      // If aufnr parameter is missing, handle it accordingly
      console.error("AUFNR parameter is missing.");
      setLoading(false);
      return;
    }

    // Show loading GIF when the API call starts
    setShowLoading(true);

    // Make an API call to fetch case data based on the aufnr parameter
    fetch(`http://localhost:5000/fetch_case_from_aufnr?aufnr=${aufnr}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          console.error("Error fetching case data:", data.error);
          // Handle error condition if needed
        } else {
          // Set the fetched case data in state
          setCaseData(data.data[0]);
        }
        setLoading(false);
        setShowLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching case data:", error);
        setLoading(false);
        setShowLoading(false);
        // Handle error condition if needed
      });
  }, [aufnr]);

  // Function to handle manual search button click
  const handleManualSearchClick = () => {
    // Combine the address parts into a single address
    const fullAddress = `${addressPart1} ${addressPart2} ${addressPart3}`;

     // Show loading GIF when the API call starts
     setShowLoading(true);

    // Make an API call to fetch search results
    fetch("http://localhost:5000/search_manual_mode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        addressPart1,
        addressPart2,
        addressPart3,
        VAPLZ: caseData.VAPLZ, // Assuming VAPLZ comes from case data
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          console.error("Error fetching search results:", data.error);
          // Handle error condition if needed
        } else {
          // Set the fetched search results in state
          setSearchResults(data.data);
        }
        setShowLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching search results:", error);
        setShowLoading(false);
        // Handle error condition if needed
      });
  };

  // Function to distribute words evenly among the address input fields
  const handleAutoBreakClick = () => {
    const words = caseData.SAP_ADDRESS.split(" ");
    const numWords = words.length;
    const wordsPerField = Math.ceil(numWords / 3);

    setAddressPart1(words.slice(0, wordsPerField).join(" "));
    setAddressPart2(words.slice(wordsPerField, 2 * wordsPerField).join(" "));
    setAddressPart3(words.slice(2 * wordsPerField).join(" "));
  };

  return (
    <div>
      <h1>Manual Search</h1>
      {loading ? (
        // Show loading component while data is being fetched
        <div className="loading-container">
          <CircularProgress size={100} />
        </div>
      ) : (
        <table>
          <tbody>
            <tr>
              <th>REQUEST NO</th>
              <th>COMPANY</th>
              <th>DIVISION</th>
              <th>NAME</th>
              <th>REQUEST ADDRESS</th>
              <th>REQUEST TYPE</th>
              <th>EMAIL</th>
            </tr>
            <tr>
              <td>{caseData.REQUEST_NO}</td>
              <td>{caseData.BUKRS}</td>
              <td>{caseData.VAPLZ}</td>
              <td>{caseData.NAME}</td>
              <td>{caseData.SAP_ADDRESS}</td>
              <td>{caseData.ILART}</td>
              <td>{caseData.E_MAIL}</td>
            </tr>
          </tbody>
        </table>
      )}

      {showLoading && (
        // CSS overlay for the loading component
        <div className="overlay">
          <div className="loading-container">
            <CircularProgress size={100} />
            <h2>Manual Search in progress</h2>
          </div>
        </div>
      )}

      <div style={{ padding: "30px" }}>
        {/* Inputs and buttons */}
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Address Part 1"
              variant="outlined"
              value={addressPart1}
              onChange={(e) => setAddressPart1(e.target.value)}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Address Part 2"
              variant="outlined"
              value={addressPart2}
              onChange={(e) => setAddressPart2(e.target.value)}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Address Part 3"
              variant="outlined"
              value={addressPart3}
              onChange={(e) => setAddressPart3(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleManualSearchClick}
            >
              Start Manual Search
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAutoBreakClick}
              style={{ marginLeft: "10px" }}
            >
              AutoBreak
            </Button>
          </Grid>
        </Grid>
      </div>

      {searchResults.length > 0 && (
        <div>
          <h2>Search Results</h2>
          <table>
            <tbody>
              <tr>
                <th>COMPANY</th>
                <th>DIVISION</th>
                <th>ACCOUNT CLASS</th>
                <th>CA NUMBER</th>
                <th>CONSUMER TYPE</th>
                <th>CONSUMER NAME</th>
                <th>MOBILE NO</th>
                <th>CONSUMER ADDRESS</th>
                <th>POLE ID</th>
                <th>TARIFF CATEGORY</th>
              </tr>
              {searchResults.map((result, index) => (
                <tr key={index}>
                  <td>{result.SAP_COMPANY}</td>
                  <td>{result.SAP_DIVISION}</td>
                  <td>{result.SAP_DEPARTMENT}</td>
                  <td>{result.CONS_REF}</td>
                  <td>{result.CSTS_CD}</td>
                  <td>{result.SAP_NAME}</td>
                  <td>{result.MOBILE_NO}</td>
                  <td>{result.SAP_ADDRESS}</td>
                  <td>{result.SAP_POLE_ID}</td>
                  <td>{result.TARIFF}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: "10px", textAlign: "center" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleForwardClick}
              disabled={currentPage === 1}
            >
              Forward
            </Button>{" "}
            <span>Page {currentPage}</span>{" "}
            <Button
              variant="contained"
              color="primary"
              onClick={handleNextClick}
              disabled={
                currentPage === Math.ceil(searchResults.length / resultsPerPage)
              }
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManualSearch;