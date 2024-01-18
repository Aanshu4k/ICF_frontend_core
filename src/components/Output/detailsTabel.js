// UserDetailsTable.js

import React, { useState, useEffect, useCallback } from "react";
import ReactPaginate from 'react-paginate';

function UserDetailsTable({ user, page }) {
  // localStorage.removeItem('selectedRows_1')
  console.log(user, "useruseruseruseruseruseruseruser");

  const [currentPage, setCurrentPage] = useState(page);
  const itemsPerPage = 10; // Change this to the number of items you want to display per page.

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

  // const [selectedRows, setSelectedRows] = useState([]);

  const [selectAllChecked, setselectAllChecked] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);


  let selectedRows_1 = [];
  // Load selected rows from local storage on component mount
  // Load selected rows from local storage on component mount
  useEffect(() => {
    const savedSelectedRows = JSON.parse(localStorage.getItem('selectedRows_1')) || [];
    setSelectedRows(savedSelectedRows);
  }, []);

  const handleRowClick = (row, e) => {
    console.log(row, "isgdcuizixcn")
    const newSelectedRows = [...selectedRows];
    if (e.target.checked) {
      newSelectedRows.push(row);
    } else {
      const index = newSelectedRows.findIndex((selectedRow) => selectedRow.SEARCH_ID === row.SEARCH_ID);
      if (index !== -1) {
        newSelectedRows.splice(index, 1);
      }
    }

    console.log(newSelectedRows, "newSelectedRowsnewSelectedRows")

    setSelectedRows(newSelectedRows);

    // Save selected rows to local storage
    localStorage.setItem('selectedRows_1', JSON.stringify(newSelectedRows));
  };

  // const handleRowClick = (row, e) => {
  //   let newSelectedRows = [...selectedRows];

  //   if (e.target.checked) {
  //     newSelectedRows.push(row);
  //   } else {
  //     newSelectedRows = newSelectedRows.filter((selectedRow) => selectedRow.id !== row.id);
  //   }

  //   setSelectedRows(newSelectedRows);

  //   // Save selected rows to local storage
  //   localStorage.setItem('selectedRows_1', JSON.stringify(newSelectedRows));
  // };
  // const handleRowClick = (row, e) => {
  //   if (e.target.checked) {
  //       selectedRows_1.push(row);
  //   } else {
  //     selectedRows_1 = selectedRows_1.filter((selectedRow) => selectedRow.id !== row.id)
  //   }
  //    localStorage.setItem('selectedRows_1',JSON.stringify(selectedRows_1));
  // };


  function formatDateToDDMMYYYY(dateString) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  }

  const handleRowClick_1 = (e) => {
    if (e.target.checked) {
      selectedRows_1 = user;
      // Check all checkboxes
      const checkboxes = document.getElementsByClassName("check_box");
      const checkboxArray = Array.from(checkboxes); // Convert HTMLCollection to array
      checkboxArray.forEach((checkbox) => (checkbox.checked = true));
    } else {
      selectedRows_1 = [];
      // Uncheck all checkboxes
      const checkboxes = document.getElementsByClassName("check_box");
      const checkboxArray = Array.from(checkboxes); // Convert HTMLCollection to array
      checkboxArray.forEach((checkbox) => (checkbox.checked = false));
    }
    localStorage.setItem("selectedRows_1", JSON.stringify(selectedRows_1));
  };




  useEffect(() => { camelCase() }, [])


  const camelCase = () => {
    // Get all the <th> elements in the table
    const thElements = document.querySelectorAll('th');

    thElements.forEach(th => {
      // Get the current text content
      const text = th.textContent.trim();

      // Split the text into words
      const words = text.split(' ');

      // Capitalize the first letter of each word and join them back with spaces
      const capitalizedText = words.map(word => (
        word.charAt(0).toUpperCase() + word.slice(1)
      )).join(' ');
      console.log(capitalizedText, "capitalizedTextcapitalizedTextcapitalizedText")

      // Set the <th> element's text content to the capitalized text
      th.textContent = capitalizedText;
    });


  }
  // Function to check if a row is selected
  const isRowSelected = (row) => {
    const page = currentPage;
    return selectedRows[page] && selectedRows[page].some((selectedRow) => selectedRow.id === row.id);
  };

  return (
    <div class="table-card" >


      <div class="mt-1 table1" style={{ marginLeft: "16px", overflowY: 'scroll', maxHeight: '420px', height: 'auto', overflow: 'auto', width: '1595px' }}>

        <table class="mt-3 bordered bordered1">
          <thead className="mt-3 bg-light inner-t" >
            <tr>
              {/* <th style={{ whiteSpace:'nowrap' }}>
            <input onChange={(e) => handleRowClick_1(e)}  type="checkbox" name="" />
          </th> */}
              {/* <th style={{ whiteSpace:'nowrap' }} >SEARCH MODE</th> */}
              {/* <th  style={{ whiteSpace:'nowrap' }}>DUES</th> */}
              <th style={{ whiteSpace: 'nowrap' }}>BP TYPE</th>

              <th style={{ whiteSpace: 'nowrap', minWidth: "150px" }}>MOVE OUT</th>
              <th style={{ whiteSpace: 'nowrap' }}>CST STS</th>
              {/* <th style={{ whiteSpace:'nowrap' }}>SUB DIVISION</th> */}
              <th style={{ whiteSpace: 'nowrap' }}>CA</th>
              <th style={{ whiteSpace: 'nowrap' }}>NAME</th>
              <th style={{ whiteSpace: 'nowrap' }}>SAP ADDRESS</th>
              <th style={{ whiteSpace: 'nowrap' }}>DEVICE NO</th>
              <th style={{ whiteSpace: 'nowrap' }}>ACCT CLS</th>
              <th style={{ whiteSpace: 'nowrap' }}>TARIFF</th>

              <th style={{ whiteSpace: 'nowrap' }}>SAP POLE ID</th>
              {/* <th  style={{ whiteSpace:'nowrap' }}>DIVISION</th> */}
            </tr>
          </thead>
          <tbody>
            {user.map((row) => (
              <tr key={row.OUTPUT_SAP_DIVISION}>
                {/* <td>
                      <input
                        className="check_box"
                        type="checkbox"
                        onChange={(e) => handleRowClick(row,e)}
                      
                        disabled={row.disabled}
                        checked={selectedRows.some((selectedRow) => selectedRow.SEARCH_ID == row.SEARCH_ID)}

                      />
                    </td> */}
                {/* <td  >{row.SEARCH_MODE}</td> */}
                {/* <td>{row.DUES || '-'}</td> */}
                <td>{row.BP_TYPE || '-'}</td>
                <td style={{ minWidth: "150px" }}>{row.MOVE_OUT_DATE ? formatDateToDDMMYYYY(row.MOVE_OUT_DATE) : '-'}</td>


                {/* <td>{row.OUTPUT_FATHER_NAME}</td> */}

                <td>{row.OUTPUT_CSTS_CD}</td>
                {/* <td>{row.OUTPUT_SAP_SUB_DIVISION || '-'}</td> */}
                <td>{row.OUTPUT_CONS_REF || '-'}</td>
                <td style={{ textAlign: "left", whiteSpace: 'nowrap', width: '500px' }}>{row.OUTPUT_SAP_NAME}</td>
                <td style={{ whiteSpace: 'nowrap', textAlign: "left", width: '1000px' }}>{row.OUTPUT_SAP_ADDRESS}</td>

                <td>{row.DEVICE_NO || '-'}</td>
                <td>{row.OUTPUT_SAP_DEPARTMENT || '-'}</td>

                <td>{row.OUTPUT_TARIFF}</td>


                {/* <td>{maskMobileNumber(row.OUTPUT_MOBILE_NO)}</td> */}
                <td>{row.OUTPUT_SAP_POLE_ID}</td>
                {/* <td>{row.OUTPUT_SAP_DIVISION}</td>          */}

              </tr>
            ))}

          </tbody>
        </table>



      </div>


    </div>

  );
}

export default UserDetailsTable;
