import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { TextField, Button, Grid, CircularProgress, capitalize } from "@mui/material";
// import "../components/ManualSearch.css"
import "../components/AutoSearch.css"
import { padding } from "@mui/system";
// import CamelCaseTable from '../components/camelCaseTable.js';
import ProgressBar from '../components/progressBar/progressBar';


function ManualSearch() {
  const { aufnr } = useParams();
  const [caseData, setCaseData] = useState({});
  const [aufnr_1, setAufnr_1] = useState({});
  let selectedRows_1 =[];

  const [loading, setLoading] = useState(true);
  const [addressPart1, setAddressPart1] = useState("");
  const [addressPart2, setAddressPart2] = useState("");
  const [addressPart3, setAddressPart3] = useState("");
  const [searchResults, setSearchResults] = useState([]); // New state for search results;
  const [searchResultsOther, setSearchResultsOther] = useState([]); // New state for search results

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
  let aufnr_11 =  localStorage.getItem('manual');
  if(aufnr_11){
    aufnr_11 = JSON.parse(aufnr_11);
    // console.log(aufnr_11,"aufnr_11");
    if(aufnr_1.AUFNR!=aufnr_11.AUFNR){
      setAufnr_1(aufnr_11);
      setCaseData(aufnr_11);
      
    }
    
  }
  const [progressValue, setProgressValue] = useState(0);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);


  
  const handleButtonClick = (val) => {
    setProgressValue(0)
    setShowProgressBar(true);
    const interval = setInterval(() => {
       if(!val){
        setProgressValue(100)
        clearInterval(interval);
         return 
       }
      setProgressValue((prevValue) => {
        if(val && prevValue==98){
          return prevValue;
        }
      
        if(!val){
         
          clearInterval(interval);
          setProgressValue(100);
       
          return 100;

        }
        
        if (prevValue < 100) {
          return prevValue + 1;
        }
        setShowProgressBar(false)
        
        clearInterval(interval);
        return prevValue;
      });
    }, 100);
  };
  useEffect(() => {
    if (!aufnr) {
      // If aufnr parameter is missing, handle it accordingly
      console.error("AUFNR parameter is missing.");
      setLoading(false);
      return;
    }

    // Show loading GIF when the API call starts
    // setShowLoading(true);

    // Make an API 10.125.126.72 to fetch case data based on the aufnr parameter
    fetch(`http://10.125.126.72:5000/fetch_case_from_aufnr?aufnr=${aufnr}`)
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
  function capitalizeWord(word) {
    if (typeof word !== 'string' || word.length === 0) {
      return word;
    }
    
    return word.toUpperCase();
  }







// Define the maximum number of filtering rounds
const max_filtering_rounds = 10;

// Define the result threshold
const result_threshold = 100;

// Define a function to split words separated by special characters

let exclude_terms = ["khasra","kh","tagore","first","second","third","fourth","top","basement",
    "floor","first floor", "ground floor", "second floor", "third floor","front","back","side",
    "ff", "sf", "tf", "gf", "g/f", "f/f", "s/f", "t/f", "no", "number","fourth floor","gali", "juggi","khanpur","janak",
    "uttam","alaknanda","nehru"
]


function cleanAndUppercaseString(inputString) {
  // Remove special characters and spaces
  const cleanedString = inputString.replace(/[^\w\s]/g, '');

  // Convert the cleaned string to uppercase
  let uppercasedString = cleanedString.toUpperCase();
  uppercasedString = mergeWordsAndRemoveSpaces(uppercasedString)
  return uppercasedString;
}
function mergeWordsAndRemoveSpaces(inputString) {
  // Split the input string by spaces
  const words = inputString.split(' ');

  // Remove spaces and merge all words together
  const mergedString = words.join('');

  return mergedString;
}
const refineSearch = async (address,data,str) => {
  
    return new Promise(async(res,rej)=>{
      try {
        console.log(cleanAndUppercaseString(str),"cleanAndUppercaseString(str)")
        const currentWordFilteredResults = [];
        
        let currentWordsArray = [cleanAndUppercaseString(str)]
        // Filter the Solr results based on the current word parts
        for (const doc of data) {
            const combinedAddresses = doc.COMBINED_ADDRESS || [];
            let combinedAddressString = '';
      
            if (Array.isArray(combinedAddresses)) {
              combinedAddressString = combinedAddresses.join(' ');
            } else if (typeof combinedAddresses === 'string') {
              combinedAddressString = combinedAddresses;
            }
             
             currentWordsArray = currentWordsArray.filter(value => !exclude_terms.includes((''+value).toLowerCase()));

            const includesWord = currentWordsArray.some(word => combinedAddressString.includes((''+word).replace(/[^\w\s]/g, '')));

                if (includesWord) {
                    currentWordFilteredResults.push(doc);
                  }
          }


          res(currentWordFilteredResults)
        
      
      } catch (error) {
        console.log(error)

        res([])
  
        // Handle errors
      }
    })
    
  };

  const [showModal, setShowModal] = useState(false);
  const [refineSeachData, setRefineSeachData] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchEnabled, setIsSearchEnabled] = useState(false);
  const [searchError, setSearchError] = useState("");
 // Function to open the modal
 const openModal = () => {
  var modal = document.getElementById("searchModal");
  modal.classList.add("show");
  modal.style.display = "block";
  document.body.classList.add("modal-open");
  document.body.classList.add("blur-background"); // Apply the blur effect
};

// Function to close the modal
const closeModal = () => {
  var modal = document.getElementById("searchModal");
  modal.classList.remove("show");
  modal.style.display = "none";
  document.body.classList.remove("modal-open");
  document.body.classList.remove("blur-background"); // Remove the blur effect
};

// Function to handle the search input change
const handleSearchInputChange = async (e) => {
  const query = e.target.value;
  await setSearchQuery(query);
  console.log(searchQuery,"searchQuery");
  if (searchQuery.trim() == "") {
    console.log("adsx")
    setSearchError("Search query cannot be empty");
  } else {
    // Clear any previous error message
    setSearchError("");
  }
};
const originalList = ()=>{
  setSearchResults(searchResultsOther);

}

// Function to handle the "Search" button click in the modal
const handleSearchClick = async () => {
  console.log("adsx");
 let result = await refineSearch("",searchResultsOther,searchQuery);
 setSearchResults(result);


  if (searchQuery.trim() === "") {
    console.log("adsx")

    setSearchError("Search query cannot be empty");
     
  } else {
    // Clear any previous error message
    setSearchError("");

    // Perform the search
    // ...
    // closeModal();

  }
  console.log(searchError)

};


  // Function to handle manual search button click
  const handleManualSearchClick = () => {
    handleButtonClick(1)
    // Combine the address parts into a single address
    const fullAddress = `${addressPart1} ${addressPart2} ${addressPart3}`;

     // Show loading GIF when the API call starts
    //  setShowLoading(true);

    // Make an API call to fetch search results


    let str_arr = ["1ST","I","2ND","II","3RD","III"];
    let complete_addr = capitalizeWord(addressPart1)+''+capitalizeWord(addressPart2);
 
   let words_arr = [complete_addr]
    for (let index = 0; index < str_arr.length; index++) {
     const element = str_arr[index];
     let words = capitalizeWord(addressPart1)+element+capitalizeWord(addressPart2);
     words_arr.push(words);
    }

    
    fetch("http://localhost:5000/search_manual_mode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        addressPart1 : words_arr,
        addressPart2:capitalizeWord(addressPart2),
        addressPart3:capitalizeWord(addressPart3),
        VAPLZ: caseData.VAPLZ, // Assuming VAPLZ comes from case data
      }),
    })
      .then((response) => response.json())
      .then(async (data) => {
        // let res = await searchMatchingResultAlgo("",resultsData,str);
        setSearchResults(data.data);
        setSearchResultsOther(data.data);

        handleButtonClick(0)

        if (data.error) {
          console.error("Error fetching search results:", data.error);
          // Handle error condition if needed
        } else {
          // Set the fetched search results in state
        }
        setShowLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching search results:", error);
        setShowLoading(false);
        handleButtonClick(0)

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


  const handleRowClick = (row, e) => {
    if (e.target.checked) {
        selectedRows_1.push(row);
    } else {
      selectedRows_1 = selectedRows_1.filter((selectedRow) => selectedRow.OUTPUT_CONS_REF !== row.OUTPUT_CONS_REF)
    }    

    console.log(selectedRows_1)
  };

  const handleRowClick_1 = (e) => {
    if (e.target.checked) {
      selectedRows_1 = searchResults;
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
  };
  
  const handleAutoBreakClickAgain = () => {
    if(!selectedRows_1.length){
      alert("pls select atleast one row");
      return
    }
    console.log(selectedRows_1,"selectedRows_1",aufnr_1)
    // setShowLoading(true);
     let request_data = aufnr_1 ? aufnr_1: {};
     let search_results = selectedRows_1 || []; 
    fetch("http://localhost:5000/append_manual_cases", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        request_data,
        search_results,
        
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          console.error("Error fetching search results:", data.error);
          // Handle error condition if needed
        } else {
          console.log("success")
              // window.location.href= '/output'

          // Set the fetched search results in state
          // setSearchResults(data.data);
        }
        setShowLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching search results:", error);
        setShowLoading(false);
        // Handle error condition if needed
      });

    // localStorage.setItem('maunalSearchResult',JSON.stringify(searchResults));
  };

  return (
    <div>
           <h3 style={{textAlign:"center"}} className="mt-2">Manual Search</h3>

      {loading ? (
        // Show loading component while data is being fetched
        <div className="loading-container">
          <CircularProgress size={100} />
        </div>
      ) : (
        <table className="table3" >
          <tbody>
            <tr>
              <th>REQUEST NO</th>
              <th>COMPANY</th>
              <th>DIVISION</th>
              <th>NAME</th>
              <th style={{width:'30%'}}>REQUEST ADDRESS</th>
              <th>REQUEST TYPE</th>
              <th>EMAIL</th>
            </tr>
            <tr>
              <td>{aufnr_1.REQUEST_NO}</td>
              <td>{aufnr_1.BUKRS}</td>
              <td>{aufnr_1.VAPLZ}</td>
              <td>{aufnr_1.NAME}</td>
              <td>{aufnr_1.SAP_ADDRESS}</td>
              <td>{aufnr_1.ILART}</td>
              <td>{aufnr_1.E_MAIL}</td>
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
      {showProgressBar && <ProgressBar value={progressValue} max={100} />}

        {/* Inputs and buttons */}
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <TextField
              fullWidth
              label="House/Plot/Block/Khasra"
              variant="outlined"
              value={addressPart1}
              onChange={(e) => setAddressPart1(e.target.value)}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Number(House/Plot/Block/Khasra)"
              variant="outlined"
              value={addressPart2}
              onChange={(e) => setAddressPart2(e.target.value)}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Area"
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
            {searchResults.length > 0 && (  <Button
              variant="contained"
              color="success"
              onClick={(e) => handleAutoBreakClickAgain(e.target.value)}
              style={{ marginLeft: "28px" }}
            >
              Append to main file
            </Button>
            
           )}
            {true > 0 && (  <Button
              variant="contained"
              color="warning"
              onClick={(e) => openModal(e.target.value)}
              style={{ marginLeft: "28px" }}
            >
             Refine Seach
            </Button>
            
           )}

<div class='modal' id="searchModal" tabindex="-1" role="dialog">
  <div class="modal-dialog" role="document">
  <div className="modal-content">
            <div style={{textAlign:"center" ,display:"block"}} className="modal-header">
              <h5   style={{textAlign:"center"}} className="modal-title">Refine Search</h5>
            
            </div>
            <div className="modal-body">
              {/* Search Input */}
              <div className="form-group">
                <label>Search Query</label>
                <input
                  type="text"
                  className="form-control"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                />
                  {/* {searchError && <span style={{color:"red"}} className="invalid-feedback1">{searchError}</span>} */}

              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={closeModal}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSearchClick}
              >
                Search
              </button>
            </div>
          </div>
  </div>
</div>


      
      
            {true > 0 && (  <Button
              variant="contained"
              color="info"
              onClick={(e) => originalList()}
              style={{ marginLeft: "28px" }}
            >
              Original List
            </Button>
            
           )}
     
          </Grid>
        </Grid>
      </div>

    

      {searchResults.length > 0 && (
       <div class="tables-page-section">

       <div class="container-fluid">
         <div class="row">
         <h3 style={{ marginLeft: "28px" }}>Total Results : {searchResults.length}</h3>

           <div class="row">
             <div class="col-lg-12" style={{"padding":'20px'}}>
               <div className="table-responsive table-bordered table-striped table-hover" style={{maxHeight: "450px", width:"100%" ,overflow: "auto", marginBottom: "10px"}}>
                 <table className="table table2 table-bordered table-striped table-hover" style={{ maxWidth: "100%", height:"200px" }}>
                   <thead className="fixed-header">
                   <tr>
                     <th style={{ whiteSpace:'nowrap' }}>
                   <input onChange={(e) => handleRowClick_1(e)}  type="checkbox" name="" />
                 </th>
                       {/* <th>COMPANY</th> */}
                       <th>DIVISION</th>
                       <th>ACCOUNT CLASS</th>
                       <th>BP TYPE</th>
                       <th>CA NUMBER</th>
                       <th>CONSUMER STATUS</th>
                       <th>CONSUMER NAME</th>
                       {/* <th>MOBILE NO</th> */}
                       <th>CONSUMER ADDRESS</th>
                       <th>POLE ID</th>
                       <th>TARIFF CATEGORY</th>
                     </tr>
                   </thead>
                   {searchResults.map((result, index) => (
                    
                    <tr key={index}>
                       <td>
                          <input
                            className="check_box"
                            type="checkbox"
                            onChange={(e) => handleRowClick(result,e)}
                            // onChange={() => handleRowSelect(row)}
                            // checked={selectedRows.includes(row)}
                          />
                        </td>
                      {/* <td>{result.SAP_COMPANY}</td> */}
                      <td>{result.SAP_DIVISION}</td>
                      <td>{result.SAP_DEPARTMENT}</td>
                      <td>{result.BP_TYPE}</td> 
                      <td>{result.CONS_REF}</td>
                      <td>{result.CSTS_CD}</td>
                      <td>{result.SAP_NAME}</td>
                      {/* <td>{result.MOBILE_NO}</td> */}
                      <td style={{width:'30%'}}>{result.SAP_ADDRESS}</td>
                      <td>{result.SAP_POLE_ID}</td>
                      <td>{result.TARIFF}</td>
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
    </div>
  );
}

export default ManualSearch;