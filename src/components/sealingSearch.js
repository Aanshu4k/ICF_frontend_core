import React, { useState, useEffect, useCallback } from "react";
import "./SearchOutput.css";
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../components/progressBar/progressBar';
import ReactPaginate from 'react-paginate';
import UserDetailsTable from "./Output/detailsTabel";
import CircularProgressWithLabel from "./CircularProgressWithLabel";

const url = require("./config.json");

function SealingRequestTable({ onSelectRow }) {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 100;

  // Define state to store the users to display
  const [usersToDisplay, setUsersToDisplay] = useState([]);


  let [requestData, setRequestData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestCount, setRequestCount] = useState(0); // New state for request count
  const [selectedRow, setSelectedRow] = useState(null); // New state for selected row
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [matchingResult, setMatchingResult] = useState({});
  const [matchingResultOther, setMatchingResultOther] = useState({});
  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [isDuesSearchComplete, setDuesSearchComplete] = useState(false);
  const [isDuesSearchComplete_1, setDuesSearchComplete_1] = useState(false);

  const [checked, setCheked] = useState([]);
  const [searchResults, setSearchResults] = useState([]); // New state for search results;
  const [searchResultsOther, setSearchResultsOther] = useState([]); // New state for search results

  const [showModal, setShowModal] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchEnabled, setIsSearchEnabled] = useState(false);
  const [searchError, setSearchError] = useState("");

  const navigate = useNavigate();

  const [progressValue, setProgressValue] = useState(0);
  const [showProgressBar, setShowProgressBar] = useState(false);



  const handleButtonClick = (val) => {
    setProgressValue(0)
    setShowProgressBar(true)
    const interval = setInterval(() => {
        console.log("a")
      if (!val) {

        setProgressValue(100)
        clearInterval(interval);
                    setShowProgressBar(false)

        return
      }
      setProgressValue((prevValue) => {
        if (val && prevValue == 98) {
          return prevValue;
        }

        if (!val) {

          clearInterval(interval);
          setProgressValue(100);

          return 100;

        }

        // if (prevValue==100) {
        //     setShowProgressBar(false)

        //     clearInterval(interval);
        //     setProgressValue(100);
  
        //     return 100;
  
        //   }

        if (prevValue < 100) {
          return prevValue + 1;
        }
        setShowProgressBar(false)

        clearInterval(interval);
        return prevValue;
      });
    }, 100);
  };


  const handleManualSearchClick = (user, count) => {
    console.log(matchingResultOther);
    let data1 = !count ? matchingResultOther[`${user.AUFNR}`] : [];
    let data = [];
    if (count) {
      localStorage.removeItem('existingResult');
      localStorage.setItem('manual', JSON.stringify(user));
      navigate('/sealingManual')
      return
    }
    data1.forEach(x => {
      let obj = {
        SAP_DIVISION: x.OUTPUT_SAP_DIVISION,
        SAP_DEPARTMENT: x.OUTPUT_SAP_DEPARTMENT,
        BP_TYPE: x.BP_TYPE,
        CONTRACT_ACCOUNT: x.OUTPUT_CONS_REF,
        CSTS_CD: x.OUTPUT_CSTS_CD,
        MOVE_OUT: x.MOVE_OUT_DATE,
        SAP_NAME: x.OUTPUT_SAP_NAME,
        SAP_ADDRESS: x.OUTPUT_SAP_ADDRESS,
        SAP_POLE_ID: x.OUTPUT_SAP_POLE_ID,
        TARIFF: x.OUTPUT_TARIFF,
        SEARCH_MODE: "AUTO-MODE",
        DUES: x.DUES,
        id: x.SEARCH_ID
      }
      data.push(obj)
    });

    localStorage.setItem('existingResult', JSON.stringify(data));
    localStorage.setItem('manual', JSON.stringify(user));
    navigate('/sealingManual');
  };



  // Function to handle inner data pagination
  const handleInnerDataPagination = (user, page) => {
    const startIndex = (page ? +page : currentPage) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    console.log(matchingResult[user.AUFNR], "mmmmmmmmmmmmmm", currentPage)
    return matchingResult[user.AUFNR].slice(startIndex, endIndex);
  };

  const handlePageClick = (data) => {
    console.log(data.selected, "kamal")
    setCurrentPage(data.selected);
  };
  const [counts, setCounts] = useState({});

  const [searchResults1, setSearchResults1] = useState([]); // New state for search results;

  // Function to handle forward and next pagination controls
  const getCounts = (data) => {
    console.log(data.length, "kkkkkkkkkkkl")
    return {
      normal: data.filter(x => x.BP_TYPE == 'Normal').length,
      total: data.length,
      enforcement: data.filter(x => x.BP_TYPE == 'ENFORCEMENT').length,
      legal: data.filter(x => x.BP_TYPE == 'LEGAL').length,
      mcd: data.filter(x => x.BP_TYPE == 'Sealing').length

    }
  };

  const searchMatchingResultAlgoAgain = async (address, data, val) => {

    console.log(address, "inputAddressinputAddressinputAddressinputAddress")

    return new Promise(async (res, rej) => {
      try {
        const inputAddress = address;
        function containsNumbers(word) {
          return /\d/.test(word);
        }
        const wordsArray = inputAddress.split(' ');
        console.log(wordsArray, "wordsArraywordsArray")
        // Merge words with adjacent numbers but keep "h-no" as a single word
        const mergedWords = [];
        let currentWord = '';


        for (const word of wordsArray) {

          if (currentWord && !containsNumbers(word)) {
            mergedWords.push(currentWord);
            currentWord = '';
          }
          const endsWithNumber = /\d$/.test(currentWord);
          const startsWithNumber = /^\d/.test(word);
          console.log(currentWord, word, "lll");
          if (currentWord && currentWord.length <= 2 && containsNumbers(word)) {
            currentWord = currentWord ? `${currentWord} ${word}` : word;

          } else {
            if (startsWithNumber && !endsWithNumber) {
              currentWord = currentWord ? `${currentWord} ${word}` : word;
            } else {

              mergedWords.push(currentWord);

              currentWord = word;

            }
          }

        }


        if (currentWord) {
          mergedWords.push(currentWord);
        }

        let splitAndCleanedWords = mergedWords.map(word => word.replace(/\W/g, '').split(' ')).flat();

        splitAndCleanedWords = splitAndCleanedWords.map(x => x.toUpperCase())


        let new_words_arr = []
        function addRomanNumerals(word) {
          let new_word = word;
          if (word.includes("1ST")) {
            let r = new_word.replace('1ST', '');
            new_words_arr.push(r)
            new_words_arr.push("1038")
            new_word = new_word.replace('1ST', 'I',);
          } else if (word.includes("2ND")) {
            let r = new_word.replace('2ND', '');
            new_words_arr.push(r)
            let w = new_word.replace('2ND', '2');
            new_words_arr.push(w)
            new_word = new_word.replace('2ND', 'II');
          } else if (word.includes("3RD")) {
            new_word = new_word.replace('3RD', 'III');
          } else if (word.includes("4TH")) {
            new_word = new_word.replace('4TH', 'IV');
          }
          new_words_arr.push(new_word);
          return word;
        }

        let wordsWithNumbers = splitAndCleanedWords;

        // Filter the array to get words with numbers
        if (!val) {
          wordsWithNumbers = splitAndCleanedWords.filter(containsNumbers);
        }
        let modifiedWords = wordsWithNumbers.map(addRomanNumerals);
        modifiedWords = modifiedWords.concat(new_words_arr);
        console.log(wordsWithNumbers, modifiedWords);




        res(modifiedWords)



      } catch (error) {
        console.log(error)

        res([])

        // Handle errors
      }
    })

  };


  const handleSearchClick = async (user) => {
    console.log("adsx");
    if (!searchQuery) {
      return
    }
    let searchResults = matchingResult[`${user.AUFNR}`];
    // searchResults = searchResults.filter(x=>x.)
    let result = await refineSearch(user, searchResults, searchQuery);
    setMatchingResultOther(matchingResultOther);
    setUsersToDisplay(matchingResultOther);

    console.log(result, "resultresultresultresultresultresult")
    setSearchQuery("");
    matchingResult[`${user.AUFNR}`] = result;
    setMatchingResult(matchingResult);
    // setMatchingResult()
    // closeModal();

    setSearchResults(result);
    //  setCurrentSearchResults(result);


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
  function removeSpecialCharsAndCapitalize(inputString) {
    // Remove special characters and spaces, but keep numeric characters
    const cleanedString = inputString.replace(/[^a-zA-Z0-9]/g, '');

    // Capitalize the cleaned string
    const capitalizedString = cleanedString.toUpperCase();

    return capitalizedString;
  }

  const refineSearch = async (user, data, str) => {
    return new Promise(async (res, rej) => {
      try {
        if (str) {
          str = removeSpecialCharsAndCapitalize(str);
        }
        const currentWordFilteredResults = [];
        // Define a function to check if an array of strings matches the criteria
        function matchesCriteria(arr, str) {
          if (!Array.isArray(arr)) {
            return false;
          }
          let numericPart1 = str.match(/\d+(\.\d+)?/g);
          let alphabetPart1 = str.match(/[A-Za-z]+/);



          console.log(alphabetPart1, numericPart1, arr, "last");
          arr = arr.filter(x => x != '')
          let is_exist = false;
          for (let index = 0; index < arr.length; index++) {
            const element = arr[index];
            let alphabetPart = element.match(/[A-Za-z]+/);
            let numericPart = element.match(/\d+(\.\d+)?/g);

            if (!alphabetPart) {

              console.log(alphabetPart, "alphabetPartalphabetPartalphabetPartalphabetPart")
              alphabetPart = ['#']
            }
            if (!numericPart) {
              numericPart = ['0']
            }
            if (numericPart1 && alphabetPart1) {
              console.log("popopoo", alphabetPart, numericPart, numericPart1, alphabetPart[0].includes(str), alphabetPart[0].includes(alphabetPart1) && numericPart[0] == numericPart1[0])
              let rd = alphabetPart[0].includes(alphabetPart1[0]) && numericPart[0] === numericPart1[0];
              if (rd) {
                console.log("kkjjj")
                // is_exist =true;
                return true

                // break;
              }
            }
            if (alphabetPart1 && !numericPart1) {
              console.log("aaassaaaaaaaaaas1aaaaaaaaaa", alphabetPart[0], alphabetPart1[0])
              let rd = alphabetPart[0].includes(alphabetPart1[0]);
              if (rd) {
                console.log("aaassaaaaaaaaaaaaaaaaaaaa")
                // is_exist =true;
                return true
                // break;
              }
            }
            if (numericPart1 && !alphabetPart1) {
              let rd = numericPart[0] === numericPart1[0];
              if (rd) {
                console.log("kkjjj")
                // is_exist =true;
                return true;
              }
            }


            console.log(is_exist, "is_existis_existis_exist")
          }
          return false; // Return true or false after checking all elements in arr


        }

        for (const doc of data) {
          let finalStr = await searchMatchingResultAlgoAgain(doc.OUTPUT_SAP_ADDRESS, [], 1);
          console.log(finalStr, "///////////////////");

          // Check if any element in the array matches the criteria
          if (matchesCriteria(finalStr, str.toUpperCase())) {
            // if (doc.BP_TYPE === 'Normal') {
            currentWordFilteredResults.push(doc);
            // }

            // currentWordFilteredResults.push(doc);
          }
        }


        console.log(currentWordFilteredResults, "kaml sharma")

        // const uniqueArray = currentWordFilteredResults.filter((item, index, self) => {
        //   return (
        //     index ===
        //     self.findIndex((t) => t.CONS_REF == item.CONS_REF)
        //   );
        // });
        let data1 = matchingResultOther[`${user.AUFNR}`];

        // let otherBptype = data1.filter(x=>x.BP_TYPE!='Normal');
        // currentWordFilteredResults.push(...otherBptype)

        res(currentWordFilteredResults);

      } catch (error) {
        console.log(error);
        res([]);
        // Handle errors
      }
    });
  };




  const toggleDetails = (index, user, val) => {
    console.log(user, "user");
    let data1 = matchingResultOther[`${user.AUFNR}`];
    if (data1 && !val) {
      setRequestData((prevState) => {
        const updatedUsers = prevState.map((user, i) => {
          if (user.showDetails) {
            return { ...user, showDetails: false };
          } else if (i === index) {
            return { ...user, showDetails: true };
          } else {
            return user;
          }
        });
        return updatedUsers;
      });
      handleManualSearchClick(user,null)
      return
    }



    fetch(`${url.API_url}/api/fetch_search_matches?aufnr=${user.AUFNR}`)
      .then((response) => response.json())
      .then((data) => {
        localStorage.getItem("");
        // alert("lllll")
        matchingResult[`${user.AUFNR}`] = data.data;
        matchingResultOther[`${user.AUFNR}`] = data.data;
        console.log(data.data && data.data.length, "dada", data.data)
        if (data.data && data.data.length) {        
          // setIsdrop(+is_exist)
        } else {
          // setIsdrop(1)
        }
     
        setRequestData((prevState) => {
          const updatedUsers = prevState.map((user, i) => {
            if (i === index) {
              return { ...user, showDetails: !user.showDetails };
            } else {
              return user;
            }
          });
          return updatedUsers;
        });
        handleManualSearchClick(user,null)

        let sessionData = localStorage.getItem('maunalSearchResult');
        if (sessionData) {
          sessionData = JSON.parse(sessionData);
          requestData.push(...sessionData)
          setRequestData(requestData)
        }
        setLoading(false);
        console.log(matchingResult, "datadatadata")


      })
      .catch((error) => {
        console.error("Error fetching search results data:", error);
        setLoading(false); // Set loading to false in case of an error
      });

  };

  useEffect(() => {
    getInitialData();
  }, []);

  

  const getInitialData = async () => {
    const requests = [];
    handleButtonClick(1);

    // setIsSearching(true);
    let payload = localStorage.getItem('searchStr');
    if(!payload){
        return
    };
    let selectedMatchedRows = localStorage.getItem('selectedMatchedRows1');
    if(selectedMatchedRows){
        selectedMatchedRows = JSON.parse(selectedMatchedRows);
    }else{
        selectedMatchedRows = [];
    }
    // setIsSearching(true);
    // setSearchProgress(1);
    
    payload = JSON.parse(payload);
    let arr=[]
    for (let i = 0; i < payload.finalStr.length; i++) {
        // Use regular expression to extract numeric part
        let numericPart = payload.finalStr[i].match(/\d+/);
      
        // If numeric part is found, push it back into the array
        if (numericPart) {
            arr.push(numericPart[0]);
        }
      }
      let include_word = ['KH',"GALI","SEC","NAGAR","TYPE","PHASE","BLOCK","WARD"]
    payload.finalStr =[...payload.finalStr,...arr];
    payload.secondFinalStr = payload.sealing_str.filter(word => {
        let include = include_word.some(keyword => word.toUpperCase().includes(keyword));
        if (include) {
            payload.finalStr.push(word);
            return false;
        }
        return true; 
    });

   try {
    const requestPromise = await fetch(`${url.API_url}/api/sealigSearch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      let data  = await requestPromise.json();
  console.log(data,"hurreyyyyyyy")
    selectedMatchedRows.map(x=>{
        x.count = data.count;
    });
    handleButtonClick(0);
    setIsSearching(false);
    // setSearchProgress(0);
    localStorage.setItem('sealing_data_1',JSON.stringify(data.results_count))
    setRequestData(selectedMatchedRows)
    console.log(
      `Matching addresses for SAP_ADDRESS }:`,
      data
    );
   } catch (error) {
    // setRequestData(selectedMatchedRows)
    // handleButtonClick(0);
    // setIsSearching(false);
    // setSearchProgress(0);
   }
  }

  const handleFilterByBPType = (user, bpType) => {
    if (!bpType) {
      matchingResult[`${user.AUFNR}`] = matchingResultOther[`${user.AUFNR}`];
      setMatchingResult(matchingResult);
      let obj = getCounts(matchingResultOther[`${user.AUFNR}`]);
      setCounts(obj)
      console.log("final ...", matchingResultOther[`${user.AUFNR}`])
      return
    }
    const filteredData = matchingResultOther[`${user.AUFNR}`].filter((item) => item.BP_TYPE == bpType);
    // For example, if you want to display the filtered results:
    matchingResult[`${user.AUFNR}`] = filteredData;
    setMatchingResult(matchingResult);

    let obj = getCounts(matchingResultOther[`${user.AUFNR}`]);
    setCounts(obj)
  };




  return (
    <div class="tables-page-section mt-1">
           <h3 style={{textAlign:"center",textDecoration:"underline"}} className="">Auto Results For MCD</h3>
           {/* {isSearching && (
          <div className="overlay">
            <CircularProgressWithLabel value={searchProgress} />
          </div>
        )} */}
      <div class="container-fluid">
        {showProgressBar && <ProgressBar value={progressValue} max={100} />}

        <div class="row">
          <div class="col-lg-12">
            <div className="card shadow-lg rounded-0">
              
              <div
                id="tabs-a"
                className=" t outer-table table-bordered table-striped table-hover"
               style={{width:"100%", overflow:"scroll",  maxHeight:"600px", }}>
                <table
                  className="table table-bordered table-striped table-hover table-o"
                  style={{ Width: "100%", overflow:"scroll", maxHeight:"400px" , }}
                >
                  <thead className="fixed-header">
                    <tr>
                      <th style={{ whiteSpace: "nowrap" }}>ORDER NO</th>
                      <th style={{ whiteSpace: "nowrap" }}>REQUEST NO</th>
                      <th style={{ whiteSpace: "nowrap" }}>DIVISION</th>
                      <th style={{ width: "180px", whiteSpace: "nowrap" }}>NAME</th>
                      <th style={{ width: "380px", whiteSpace: "nowrap" }} >APPLIED ADDRESS</th>
                      <th style={{ whiteSpace: "nowrap" }}>REQUEST TYPE</th>
                      <th style={{ whiteSpace: "nowrap" }}>Sealing Count</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requestData.map((user, index) => (
                      <React.Fragment key={index}>
                          

                        <tr className={(user.count > 1000 || !user.count) ? "high-count-row" : "table-row"}>
                          {/* <td>
                            <input
                              checked={
                                selectedRows.includes(user) || selectAllChecked
                              }

                              type="checkbox"
                              name=""
                            />
                          </td> */}

                          <td>{user.AUFNR}</td>
                          <td>{user.REQUEST_NO}</td>
                          <td>{user.VAPLZ}</td>
                          <td>{user.NAME}</td>
                          <td>{user.SAP_ADDRESS}</td>
                          <td>
                            {(() => {
                              switch (user.ILART) {
                                case 'U01':
                                  return 'New Connection';
                                case 'U02':
                                  return 'Name Change';
                                case 'U03':
                                  return 'Load Enhancement';
                                case 'U04':
                                  return 'Load Reduction';
                                case 'U05':
                                  return 'Category Change (Low to High)';
                                case 'U06':
                                  return 'Category Change (High to Low)';
                                case 'U07':
                                  return 'Address Correction';
                                default:
                                  return user.ILART; // If none of the above, just display the original value
                              }
                            })()}
                          </td>                          <td>{user.count ? user.count : 0}</td>

                          
                          <td style={{ style: "width:150px" }} className="table-cell btsmain">
                            <div class="d-flex justify-content-evenly">
                              {/* {(user.count >= 2000 || !user.count) && (<button
                                style={{ background: "darkorange", whiteSpace: 'nowrap' }}
                                className="details-button"
                                onClick={(e) => handleManualSearchClick(user, 1)}
                              >

                                {"Manual Mode"}

                              </button>)} */}


                              {(true) && (
                                <>
                                  <button
                                    style ={(user.count > 1000 || !user.count) ? {width:"100px", borderRadius:"8px", marginTop:"4px", marginBottom:"4px", padding:"4px 7px", backgroundColor:"#318ef3"} : {width:"100px", borderRadius:"8px",  marginTop:"4px", marginBottom:"4px", padding:"4px 7px" , backgroundColor:"#318ef3"}}
                                    className={(user.count > 1000 || !user.count) ? "high-count-row" : "details-button"}
                                    onClick={() => toggleDetails(index, user)}
                                  >
                  
                                    {false ? "Hide" : " View "}
                                    <i className="fa fa-eye" aria-hidden="true" ></i>
                                  </button>
                                </>
                              )}

                              {/* {(localStorage.getItem("isTokenExist") && user.count < 2000 && user.count > 0) && (
                                <>
                                  <button
                                    style={{ color: "green", backgroundColor: "white", border: "1px solid green" }}
                                  >
                                    Auto Allocated
                                  </button>
                                </>
                              )} */}
                              {/* {user.count <100 && (  <button
  style={{ whiteSpace: 'nowrap', background: isdrop === 0 ? 'darkorange' : 'green' }}
  className="details-button"
  onClick={() => dropData(user)}
>
  {isdrop === 0 ? 'Drop' : 'Regenerate'}
</button>) } */}



                            </div>

                          </td>
                        </tr>

                        {false && (


                          <tr style={{ marginBottom: "3px" }} className="details-row">

                            <td colSpan="10" className="open-details">

                              <div>
                                <div>
                                  <h4 style={{ marginLeft: "", color: 'darkslategray', cursor: 'pointer' }}>
                                    <span style={{ color: 'darkslategray' }} onClick={() => handleFilterByBPType(user, null)} >Total:</span>
                                    {false ? <span style={{ marginLeft: '8px' }}>0</span> : <span style={{ color: 'darkslategray', marginLeft: '8px' }}>{counts.total || 0}</span>}
                                    <span style={{ marginLeft: '12px', cursor: 'pointer' }}>
                                      <span onClick={() => handleFilterByBPType(user, 'Normal')} style={{ color: 'darkslategray' }}>, Normal:</span> {(counts.normal || 0)}
                                    </span>
                                    <span style={{ marginLeft: '12px', cursor: 'pointer' }}>
                                      <span onClick={() => handleFilterByBPType(user, 'ENFORCEMENT')} style={{ color: 'darkslategray' }}>, Enforcement:</span> {(counts.enforcement || 0)}
                                    </span>
                                    <span style={{ marginLeft: '12px', cursor: 'pointer' }}>
                                      <span onClick={() => handleFilterByBPType(user, 'LEGAL')} style={{ color: 'darkslategray' }}>, Legal:</span> {(counts.legal || 0)}
                                    </span>
                                    <span style={{ marginLeft: '12px', cursor: 'pointer' }}>
                                      <span onClick={() => handleFilterByBPType(user, 'Sealing')} style={{ color: 'darkslategray' }}>, MCD:</span> {(counts.mcd || 0)}
                                    </span>

                                    <span style={{ marginLeft: '12px', cursor: 'pointer' }}>
                                      <span style={{ color: 'darkslategray' }}>, Search Results Count:</span> {(matchingResult[`${user.AUFNR}`] ? matchingResult[`${user.AUFNR}`].length : 0)}
                                    </span>

                                  </h4>
                                </div>
                                <div style={{ marginTop: "-32px" }}>
                                  <ReactPaginate
                                    pageCount={Math.ceil(matchingResult[user.AUFNR].length / itemsPerPage)}
                                    pageRangeDisplayed={3}
                                    marginPagesDisplayed={1}
                                    onPageChange={handlePageClick}
                                    containerClassName="pagination"
                                    activeClassName="active"
                                    previousLabel={<i className="previous" />}
                                    nextLabel={<i className="next" />}
                                  />
                                </div>
                              </div>

                              <UserDetailsTable user={handleInnerDataPagination(user, currentPage)} page={currentPage} />{" "}
                              {/* content */}

                              <div class="d-flex justify-content-evenly mt-4">


                                {/* <button onClick={(e) => handleCalculateDues(index, user)} disabled={calculatingDues}>
                                        {calculatingDues ? "Calculating..." : "Calculate Dues"}
                                      </button> */}

                                {/* {true > 0 && (<Button
                                  variant="contained"
                                  color="warning"
                                  onClick={(e) => openModal(e.target.value)}
                                  style={{ marginLeft: "28px" }}
                                >
                                  Filter Address
                                </Button>

                                )} */}



                                <div className="form-group">

                                  <div class="d-flex justify-content-center">

                                    <div>
                                      {/* <label>Search Query</label>

                                            <input
                                              type="text"
                                              className="form-control mr-5"
                                              style={{ width: "95%" }}
                                              value={searchQuery}
                                              onKeyPress={(e) => handleKeyPress(e,user)}
                                              onChange={handleSearchInputChange}
                                            /> */}
                                    </div>



                                  </div>


                                </div>

                                {/* <button onClick={(e) => freezeData(user.REQUEST_NO)} >Freeze</button> */}


                                {(!localStorage.getItem("isTokenExist")) && (
                                  <button
                                    onClick={(e) => handleManualSearchClick(user)}
                                  >
                                    Manual Search
                                  </button>
                                )}



                                {/* <button style={{background:"green",color:"white"}} onClick={(e) => exportXl(user)} >Export xlxs</button> */}


                              </div>
                              <hr style={{ borderTop: '2px solid #000' }} />




                              {/* button added >>>> */}
                            </td>
                          </tr>
                        )}


                        {/* <div class='modal modal-container' id="searchModal" tabindex="-1" role="dialog"style={{top:"270px",left:"968px",width:"440px",position:"absolute"}}>
    <div class="modal-dialog modal-container" role="document">
        <div className="modal-content modal-container">
            <div id="head" style={{textAlign:"center" ,padding:"6px", display:"block",background:"linear-gradient(to bottom,#69c 40%,#316598) !important" }} className="modal-header">
              <h5   style={{textAlign:"center"}} className="modal-title">Refine Search</h5>
            
            </div>
            <div className="modal-body" style={{padding:"9px"}}>
             
            </div>
            
          </div>
  </div>
</div> */}
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

export default SealingRequestTable;
