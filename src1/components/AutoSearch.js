import React, { useState, useEffect } from "react";
import "./AutoSearch.css";
import toast, { Toaster } from "react-hot-toast";
import CircularProgressWithLabel from "./CircularProgressWithLabel";


function AutoSearch() {
  const [casesData, setCasesData] = useState([{
    AUFNR: "1",
    REQUEST_NO: "REQ001",
    VAPLZ: "Division A",
    NAME: "John Doe",
    SAP_ADDRESS: "123 Main Sttywefkduhgeisuldfihqrwle qeriuweaf",
    ILART: "Request Type 1",
  },
  {
    AUFNR: "2",
    REQUEST_NO: "REQ002",
    VAPLZ: "Division B",
    NAME: "Jane Smith",
    SAP_ADDRESS: "456 Elm St",
    ILART: "Request Type 2",
  },]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState("");
  const [matchingAddresses, setMatchingAddresses] = useState({});
  const [caseCount, setCaseCount] = useState(0);
  const [resetDivision, setResetDivision] = useState(false);
  const [selectedRowCount, setSelectedRowCount] = useState(0);
  const [searchProgress, setSearchProgress] = useState(0);
  const [isSearching, setIsSearching] = useState(false);


  const fetchDivisions = () => {
    fetch("http://localhost:5000/divisions_on_page_load")
      .then((response) => response.json())
      .then((data) => {
        setDivisions(data.divisions);
      })
      .catch((error) => {
        console.error("Error fetching divisions:", error);
      });
  };

  useEffect(() => {
    fetchDivisions();
  }, []);

  const handleFetchCases = () => {
    if (!selectedDivision) {
      console.warn("Please select a division before fetching cases.");
      toast.error("Please select a division before fetching cases.");
      return;
    }

    fetch(
      `http://localhost:5000/fetch_cases?selected_division=${selectedDivision}`
    )
      .then((response) => response.json())
      .then((data) => {
        const rowsWithId = data.data.map((row, index) => ({
          ...row,
          id: index + 1,
        }));
        setCasesData(rowsWithId);

        // Update the case count
        setCaseCount(rowsWithId.length);

        console.log("Fetched cases data:", rowsWithId);
      })
      .catch((error) => {
        console.error("Error fetching cases:", error);
      });
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
      setSelectedRowCount(currentRows.length)
      setSelectAllChecked(true)
    } else {
      setSelectedRows([]);
      setSelectAllChecked(false);
      setSelectedRowCount(0)
    }


  }

  const handleSearchMatchingAddresses = () => {

    if (selectedRows.length === 0) {
      console.warn("No rows selected. Please select one or more rows.");
      toast.error("Please select a case to start searching");
      return;
    }

    setIsSearching(true); // Set the flag to indicate search in progress

    const requests = [];

    selectedRows.forEach((row) => {
      const payload = {
        AUFNR: row.AUFNR,
        REQUEST_NO: row.REQUEST_NO,
        BUKRS: row.BUKRS,
        VAPLZ: row.VAPLZ,
        NAME: row.NAME,
        TEL_NUMBER: row.TEL_NUMBER,
        E_MAIL: row.E_MAIL,
        ILART: row.ILART,
        SAP_ADDRESS: row.SAP_ADDRESS,
      };

      const requestPromise = fetch("http://localhost:5000/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then((response) => response.json())
        .then((data) => {
          setMatchingAddresses((prevAddresses) => ({
            ...prevAddresses,
            [row.SAP_ADDRESS]: data,
          }));
          console.log(
            `Matching addresses for SAP_ADDRESS ${row.SAP_ADDRESS}:`,
            data
          );
          // Update search progress
          setSearchProgress(
            (prevProgress) => prevProgress + 100 / selectedRows.length
          );
        })
        .catch((error) => {
          console.error("Error fetching matching addresses:", error);
        });

      requests.push(requestPromise);
    });

    Promise.all(requests)
      .then(() => {
        console.log("All requests completed successfully.");
        // Show a success toast
        setIsSearching(false);
        setSearchProgress(0);
        toast.success("Search Process is complete.");
      })
      .catch((error) => {
        console.error("Error in one or more requests:", error);
        setIsSearching(false);
        // Show an error toast
        toast.error(
          "Error in one or more requests. Search Process is complete."
        );
      });
  };

  // Function to handle reset
  const handleReset = () => {
    setSelectedDivision(""); // Reset selected division
    setCasesData([]); // Clear cases data
    setCaseCount(0); // Reset case count
    setResetDivision(true); // Trigger a reset for the division dropdown
  };

  const rowsPerPage = 10; // Number of rows to display per page
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate the index of the first and last rows to display based on the current page
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;

  // Get the current rows to display based on pagination
  const currentRows = casesData.slice(indexOfFirstRow, indexOfLastRow);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  function maskMobileNumber(mobileNumber) {
    // Check if the mobile number is valid (at least 6 digits)
    if (mobileNumber && mobileNumber.length >= 6) {
      // Extract the first 3 digits (880), mask the middle digits, and add the last 3 digits (298)
      const prefix = mobileNumber.substring(0, 3);
      const maskedMiddle = mobileNumber.substring(3, mobileNumber.length - 3).replace(/\d/g, 'X');
      const suffix = mobileNumber.substring(mobileNumber.length - 3);
      return `${prefix}${maskedMiddle}${suffix}`;
    }
    // If the mobile number is not valid, return an empty string or handle it accordingly
    return '';
  }

  return (
    <div>

      <div className="heading mt-4 mb-4">
        <h2 style={{ marginTop: "0", marginBottom: "0" }}>
          REQUEST PENDING FOR CF
        </h2>
        <hr></hr>
      </div>
      <div className="container-fluid">
        <div className="row mt-5 mb-3">
          <div className="col-5 selectDivision">
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              style={{ fontSize: "20px", alignItems: "center" }}
            >
              <option value="">Select a division</option>
              {divisions.map((division) => (
                <option key={division} value={division}>
                  {division}
                </option>
              ))}
            </select>
          </div>
          <div className="col-2 selectDivision">
            <button onClick={handleFetchCases}>Fetch Cases</button>
          </div>
          <div className="col-3 selectDivision">
            <button onClick={handleSearchMatchingAddresses}>
              Search Matching Addresses
            </button>
          </div>

          <div className="col-2 selectDivision">
            <button onClick={handleReset}>Reset</button>
          </div>
        </div>
      </div>

      <div className="">
        <div className="table-container">
          {/* <h1 className="header-req">REQUEST PENDING FOR CF</h1> */}

          {/* <div className="division-dropdown">
          
          <div className="button-container">
            <button onClick={handleFetchCases}>Fetch Cases</button>
           
            <button onClick={handleReset}>Reset</button>
          </div>
        </div> */}
          <p className="case-count">
            Number of Cases Fetched: {caseCount}
            {selectedRowCount > 0 && (
              <>
                {" "}
                | {selectedRowCount} row{selectedRowCount > 1 ? "s" : ""} selected
              </>
            )}
          </p>
          {isSearching && (
            <div className="overlay">
              <CircularProgressWithLabel value={searchProgress} />
            </div>
          )}
          {true && (
            <div class="tables-page-section">
              <div class="container-fluid">
                <div class="row">
                  <div class="row">
                    <div class="col-lg-12">
                      <div className="table-responsive table-bordered table-striped table-hover">
                        <table className="table table-bordered table-striped table-hover" style={{ maxWidth: "100%" }}>
                          <thead className="fixed-header">
                            <tr>
                              <th style={{ width: "5%" }}><input onChange={(e) => handleRowClickAll(e)} type="checkbox" name="" /></th>

                              <th style={{ width: "12%" }}>ORDER NO</th>
                              <th style={{ width: "13%" }}>REQUEST NO</th>
                              <th style={{ width: "13%" }}>DIVISION</th>
                              <th style={{ width: "16%" }}>NAME</th>
                              <th style={{ width: "30%" }}>APPLIED ADDRESS</th>
                              <th style={{ width: "13%" }}>REQUEST TYPE</th>
                            </tr>
                          </thead>
                          {currentRows.map((row) => (
                            <tr
                              key={row.id}
                              className={selectedRows.includes(row) || selectAllChecked ? "selected" : ""}
                            >
                              <td><input checked={selectedRows.includes(row) || selectAllChecked}
                                onChange={(e) => handleRowClick(row)}
                                type="checkbox" name="" /></td>

                              <td>{row.AUFNR}</td>
                              <td>{row.REQUEST_NO}</td>
                              <td>{row.VAPLZ}</td>
                              <td>{row.NAME}</td>
                              <td>{row.SAP_ADDRESS}</td>
                              <td>{row.ILART}</td>
                            </tr>
                          ))}
                        </table>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Pagination controls */}
          {casesData.length > 0 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="m-1">Page {currentPage}</span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={indexOfLastRow >= casesData.length}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      <Toaster />
    </div>
  );
}

export default AutoSearch;