import React, { useState } from "react";
import "./tabs.css";
import ManualSearch from "../ManualSearch";
import SealingManual from "../SealingManual";

function RequestTable({ onSelectRow }) {
  const [activeTab, setActiveTab] = useState("tab1");

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  return (
    <div>
      <div className="tab_container">
        <input
          id="tab1"
          type="radio"
          className="inp"
          name="tabGroup"
          checked={activeTab === "tab1"}
          onChange={() => handleTabChange("tab1")}
        />
        <label htmlFor="tab1">
          <i className="fa fa-file"></i>
          <span>Dues Records</span>
        </label>

        <input
          id="tab2"
          type="radio"
          className="inp"
          name="tabGroup"
          checked={activeTab === "tab2"}
          onChange={() => handleTabChange("tab2")}
        />
        <label htmlFor="tab2">
          <i className="fa fa-file-o"></i>
          <span>MCD Records</span>
        </label>
  {activeTab === "tab1" && (
  <div id="content1s" className={`tab-content ${activeTab === "tab1" ? "active" : ""}`}>
  <ManualSearch />
</div>)}

{activeTab === "tab2" && (
  <div id="content1s" className={`tab-content ${activeTab === "tab2" ? "active" : ""}`}>
  <SealingManual />
</div>)}
     

      
      </div>
    </div>
  );
}

export default RequestTable;
