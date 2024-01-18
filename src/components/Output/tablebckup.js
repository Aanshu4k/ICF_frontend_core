// UserDetailsTable.js

import React, { useState, useEffect, useCallback } from "react";

function UserDetailsTable({ user }) {
  console.log(user,"useruseruseruseruseruseruseruser");


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

  const [selectedRows, setSelectedRows] = useState([]);


  const handleRowClick = (row,e) => {
    // console.log(row,"rowrowrow",e.target.checked);
    if(e.target.checked){
      let filter = selectedRows.filter(x=>x.OUTPUT_CONS_REF == row.OUTPUT_CONS_REF );
      if(!filter.length){
        selectedRows.push(row)
        setSelectedRows(selectedRows)
  
      }
    }else{
      // console.log("2nd .............")
      let filter = selectedRows.filter(x=>x.OUTPUT_CONS_REF != row.OUTPUT_CONS_REF );
   console.log(filter)
       setSelectedRows(filter)
  
      
    }
  


    // setSelectedRows((prevSelectedRows) => {
    //   if (prevSelectedRows.includes(row)) {
    //     return prevSelectedRows.filter((selectedRow) => selectedRow !== row);
    //   } else {
    //     return [...prevSelectedRows, row];
    //   }
    // });

    console.log(row,selectedRows,"selectedRows")
    // Update selected row count
    // setSelectedRowCount(selectedRows.length + 1);
  };


  return (
    // <table>
    //   <thead>
    //     <tr>
    //       <th>Detail</th>
    //       <th>Value</th>
    //     </tr>
    //   </thead>
    //   <tbody>
    //     <tr>
    //       <td>Name</td>
    //       <td>{user.name}</td>
    //     </tr>
    //     <tr>
    //       <td>Email</td>
    //       <td>{user.email}</td>
    //     </tr>
    //     <tr>
    //       <td>Details</td>
    //       <td>{user.details}</td>
    //     </tr>
    //   </tbody>
    // </table>


//     DUES
// : 
// null
// OUTPUT_CONS_REF
// : 
// 0
// OUTPUT_CSTS_CD
// : 
// "R"
// OUTPUT_FATHER_NAME
// : 
// null
// OUTPUT_MOBILE_NO
// : 
// "9"
// OUTPUT_SAP_ADDRESS
// : 
// "S"
// OUTPUT_SAP_COMPANY
// : 
// null
// OUTPUT_SAP_DEPARTMENT
// : 
// "S"
// OUTPUT_SAP_DIVISION
// : 
// "W"
// OUTPUT_SAP_NAME
// : 
// "M"
// OUTPUT_SAP_POLE_ID
// : 
// "T"
// OUTPUT_TARIFF
// : 
// "D"
// SEARCH_MODE
// : 
// "AUTO-MODE"
    <div class="table-card">
    
    
    <div class=" table1" style={{ overflowY: 'scroll', maxHeight: '420px', height: 'auto', overflow: 'auto',width:'1360px' }}>      <table class="bordered bordered1">
        <thead className="bg-light inner-t" >
          <tr>   
          <th style={{ width: '40px' }}>
            <input type="checkbox" name="" />
          </th>
          <th colSpan={10}>SEARCH MODE</th>
          <th style={{ width: '100px' }}>DIVISION</th>
          <th style={{ width: '1200px !important' }}>SUB DIVISION</th>
          <th style={{ width: '60px' }}>CA</th>
          <th style={{ width: '60px' }}>DUES</th>
          <th style={{ width: '80px' }}>DEVICE NO</th>
          <th style={{ width: '120px' }}>ACCOUNT CLASS</th>
          <th style={{ width: '80px' }}>BP TYPE</th>
          <th style={{ width: '80px' }}>TARIFF</th>
          <th style={{ width: '120px' }}>NAME</th>
          <th style={{ width: '120px' }}>FATHER NAME</th>
          <th style={{ width: '580px' }}>SAP ADDRESS</th>
          <th style={{ width: '120px' }}>CONNECTION STATUS</th>
          <th style={{ width: '120px' }}>SAP POLE ID</th>
          </tr>
        </thead>
        <tbody>
        {user.map((row) => (
                  <tr key={row.OUTPUT_SAP_DIVISION}>
                    <td>
                      <input
                        type="checkbox"
                        onChange={(e) => handleRowClick(row,e)}
                        // onChange={() => handleRowSelect(row)}
                        // checked={selectedRows.includes(row)}
                      />
                    </td>
                    <td  colSpan={10}>{row.SEARCH_MODE}</td>
                    <td>{row.OUTPUT_SAP_DIVISION}</td>
                    <td>{row.OUTPUT_SAP_SUB_DIVISION || '-'}</td>
                    <td>{row.OUTPUT_CONS_REF || '-'}</td>
                    <td>{row.DUES || '-'}</td>
                    <td>{row.DEVICE_NO || '-'}</td>
                    <td>{row.ACCT_CLASS || '-'}</td>
                    <td>{'-'}</td>
                    <td>{row.OUTPUT_TARIFF}</td>
                    <td>{row.OUTPUT_SAP_NAME}</td>
                    <td>{row.OUTPUT_FATHER_NAME}</td>

                    <td>{row.OUTPUT_SAP_ADDRESS}</td>
                    <td>{row.OUTPUT_CSTS_CD}</td>

                    {/* <td>{maskMobileNumber(row.OUTPUT_MOBILE_NO)}</td> */}
                    <td>{row.OUTPUT_SAP_POLE_ID}</td>             
                   
                  </tr>
                ))}

        </tbody>
      </table>
    </div>


  </div>

  );
}

export default UserDetailsTable;
