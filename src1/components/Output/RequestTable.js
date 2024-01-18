import React, { useState, useEffect, useCallback } from "react";
import "../SearchOutput.css";
import { Paper, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import UserDetailsTable from "../../../src/components/Output/detailsTabel"; // Import UserDetailsTable

function RequestTable({ onSelectRow }) {
  const [requestData, setRequestData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestCount, setRequestCount] = useState(0); // New state for request count
  const [selectedRow, setSelectedRow] = useState(null); // New state for selected row
  const [selectedRowData, setSelectedRowData] = useState(null);

  const [divisions, setDivisions] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState("");
  const [matchingAddresses, setMatchingAddresses] = useState({});
  const [caseCount, setCaseCount] = useState(0);
  const [resetDivision, setResetDivision] = useState(false);
  const [selectedRowCount, setSelectedRowCount] = useState(0);
  const [searchProgress, setSearchProgress] = useState(0);
  const [isSearching, setIsSearching] = useState(false);

  const navigate = useNavigate();

  // Add a click event handler for the "Manual Search" button
  const handleManualSearchClick = () => {
    if (selectedRow) {
      // If a row is selected, navigate to the '/manual' route with the 'aufnr' parameter
      navigate(`/manual/${selectedRow.AUFNR}`);
    } else {
      alert("Please select a row before manual search.");
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

  const [users, setUsers] = useState([
    {
      AUFNR: "1",
      REQUEST_NO: "REQ001",
      VAPLZ: "Division A",
      NAME: "John Doe",
      SAP_ADDRESS: "123 Main Noida uttar pradesh",
      ILART: "Request Type 1",
    },
    {
      AUFNR: "2",
      REQUEST_NO: "REQ002",
      VAPLZ: "Division B",
      NAME: "Jane Smith",
      SAP_ADDRESS: "456 Elm St",
      ILART: "Request Type 2",
    },
  ]);
  const [selectedRows, setSelectedRows] = useState([]);

  // Get the current rows to display based on pagination
  // const currentRows = casesData.slice(indexOfFirstRow, indexOfLastRow);

  const toggleDetails = (index) => {
    setUsers((prevState) => {
      const updatedUsers = prevState.map((user, i) => {
        if (i === index) {
          return { ...user, showDetails: !user.showDetails };
        } else {
          return user;
        }
      });

      return updatedUsers;
    });

    let filter = users.filter((x) => x.showDetails);
    if (filter.length != 0) {
      if (document.getElementById("tabs-a")) {
        document
          .getElementById("tabs-a")
          .setAttribute("style", "min-height:510px");
      }
    } else {
      console.log("sfdc");
      document.getElementById("tabs-a").style.removeProperty("min-height");
    }
  };

  const handleRowClick = (row) => {
    setSelectedRows((prevSelectedRows) => {
      if (prevSelectedRows.includes(row)) {
        return prevSelectedRows.filter((selectedRow) => selectedRow !== row);
      } else {
        return [...prevSelectedRows, row];
      }
    });
    // Update selected row count
    setSelectedRowCount(selectedRows.length + 1);
  };

  const [selectAllChecked, setSelectAllChecked] = useState(false);

  const handleRowClickAll = (e) => {
    if (e.target.value) {
      setSelectedRows([...selectedRows]);
      // setSelectedRowCount(currentRows.length)
      setSelectAllChecked(true);
    } else {
      setSelectedRows([]);
      setSelectAllChecked(false);
      setSelectedRowCount(0);
    }
  };

  return (
    <div class="tables-page-section mt-5">
      <div class="container-fluid">
        <div class="row">
          <div class="row">
            <div class="col-lg-12">
              <div
                id="tabs-a"
                className=" table-responsive table-bordered table-striped table-hover"
              >
                <table
                  className="table table-bordered table-striped table-hover"
                  style={{ maxWidth: "100%" }}
                >
                  <thead className="fixed-header">
                    <tr>
                      <th style={{ width: "5%" }}>
                        <input type="checkbox" name="" />
                      </th>

                      <th style={{ width: "12%" }}>ORDER NO</th>
                      <th style={{ width: "13%" }}>REQUEST NO</th>
                      <th style={{ width: "13%" }}>DIVISION</th>
                      <th style={{ width: "16%" }}>NAME</th>
                      <th style={{ width: "30%" }}>APPLIED ADDRESS</th>
                      <th style={{ width: "13%" }}>REQUEST TYPE</th>
                      <th style={{ width: "15%" }}>Total Count</th>
                      <th style={{ width: "13%" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <React.Fragment key={index}>
                        <tr className="table-row">
                          <td>
                            <input
                              checked={
                                selectedRows.includes(user) || selectAllChecked
                              }
                              onChange={(e) => handleRowClick(user)}
                              type="checkbox"
                              name=""
                            />
                          </td>

                          <td>{user.AUFNR}</td>
                          <td>{user.REQUEST_NO}</td>
                          <td>{user.VAPLZ}</td>
                          <td>{user.NAME}</td>
                          <td>{user.SAP_ADDRESS}</td>

                          <td>{user.ILART}</td>
                          <td>1</td>
                          <td className="table-cell">
                            <button
                              className="details-button"
                              onClick={() => toggleDetails(index)}
                            >
                              {user.showDetails ? "Hide" : "View"}
                            </button>
                          </td>
                        </tr>

                        {user.showDetails && (
                          <tr className="details-row">
                            <td colSpan="10" className="open-details">
                              <UserDetailsTable user={user} />{" "}
                              {/* Render UserDetailsTable */}
                              {/* button added >>>> */}
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-evenly",
                                }}
                              >
                                <span style={{marginTop:15,}}>
                                  If you are not satisfied with the results of
                                  Auto Search , Please select the case and
                                  perform manual search
                                </span>
                                <div style={{marginTop:10}}>
                                <button onClick={handleManualSearchClick}>
                                  Manual Search
                                </button>
                                </div>
                              </div>
                              {/* button added >>>> */}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RequestTable;
