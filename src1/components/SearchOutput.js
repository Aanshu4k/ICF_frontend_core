import React, { useState, useEffect, useCallback } from "react";
import "./SearchOutput.css";
import RequestTable from "./Output/RequestTable";
import SearchResultsTable from "./Output/SearchResultsTable"

function AutocfOutputData() {
  const [selectedRow, setSelectedRow] = useState(null);

  const handleRowSelect = (row) => {
    setSelectedRow(row);
  };

  return (
    <div>
      <RequestTable onSelectRow={handleRowSelect} />
      {/* <SearchResultsTable selectedRow={selectedRow} /> */}
    </div>
  );
}

export default AutocfOutputData;
