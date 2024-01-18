import React, { useState, useEffect, useCallback } from "react";
import "../SearchOutput.css";
import { useDuesContext } from "../DuesContext";
import { Paper, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import RequestTable from "./RequestTable";

function SearchResultsTable({ selectedRow, onUpdateDues }) {
  const [searchResultsData, setSearchResultsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCount, setSearchCount] = useState(0);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const { state, dispatch } = useDuesContext();
  const [calculatingDues, setCalculatingDues] = useState(false);

  const handleRowSelect = (row) => {
    if (selectedRows.includes(row)) {
      setSelectedRows(
        selectedRows.filter((selectedRow) => selectedRow !== row)
      );
    } else {
      setSelectedRows([...selectedRows, row]);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows([...searchResultsData]);
    }
    setSelectAll(!selectAll);
  };

  useEffect(() => {
    if (!selectedRow) {
      // Clear data when no row is selected
      setSearchResultsData([]);
      setLoading(false); // Set loading to false
      return;
    }

    // Reset the data and show loading
    setSearchResultsData([]);
    setLoading(true);

    // Fetch data from the /fetch_search_matches API with the selected row's AUFNR
    fetch(
      `http://10.125.126.72:5000/fetch_search_matches?aufnr=${selectedRow.AUFNR}`
    )
      .then((response) => response.json())
      .then((data) => {
        setSearchResultsData(data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching search results data:", error);
        setLoading(false); // Set loading to false in case of an error
      });

    // Fetch the search count from the /fetch_search_results_count API with the selected row's REQUEST_NO
    fetch(
      `http://10.125.126.72:5000/fetch_search_results_count?request_no=${selectedRow.REQUEST_NO}`
    )
      .then((response) => response.json())
      .then((data) => {
        setSearchCount(data.count);
      })
      .catch((error) => {
        console.error("Error fetching search count:", error);
      });
  }, [selectedRow]);

  const containerStyle = {
    maxHeight: "800px",
    overflowY: "scroll",
  };

  const tableStyle = {
    width: "100%",
  };

  const buttonsContainerStyle = {
    display: "flex",
    justifyContent: "space-around",
    marginTop: "20px",
  };

  function maskMobileNumber(mobileNumber) {
    // Check if the mobile number is valid (at least 6 digits)
    if (mobileNumber && mobileNumber.length >= 6) {
      // Extract the first 3 digits (880), mask the middle digits, and add the last 3 digits (298)
      const prefix = mobileNumber.substring(0, 3);
      const maskedMiddle = mobileNumber
        .substring(3, mobileNumber.length - 3)
        .replace(/\d/g, "X");
      const suffix = mobileNumber.substring(mobileNumber.length - 3);
      return `${prefix}${maskedMiddle}${suffix}`;
    }
    // If the mobile number is not valid, return an empty string or handle it accordingly
    return "";
  }

  const handleCalculateDues = () => {
    const caNumbers = selectedRows.map((row) => row.OUTPUT_CONS_REF);

    setCalculatingDues(true); // Set calculatingDues to true when calculating

    fetch("http://10.125.126.72:5000/calculate_dues", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ caNumbers }),
    })
      .then((response) => response.json())
      .then((data) => {
        // Update the DUES values in the global state
        dispatch({ type: "UPDATE_DUES", payload: data.duesData });

        // Update the DUES values in the searchResultsData state
        const updatedSearchResults = searchResultsData.map((row) => {
          const matchingDuesData = data.duesData.find(
            (dues) => dues.CA === row.OUTPUT_CONS_REF
          );
          if (matchingDuesData) {
            return { ...row, DUES: matchingDuesData.DUES };
          }
          return row;
        });
        setSearchResultsData(updatedSearchResults);

        setCalculatingDues(false); // Set calculatingDues to false when calculation is complete
        alert("Dues Calculation complete!"); // Show alert when calculation is complete
      })
      .catch((error) => {
        console.error("Error calculating dues:", error);
        setCalculatingDues(false); // Set calculatingDues to false in case of an error
      });
  };

  const handleFreeze = () => {
    // Add your logic for Freeze here
    console.log("Freeze clicked");
  };

  return (
    <div
      style={{
        borderRadius: "10px",
        margin: "5px",
        boxShadow: "2px 2px 5px rgba(0.3, 0.3, 0.3, 0.3)",
        paddingTop: "5px",
      }}
    >
      <h3
        style={{ marginLeft: "10px", marginBottom: "0px", marginTop: "10px" }}
      >
        SEARCH RESULTS GRID ({searchResultsData.length} results)
      </h3>
      <div style={containerStyle}>
        {loading ? (
          <p>Select a Request from above to view its Searched Results...</p>
        ) : (
          <Paper elevation={3} style={{ padding: "16px" }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th>
                    SELECT
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={selectAll}
                    />
                  </th>
                  <th>SEARCH MODE</th>
                  <th>COMPANY</th>
                  <th>DIVISION</th>
                  <th>CA</th>
                  <th>ACCOUNT CLASS</th>
                  <th>TARIFF</th>
                  <th>NAME</th>
                  <th>FATHER NAME</th>
                  <th>SAP ADDRESS</th>
                  <th>DUES</th>
                  <th>CONNECTION STATUS</th>
                  <th>MOBILE NO</th>
                  <th>SAP POLE ID</th>
                  <th>MRU</th>
                  <th>SEQUENCE NO</th>
                  <th>DEVICE NO</th>
                  <th>DISPATCH CONTROL</th>
                  <th>BP TYPE</th>
                </tr>
              </thead>
              <tbody>
                {searchResultsData.map((row) => (
                  <tr key={row.OUTPUT_SAP_DIVISION}>
                    <td>
                      <input
                        type="checkbox"
                        onChange={() => handleRowSelect(row)}
                        checked={selectedRows.includes(row)}
                      />
                    </td>
                    <td>{row.SEARCH_MODE}</td>
                    <td>{row.OUTPUT_SAP_COMPANY}</td>
                    <td>{row.OUTPUT_SAP_DIVISION}</td>
                    <td>{row.OUTPUT_CONS_REF}</td>
                    <td>{row.OUTPUT_SAP_DEPARTMENT}</td>
                    <td>{row.OUTPUT_TARIFF}</td>
                    <td>{row.OUTPUT_SAP_NAME}</td>
                    <td>{row.OUTPUT_FATHER_NAME}</td>
                    <td>{row.OUTPUT_SAP_ADDRESS}</td>
                    <td>{row.DUES}</td>
                    <td>{row.OUTPUT_CSTS_CD}</td>
                    <td>{maskMobileNumber(row.OUTPUT_MOBILE_NO)}</td>
                    <td>{row.OUTPUT_SAP_POLE_ID}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Paper>
        )}
      </div>
      <div style={buttonsContainerStyle}>
        <button onClick={handleCalculateDues} disabled={calculatingDues}>
          {calculatingDues ? "Calculating..." : "Calculate Dues"}
        </button>
        <button onClick={handleFreeze}>Freeze</button>
      </div>
    </div>
  );
}

export default SearchResultsTable;