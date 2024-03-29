import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TextField, Button, Grid, CircularProgress, capitalize } from "@mui/material";
import axios from "axios";
// import "../components/ManualSearch.css"
import "../components/AutoSearch.css"
import { padding, style } from "@mui/system";
// import CamelCaseTable from '../components/camelCaseTable.js';
import ReactPaginate from 'react-paginate';
import ProgressBar from '../components/progressBar/progressBar';
import * as XLSX from 'xlsx'; // Import all the named exports from 'xlsx';
// import { Tabs, Tab } from "react-bootstrap";
import Swal from 'sweetalert2';

const url = require("./config.json");

function ManualSearch() {
    const navigate = useNavigate();
    const [currentSearchResults, setCurrentSearchResults] = useState([]); // Current search results
    const { aufnr } = useParams();
    const [caseData, setCaseData] = useState({});
    const [aufnr_1, setAufnr_1] = useState({});
    const [counts, setCounts] = useState({});
    const [isDrop, setIsDrop] = useState(0);
    const [existingResult, setExistingResult] = useState([]);
    const [isCalculateDuesDisabled, setCalculateDuesDisabled] = useState(false);
    const [isDuesSearchComplete, setDuesSearchComplete] = useState(false);
    const [isDuesSearchComplete_1, setDuesSearchComplete_1] = useState(null);
    const [isDuesSearchComplete_2, setDuesSearchComplete_2] = useState(false);


    const itemsPerPage = 100;


    // let  =[];
    let [selectedRows_1, setselectedRows_1] = useState([]);

    const [loading, setLoading] = useState(true);
    let [addressPart1, setAddressPart1] = useState("");
    let [addressPart2, setAddressPart2] = useState("");
    let [addressPart3, setAddressPart3] = useState("");
    let [duesData_, setDuesData_] = useState(null);



    const [searchResults, setSearchResults] = useState([]); // New state for search results;
    const [searchResults1, setSearchResults1] = useState([]); // New state for search results;
    const [searchResults2, setSearchResults2] = useState([]); // New state for search results;
    const [is_first, set_is_first] = useState(false); // New state for search results

    const [searchResultsOther, setSearchResultsOther] = useState([]); // New state for search results

    // State for pagination
    const [currentPage, setCurrentPage] = useState(1);
    const resultsPerPage = 10;

    // State to control loading display
    const [showLoading, setShowLoading] = useState(false);

    const handlePageClick = (data, dbdata) => {
        console.log(data.selected, "kamal");
        return
        setCurrentPage(data.selected);
        handleInnerDataPagination(data.selected, dbdata)
    };

    let findLastLongestWord = (str) => {
        return new Promise((res, rej) => {
            // / Sample SAP_ADDRESS
            let sapAddress = str || '';
            // Remove numbers and special characters from the end of the string after a comma or after the last word
            sapAddress = sapAddress.replace(/,?\s*\d+\s*[!@#$%^&*()_+=-]*$/, '').replace(/,\s*$/, '');
            // Extract the last word without special characters
            const lastWordWithoutSpecialChars = sapAddress.match(/[^,]+(?=\s*$)/)[0];
            // Split the lastWordWithoutSpecialChars string into words
            const words = lastWordWithoutSpecialChars.split(/\s+/);
            // Find the longest word
            let longestWord = "";
            for (const word of words) {
                if (word.length > longestWord.length) {
                    longestWord = word;
                }
            }
            console.log(longestWord, "aaaaaaaaaa")
            res(longestWord);

        })
    }


    function checkBt() {
        let dues = sessionStorage.getItem("duesSearchComplete");
        let mcd = sessionStorage.getItem("mcdSearchComplete");
        if (dues) {
            setDuesSearchComplete_2(true);

        } else {
            setDuesSearchComplete_2(0);

        }
        if (dues && mcd) {
            setDuesSearchComplete_1(true)
        } else {
            setDuesSearchComplete_1(null)
        }
    }


    function setDues() {
        let existingResult = localStorage.getItem("saveExistRes");
        if (existingResult) {
            existingResult = JSON.parse(existingResult);
            existingResult = existingResult[`${aufnr_1.AUFNR}`];
            if (existingResult) {
                existingResult = existingResult.map(x => {
                    x.SEARCH_MODE = "AUTO-MODE";
                    return {
                        ...x
                    }
                })
                let dues_filter = existingResult.filter(x => x.solr_dues > 500)
                setSearchResults(dues_filter);
                let obj = getCounts(dues_filter);
                // setSearchResults(existingResult)
                setSearchResults1(existingResult)
                setSearchResultsOther(existingResult);
                // let obj = getCounts(existingResult);
                setCounts(obj)
                let exist = existingResult.map(x => x.CONTRACT_ACCOUNT);
                console.log(exist)
                setExistingResult(exist)
            }
        }

        let check = localStorage.getItem("sealingData");
        if (check) {
            check = JSON.parse(check);
            setselectedRows_1(check)
        }
        if (!aufnr) {
            console.error("AUFNR parameter is missing.");
            setLoading(false);
            return;
        }

    }

    // Load state from sessionStorage on component mount


    // Update sessionStorage whenever isDuesSearchComplete changes



    const handleInnerDataPagination = (page, data) => {
        const startIndex = page * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        console.log(searchResultsOther, "qqqqqqqqqqq")

        let items = page == 0 ? data.slice(startIndex, endIndex) : searchResultsOther.slice(startIndex, endIndex);
        console.log(items.length, "searchResultsOther")

        setSearchResults(items)
    };
    const [ipAddress, setIpAddress] = useState(null);


    const fetchIpAddress = async () => {
        try {

            let aufnr_11 = localStorage.getItem('manual');
            if (aufnr_11) {
                aufnr_11 = JSON.parse(aufnr_11);
            }

            let obj = {
                aufnr: aufnr_11.AUFNR,
                systemId: sessionStorage.getItem("systemId")
            }
            let data = await fetch(`https://icf1.bsesbrpl.co.in/api/icf_data_by_params`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(obj),
            });

            const apiResponse = await data.json();
            if (apiResponse) {
                const responseData = apiResponse.data;
                setDuesData_(responseData);
                const duesData = responseData.duesData || [];
                const mcd = responseData.mcdData || [];

                if (duesData.length) {
                    setDuesSearchComplete_2(true);

                } else {
                    setDuesSearchComplete_2(0);

                }
                if (duesData.length && responseData.tpye && responseData.tpye == 2) {
                    setDuesSearchComplete_1(true);
                } else {
                    setDuesSearchComplete_1(null);
                }
                const selectedDues = responseData.selectedDues || [];
                // Transformations or other logic can be applied here

                setSearchResults(selectedDues);
                setSearchResults1(selectedDues);
                setSearchResultsOther(selectedDues);

                let obj = getCounts(selectedDues);
                setCounts(obj);

                let exist = selectedDues.map(x => x.CONTRACT_ACCOUNT);
                setExistingResult(exist);

                setselectedRows_1(selectedDues);


                if (!duesData.length) {
                    setDues()
                }
            }

        } catch (error) {
            setDues()
            console.error('Error fetching IP address:', error);
        }
    };

    useEffect(() => {

        fetchIpAddress();
    }, []);





    // Function to handle forward and next pagination controls
    const getCounts = (data) => {
        if (!data) return {
            normal: [].length,
            total: 0,
            enforcement: 0,
            legal: 0,
            mcd: 0,
            move: 0
        }
        let bps = ["Normal", "ENFORCEMENT", "LEGAL", "Sealing"];
        return {
            normal: data.filter(x => x.BP_TYPE == 'Normal').length,
            total: data.length,
            enforcement: data.filter(x => x.BP_TYPE == 'ENFORCEMENT').length,
            legal: data.filter(x => x.BP_TYPE == 'LEGAL').length,
            mcd: data.filter(x => x.BP_TYPE == 'Sealing').length,
            move: data.filter(x => x.BP_TYPE == 'Normal' && !x.MOVE_OUT.includes('9999')).length,
            other: data.filter(x => !bps.includes(x.BP_TYPE)).length
        }
    };

    let aufnr_11 = localStorage.getItem('manual');
    if (aufnr_11) {
        aufnr_11 = JSON.parse(aufnr_11);
        // console.log(aufnr_11,"aufnr_11");
        if (aufnr_1.AUFNR != aufnr_11.AUFNR) {
            setAufnr_1(aufnr_11);
            setCaseData(aufnr_11);

        }

    }

    const [progressValue, setProgressValue] = useState(0);
    const [showProgressBar, setShowProgressBar] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);

    function setSearchLogs(payload) {
        const requestPromise = fetch(`${url.api_url}/api/create_log`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        })
            .then((response) => response.json())
            .then(async (data) => {

            })
    }

    const handleButtonClick = (val) => {
        setProgressValue(0)
        setShowProgressBar(true);
        const interval = setInterval(() => {
            if (!val) {
                setProgressValue(100)
                clearInterval(interval);
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

                if (prevValue < 100) {
                    return prevValue + 1;
                }
                setShowProgressBar(false)

                clearInterval(interval);
                return prevValue;
            });
        }, 100);
    };
    // useEffect(() => {
    //   let existingResult = localStorage.getItem("saveExistRes");
    //   if (existingResult) {
    //     existingResult = JSON.parse(existingResult);
    //     existingResult = existingResult[`${aufnr_1.AUFNR}`];
    //     if(existingResult){
    //       existingResult=existingResult.map(x=>{
    //         x.SEARCH_MODE ="AUTO-MODE";
    //         return{
    //           ...x
    //         }
    //       })
    //       setSearchResults(existingResult)
    //       setSearchResults1(existingResult)
    //       setSearchResultsOther(existingResult);
    //       let obj = getCounts(existingResult);
    //       setCounts(obj)
    //       let exist = existingResult.map(x => x.CONTRACT_ACCOUNT);
    //       console.log(exist)
    //       setExistingResult(exist)
    //     }
    //   }

    //   let check = localStorage.getItem("sealingData");
    //   if(check){
    //     check = JSON.parse(check);
    //     setselectedRows_1(check)
    //   }
    //   if (!aufnr) {
    //     console.error("AUFNR parameter is missing.");
    //     setLoading(false);
    //     return;
    //   }

    // }, [aufnr]);
    function capitalizeWord(word) {
        if (typeof word !== 'string' || word.length === 0) {
            return word;
        }

        return word.toUpperCase();
    }



    // Define the result threshold
    const result_threshold = 100;

    // Define a function to split words separated by special characters

    let exclude_terms = ["khasra", "kh", "tagore", "first", "second", "third", "fourth", "top", "basement",
        "floor", "first floor", "ground floor", "second floor", "third floor", "front", "back", "side",
        "ff", "sf", "tf", "gf", "g/f", "f/f", "s/f", "t/f", "no", "number", "fourth floor", "gali", "juggi", "khanpur", "janak",
        "uttam", "alaknanda", "nehru"
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







    const addCommaAfterSpace = (inputString) => {
        // Split the input string into an array of words
        const wordsArray = inputString.split(' ');

        // Join the words in the array with a comma and a space
        const resultString = wordsArray.join(', ');

        return resultString;
    }


    function containsNumber(str) {
        return /\d/.test(str);
    }


    const handleCalculateDues = async (index, user) => {
        let count = await getCounts(selectedRows_1);
        console.log(counts);




        if (selectedRows_1) {
            Swal.fire({
                title: 'Are you sure?',
                text: '',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, complete it!',
                html: `<style>
          .enforcement-label { color: blue; }
          .normal-label { color: green; }
          .other-label { color: orange; }
          .move-out-label { color: purple; }
          .legal-label { color: red; }
        </style>
        
        <div>
        <h5>Do you want to complete the dues search?</h5>
        <p><span id="enforcementLabel" class="enforcement-label">Enforcement selected</span> - <span id="enforcementCount" class="enforcement">${count.enforcement}</span></p>
        <p><span id="normalLabel" class="normal-label">Normal selected</span> - <span id="normalCount" class="normal">${count.normal}</span></p>
        <p><span id="otherLabel" class="other-label">Other selected</span> - <span id="otherCount" class="other">${count.other}</span></p>
        <p><span id="moveOutLabel" class="move-out-label">Move out selected</span> - <span id="moveOutCount" class="move-out">${count.move}</span></p>
        <p><span id="legalLabel" class="legal-label">Legal selected</span> - <span id="legalCount" class="legal">${count.legal}</span></p>
      </div>`

            }).then(async (result) => {
                if (result.isConfirmed) {
                    let systemId = sessionStorage.getItem("systemId");
                    let obj = {
                        systemId,
                        // type: 0,
                        aufnr: aufnr_1.AUFNR,
                        duesData: searchResults,
                        selectedDues: selectedRows_1
                    }
                    console.log(obj);
                    await fetch(`https://icf1.bsesbrpl.co.in/api/icf_data_status`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(obj),
                    });
                    console.log(duesData_);

                    if (duesData_ && duesData_.tpye == 2) {
                        let caNumbers = selectedRows_1.map(x => x.CONTRACT_ACCOUNT)
                        let response = await fetch(`${url.API_url}/api/calculate_dues`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ caNumbers }),
                        })
                        let dues = await response.json();
                        console.log(dues, "duesduesduesdues")
                        // alert("S")
                        selectedRows_1.forEach(x => {
                            let duess = dues.duesData.filter(y => y.CA_NUMBER == x.CONTRACT_ACCOUNT);
                            if (duess && duess.length) {
                                x.DUES = duess[0].AMOUNT
                            }
                        });

                        let arr = [...selectedRows_1, ...duesData_.selectedMcd]
                        await fetch(`${url.API_url}/api/sendToDsk`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ data: arr, addr: aufnr_1 }),
                        })
                        exportToExcel(arr, aufnr_1);
                    } else {
                        let caNumbers = selectedRows_1.map(x => x.CONTRACT_ACCOUNT)
                        let response = await fetch(`${url.API_url}/api/calculate_dues`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ caNumbers }),
                        })
                        let dues = await response.json();
                        console.log(dues, "duesduesduesdues")
                        // alert("S")
                        selectedRows_1.forEach(x => {
                            let duess = dues.duesData.filter(y => y.CA_NUMBER == x.CONTRACT_ACCOUNT);
                            if (duess && duess.length) {
                                x.DUES = duess[0].AMOUNT
                            }
                        });

                    }
                    console.log(selectedRows_1, "selectedRows_1selectedRows_1")
                    setselectedRows_1(selectedRows_1);
                    setSearchResults(selectedRows_1);



                    sessionStorage.setItem("duesSearchComplete", "true");

                    checkBt();
                    // User confirmed, proceed with saving data
                    // localStorage.setItem("sealingData", JSON.stringify(selectedRows_1));
                    localStorage.setItem("selectedMatchedRows1", JSON.stringify([aufnr_1]));

                    // Show success message
                    Swal.fire({
                        title: 'Success!',
                        text: 'Dues search completed successfully.',
                        icon: 'success',
                        confirmButtonColor: '#3085d6',
                    });
                }
            });
        }
    };


    // Define the columns you want to export
    const columnsToExport = ["SEARCH_MODE", "CF_CATEGORY", "ACCOUNT_CLASS", "SOLR_DUES", "SAP_DUES", "MOVE_OUT", "CONTRACT_ACCOUNT", "CSTS_CD", "SAP_NAME", "SAP_ADDRESS", "SAP_POLE_ID", "TARIFF"];

    const [duesFilter, setDuesFilter] = useState("greater500"); // State to keep track of selected dues filter

    // Function to handle the change in the dues filter radio buttons

    const handleDuesFilterChange = (event) => {
        const selectedFilter = event.target.value;
        setDuesFilter(selectedFilter);
        // Filter the data based on the selected radio button
        const filteredData = searchResultsOther.filter((result) => {
            if (selectedFilter === "all") {
                return true; // Return all results if "All" is selected
            } else if (selectedFilter === "zero") {
                return result.solr_dues <= 500; // Filter results where DUES is 0
            } else if (selectedFilter === "greater500") {
                return result.solr_dues && result.solr_dues > 500; // Filter results where DUES is greater than 500
            }
        });
        let data = getCounts(filteredData);
        setCounts(data)
        setSearchResults(filteredData);
    };

    const exportToExcel = (data, user) => {
        if (!data.length) {
            alert("No data exist");
            return
        }

        // data = data.filter(x=>x.DUES);
        for (let index = 0; index < data.length; index++) {
            let element = data[index];
            element['CF_CATEGORY'] = element['BP_TYPE'];
            element['ACCOUNT_CLASS'] = element['SAP_DEPARTMENT'];
            element['SOLR_DUES'] = element['solr_dues'];
            element['SAP_DUES'] = element['DUES'];

        }
        // Create a new array containing only the selected columns
        const filteredData = data.map((item) => {
            const filteredItem = {};
            columnsToExport.forEach((column) => {
                filteredItem[column] = item[column];
                if (!filteredItem['SEARCH_MODE']) {
                    filteredItem['SEARCH_MODE'] = "Manual-Mode"
                }
            });
            return filteredItem;
        });

        const ws = XLSX.utils.json_to_sheet(filteredData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        XLSX.writeFile(wb, `${user.AUFNR}.xlsx`);
    };


    const searchMatchingResultAlgoAgain = async (address, data, val) => {
        //  console.log(data,"data");
        //  return 
        return new Promise(async (res, rej) => {
            try {
                console.log("yyyyyyyyyyyyyyyyyy", address)
                const inputAddress = address;

                // Function to check if a word contains numbers
                function containsNumbers(word) {
                    return /\d/.test(word);
                }
                // Split the input address by space
                const wordsArray = inputAddress.split(' ');
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

                // let splitAndCleanedWords = mergedWords.map(word => word.replace(/\W/g, '').split(' ')).flat();
                let splitAndCleanedWords = mergedWords.flatMap(word => word.split(/\W+/).filter(Boolean));
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
    const refineSearch = async (address, data, str) => {
        return new Promise(async (res, rej) => {
            try {
                if (str) {
                    str = removeSpecialCharsAndCapitalize(str);
                }
                console.log(cleanAndUppercaseString(str), "cleanAndUppercaseString(str)", data);
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
                            alphabetPart = ['#']
                        }
                        if (!numericPart) {
                            numericPart = ['0']
                        }
                        if (numericPart1 && alphabetPart1) {
                            let rd = alphabetPart[0].includes(alphabetPart1[0]) && numericPart[0] === numericPart1[0];
                            if (rd) {
                                return true
                            }
                        }
                        if (alphabetPart1 && !numericPart1) {
                            if (alphabetPart1[0] && alphabetPart1[0].length <= 2) {
                                if ((alphabetPart[0] && alphabetPart[0].length == 1) || alphabetPart[0].includes("BL") || alphabetPart[0].includes("BLO") || alphabetPart[0].includes("PLO")) {
                                    let rd = alphabetPart[0].includes(alphabetPart1[0]);
                                    if (rd) {
                                        return true
                                    }
                                } else {
                                    return false
                                }
                            } else {
                                console.log("aaassaaaaaaaaaas1aaaaaaaaaa", alphabetPart[0], alphabetPart1[0])
                                let rd = alphabetPart[0].includes(alphabetPart1[0]);
                                if (rd) {
                                    console.log("aaassaaaaaaaaaaaaaaaaaaaa");
                                    return true
                                }
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
                    return false;
                }

                for (const doc of data) {
                    let finalStr = await searchMatchingResultAlgoAgain(doc.SAP_ADDRESS, [], 1);

                    if (matchesCriteria(finalStr, str.toUpperCase())) {
                        currentWordFilteredResults.push(doc);

                    }
                }


                console.log(currentWordFilteredResults, "kaml sharma")

                // const uniqueArray = currentWordFilteredResults.filter((item, index, self) => {
                //   return (
                //     index ===
                //     self.findIndex((t) => t.CONS_REF == item.CONS_REF)
                //   );
                // });
                // let otherBptype = searchResultsOther.filter(x=>x.BP_TYPE!='Normal');
                // currentWordFilteredResults.push(...otherBptype)
                res(currentWordFilteredResults);

            } catch (error) {
                console.log(error);
                res([]);
                // Handle errors
            }
        });
    };

    function mergeWordsAndRemoveSpaces(inputString) {
        // Split the input string by spaces
        const words = inputString.split(' ');

        // Remove spaces and merge all words together
        const mergedString = words.join('');

        return mergedString;
    }

    function cleanAndUppercaseString(inputString) {
        // Remove special characters and spaces
        const cleanedString = inputString.replace(/[^\w\s]/g, '');

        // Convert the cleaned string to uppercase
        let uppercasedString = cleanedString.toUpperCase();
        uppercasedString = mergeWordsAndRemoveSpaces(uppercasedString)
        return uppercasedString;
    }




    const [searchQuery, setSearchQuery] = useState("");
    const [searchError, setSearchError] = useState("");

    // Function to open the modal
    const openModal = async () => {
        let systemId = sessionStorage.getItem("systemId");
        let obj = {
            systemId,
            type: "dues",
            aufnr: aufnr_1.AUFNR,
            duesData: [],
            selectedDues: []
        }
        console.log(obj);
        await fetch(`https://icf1.bsesbrpl.co.in/api/icf_data_status`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(obj),
        })
        fetchIpAddress()
        // sessionStorage.setItem("duesSearchComplete", "true");

        sessionStorage.removeItem("duesSearchComplete");
        checkBt();
        setselectedRows_1([]);
        setSearchResults(searchResultsOther)
        localStorage.setItem("sealingData", JSON.stringify([]))
    };

    // Function to close the modal
    const closeModal = () => {
        var modal = document.getElementById("searchModal");
        modal.classList.remove("show");
        modal.style.display = "none";
        document.body.classList.remove("modal-open");
        document.body.classList.remove("blur-background"); // Remove the blur effect
    };
    // Assuming you have a function to handle the key press event
    const handleKeyPress = (event, user) => {
        if (event.key === 'Enter') {
            handleSearchClick(user)
        }
    };

    // Function to handle the search input change
    const handleSearchInputChange = async (e) => {
        const query = e.target.value;
        await setSearchQuery(query);
        console.log(searchQuery, "searchQuery");
        if (searchQuery.trim() == "") {
            console.log("adsx")
            setSearchError("Search query cannot be empty");
        } else {
            // Clear any previous error message
            setSearchError("");
        }
    };
    const originalList = () => {
        setSearchResults(searchResultsOther);
        setSearchResults1(searchResultsOther);
        handlePageClick({ selected: 0, searchResultsOther });

        let obj = getCounts(searchResultsOther);
        setCounts(obj)

    }
    const goBack = () => {
        navigate('/auto')

    }
    function removeSpecialCharsAndCapitalize(inputString) {
        // Remove special characters and spaces, but keep numeric characters
        const cleanedString = inputString.replace(/[^a-zA-Z0-9]/g, '');

        // Capitalize the cleaned string
        const capitalizedString = cleanedString.toUpperCase();

        return capitalizedString;
    }


    // Function to handle the "Search" button click in the modal
    const handleSearchClick = async () => {
        if (!is_first) {
            set_is_first(true);
        }
        console.log("adsx", searchResults.length);
        // searchResults = searchResults.filter(x=>x.BP_TYPE=='Normal')
        let result = await refineSearch("", searchResults, searchQuery);
        setSearchQuery("");
        let obj = getCounts(result);
        setCounts(obj)
        closeModal();

        setSearchResults(result);
        setSearchResults1(result);

        //  setCurrentSearchResults(result);
        handlePageClick({ selected: 0 }, result)

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

    const handleCalculateDues1 = (index, user) => {
        Swal.fire({
            title: 'Are you sure?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, complete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                let checked = localStorage.getItem("sealing_set#");
                let arr = []
                if (checked) {
                    checked = JSON.parse(checked);
                    arr.push(...checked)
                }
                let check = localStorage.getItem("sealingData");
                if (check) {
                    check = JSON.parse(check);
                    arr.push(...check);
                };
                fetch(`${url.API_url}/api/sendToDsk`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ data: arr, addr: aufnr_1 }),
                })
                    .then((response) => response.json())
                    .then((data) => {
                        exportToExcel(arr, aufnr_1);

                        navigate('/auto')

                    })
                // Show success message
                Swal.fire({
                    title: 'Success!',
                    icon: 'success',
                    confirmButtonColor: '#3085d6',
                });
            }
        });


        // fetch(`${url.API_url}/api/calculate_dues`, {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        //   body: JSON.stringify({ caNumbers }),
        // })
        // .then((response) => response.json())
        // .then((data) => {
        //   // localStorage.removeItem('selectedRows_1');
        //   // Update the DUES values in the global state
        //   console.log(data.duesData, " data.duesData data.duesData data.duesData")
        //   // dispatch({ type: "UPDATE_DUES", payload: data.duesData });
        //   if (data.duesData) {
        //     data.duesData = [data.duesData]
        //   }
        //   // Update the DUES values in the searchResultsData state
        //   arr.forEach(x => {
        //     let dues = data.duesData.filter(y => y.CA_NUMBER == x.CONTRACT_ACCOUNT);
        //     if (dues && dues.length) {
        //       x.DUES = dues[0].AMOUNT
        //     }
        //     x.disabled = true
        //   });

        //   setSearchResults(arr)
        //   setSearchResults1(arr)
        //   setSearchResultsOther(arr);
        //   let obj = getCounts(arr);
        //   setCounts(obj);
        //   fetch(`${url.API_url}/api/sendToDsk`, {
        //     method: "POST",
        //     headers: {
        //       "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify({ data: arr, addr: aufnr_1 }),
        //   })
        //     .then((response) => response.json())
        //     .then((data) => {
        //       navigate('/auto')

        //     })
        // })
        // .catch((error) => {
        //   setCalculateDuesDisabled(false);

        //   console.error("Error calculating dues:", error);
        // });

    };


    // Function to handle manual search button click
    const handleManualSearchClick = () => {
        if (!addressPart1 && !addressPart2 && !addressPart3) {
            return
        }
        const startTime = new Date();
        if (addressPart1)
            addressPart1 = removeSpecialCharsAndCapitalize(addressPart1);
        if (addressPart2)
            addressPart2 = removeSpecialCharsAndCapitalize(addressPart2);
        if (addressPart3)
            addressPart3 = removeSpecialCharsAndCapitalize(addressPart3);
        handleButtonClick(1)
        // Combine the address parts into a single address
        let str_arr = ["1ST", "I", "2ND", "II", "3RD", "III"];
        let str_arr1 = ["BLOCK", "BLK", "PLOT", "PLT"];
        addressPart1 = addressPart1.replace(/[^\w\s]/g, '');
        addressPart2 = addressPart2.replace(/[^\w\s]/g, '');
        addressPart3 = addressPart3 ? addressPart3.trim("") : "";

        let complete_addr = capitalizeWord(addressPart1) + '' + capitalizeWord(addressPart2);
        let words_arr = [complete_addr]
        for (let index = 0; index < str_arr.length; index++) {
            const element = str_arr[index];
            let words = capitalizeWord(addressPart1) + element + capitalizeWord(addressPart2);
            words_arr.push(words);
        }
        for (let index = 0; index < str_arr1.length; index++) {
            const element = str_arr1[index];
            let words = capitalizeWord(addressPart1) + element;
            let words1 = element + capitalizeWord(addressPart1);
            if (element.includes("NO")) {
                // let words1 = element+capitalizeWord(addressPart2);
                // let words = capitalizeWord(addressPart2)+element;
                // words_arr.push(words);
                // words_arr.push(words1);
            }
            words_arr.push(words);
            words_arr.push(words1);

        }
        addressPart3 = addressPart3.replace(/[^\w\s-]/g, '');
        let drop = localStorage.getItem("dropDataList")
        if (drop && drop == 1) {
            setIsDrop(1)
        } else {
            setIsDrop(0)

        }
        setExistingResult([])
        fetch(`${url.API_url}/api/manual_search`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                addressPart1: words_arr,
                addressPart2: [capitalizeWord(addressPart2)],
                addressPart3: capitalizeWord(addressPart3),
                VAPLZ: caseData.VAPLZ, // Assuming VAPLZ comes from case data
            }),
        })
            .then((response) => response.json())
            .then(async (data) => {
                console.log(data, "datadata");
                let finalres = [];
                data.data = data.results_count;
                let all_count = data.data.length;
                if (data.data) {
                    let existingResult1 = localStorage.getItem("saveExistRes");
                    if (existingResult1) {
                        existingResult1 = JSON.parse(existingResult1);
                        existingResult1 = existingResult1[`${aufnr_1.AUFNR}`];
                        // alert(aufnr_1.AUFNR);
                        let exist = [];
                        if (existingResult1) {
                            finalres = existingResult1;
                            let exist = existingResult1.map(x => x.CONTRACT_ACCOUNT);
                            // alert("k")
                            console.log(exist)
                            setExistingResult(exist)
                        }
                    }

                };
                setSearchResults([]);
                setSearchResults1([]);
                setSearchResultsOther([])
                // if(drop && drop==1){
                console.log(searchResults.length, "lll", data.data)
                data.data = data.data.filter(x => !existingResult.includes(x.CONTRACT_ACCOUNT))
                // }
                // console.log(data.data.length, "wwwwwwwwww", existingResult.length)
                // let res = await searchMatchingResultAlgo("",resultsData,str);
                finalres.map(x => {
                    x.SEARCH_MODE = "AUTO-MODE"
                })
                // data.data.map()
                console.log(finalres, "finalres")
                data.data.push(...finalres);
                let dues_filter = data.data.filter(x => x.solr_dues > 500)
                setSearchResults(dues_filter);
                let obj = getCounts(dues_filter);
                await setSearchResults1(data.data)
                await setSearchResultsOther(data.data);
                setCounts(obj);
                handleButtonClick(0);
                handlePageClick({ selected: 0 }, data.data);

                const endTime = new Date();
                // Calculate the time elapsed in minutes
                const timeElapsedInMilliseconds = endTime - startTime;
                const minutes = Math.floor(timeElapsedInMilliseconds / 60000);
                const seconds = Math.floor((timeElapsedInMilliseconds % 60000) / 1000);
                const milliseconds = (timeElapsedInMilliseconds % 1000).toString().padStart(3, '0').slice(0, 2); // Truncate to two digits

                const formattedTime = `${minutes.toString().padStart(2, '0')} minutes, ${seconds.toString().padStart(2, '0')} seconds, ${milliseconds} milliseconds`;


                let objs = {
                    "obj": {
                        "LogTextMain": words_arr.join(',') + ',' + [addressPart2].join(","),
                        "logTextAndSrc": [addressPart3].join(','),
                        "MethodName": "MANUAL-MODE",
                        "SolrSearchTime": formattedTime,
                        result_count: '' + all_count,
                        IP_address: ipAddress,
                        "REQUEST": caseData.REQUEST_NO
                    }
                }
                setSearchLogs(objs)
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
        console.log(e.target.checked, "e.target.checked");
        if (e.target.checked) {
            console.log("1");
            // Add the selected row to the state
            setselectedRows_1((prevSelectedRows) => [...prevSelectedRows, row]);
        } else {
            console.log("2");
            // Remove the unselected row from the state
            setselectedRows_1((prevSelectedRows) => prevSelectedRows.filter((selectedRow) => selectedRow.id != row.id));
        }
        console.log(selectedRows_1, ";;l;l;l;")
    };



    const handleRowClick_1 = (e) => {
        if (e.target.checked) {
            selectedRows_1 = searchResults;
            // Check all checkboxes
            const checkboxes = document.getElementsByClassName("check_box");
            const checkboxArray = Array.from(checkboxes); // Convert HTMLCollection to array
            checkboxArray.forEach((checkbox) => (checkbox.checked = true));
            setselectedRows_1(selectedRows_1)
        } else {
            selectedRows_1 = [];
            // Uncheck all checkboxes
            const checkboxes = document.getElementsByClassName("check_box");
            const checkboxArray = Array.from(checkboxes); // Convert HTMLCollection to array
            checkboxArray.forEach((checkbox) => (checkbox.checked = false));
            setselectedRows_1([])

        }
    };

    const handleAutoBreakClickAgain = () => {
        if (!selectedRows_1.length) {
            alert("pls select atleast one row");
            return
        }
        const exampleEntry = {
            "ACCOUNT_CLASS": "-",
            "ACTIVE": "-",
            "BP_TYPE": "-",
            "BUSINESS_PARTNER": "-",
            "COMBINED_ADDRESS": "-",
            "COMPANY_CODE": "-",
            "CONTRACT_ACCOUNT": "-",
            "DIVISION": "-",
            "FIRST_NAME": "-",
            "ID": "-",
            "LAST_NAME": "-",
            "REC_ENTRY_DATE": "-",
            "SAP_ADDRESS": "-",
            "SAP_DEPARTMENT": "-",
            "SAP_DIVISION": "-",
            "SAP_NAME": "-",
            "id": "-",
            "DEVICE_NO": "-",
            "BILL_DISPATCH_CONTROL": "-",
            "TARIFF": "-",
            "MOBILE_NO": "-",
            "CSTS_CD": "-",
            "MOVE_OUT": "",
            "FATHER_NAME": "-",
            "SAP_POLE_ID": "-"
        };

        console.log(selectedRows_1, "selectedRows_1", aufnr_1)
        // return 
        // setShowLoading(true);
        let request_data = aufnr_1 ? aufnr_1 : {};
        let search_results = selectedRows_1 || [];

        search_results.forEach(obj => {
            for (const key in exampleEntry) {
                if (!obj.hasOwnProperty(key)) {
                    obj[key] = exampleEntry[key];
                }
                if (key == 'REC_ENTRY_DATE') {
                    obj[key] = '';
                }
            }
        });
        fetch(`${url.API_url_DEV1}/append_manual_cases`, {
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
                    navigate('/output')

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


    const handleFilterByBPType = (bpType) => {
        if (!bpType) {
            setSearchResults(searchResults1);
            let obj = getCounts(searchResultsOther);
            setCounts(obj)
            console.log("final ...")
            return
        }
        // Filter the data based on the selected BP_TYPE
        let filteredData = [];
        if (bpType == "other") {
            let bps = ["Normal", "ENFORCEMENT", "LEGAL", "Sealing"];
            filteredData = searchResults1.filter((item) => !bps.includes(item.BP_TYPE))
        } else {
            filteredData = searchResults1.filter((item) => item.BP_TYPE == bpType)
        }

        if (bpType == "move") {
            console.log(searchResults1)
            filteredData = searchResults1.filter((item) => item.BP_TYPE == 'Normal' && !item.MOVE_OUT.includes('9999'))
        }

        console.log(filteredData, bpType, "llll", searchResults1)
        setSearchResults(filteredData);
        let obj = getCounts(searchResultsOther);
        setCounts(obj)
    };
    const [selectedTab, setSelectedTab] = useState('dues'); // Default tab is 'dues'

    const handleTabChange = (tab) => {
        setSelectedTab(tab);
    };
    return (
        <>
            <div className="container-fluid">
                {/* <h3 style={{textAlign:"center"}} className="mt-2">Manual Search</h3> */}

                {false ? (
                    // Show loading component while data is being fetched
                    <div className="loading-container">
                        <CircularProgress size={100} />
                    </div>
                ) : (
                    <table className="table3 mt-3 table-borderd shadow-lg" style={{ width: "100%", overflow: "scroll" }}>
                        <tbody>
                            <tr>
                                <th style={{ width: "13%" }}>ORDER NO</th>
                                <th style={{ width: "8%" }}>COMPANY</th>
                                <th style={{ width: "8%" }}>DIVISION</th>
                                <th style={{ width: "15%" }}>NAME</th>
                                <th>REQUEST ADDRESS</th>
                                <th style={{ width: "10%" }}>REQUEST TYPE</th>
                                {/* <th style={{ width: "10%" }}>ACTION</th> */}

                            </tr>
                            <tr>
                                <td>{aufnr_1.AUFNR}</td>
                                <td>{aufnr_1.BUKRS}</td>
                                <td>{aufnr_1.VAPLZ}</td>
                                <td>{aufnr_1.NAME}</td>
                                <td>{aufnr_1.SAP_ADDRESS}</td>
                                <td>{aufnr_1.ILART}</td>
                                {/* <td> */}

                                {/* <label>Search Query</label> */}



                                {/* </td> */}
                                {/* <td>{aufnr_1.E_MAIL}</td> */}
                            </tr>
                        </tbody>
                    </table>
                )}

                {true && (
                    <div class="tables-page-section">

                        <div class="container-fluid">
                            <div class="row">

                                <div className="col-12 text-center heading-link">
                                    <div className="row mb-2">
                                        <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 mb-2">
                                            <div className="form-check form-check-inline">
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="duesFilter"
                                                    id="all"
                                                    value="all"
                                                    checked={duesFilter === "all"}
                                                    onChange={handleDuesFilterChange}
                                                />
                                                <span style={{ fontStyle: "bold", fontWeight: 600, fontSize: `18px` }} className="form-check-label" htmlFor="all">All</span>
                                            </div>
                                            {/* <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              name="duesFilter"
              id="zero"
              value="zero"
              checked={duesFilter === "zero"}
              onChange={handleDuesFilterChange}
            />
            <span style={{fontStyle:"bold",fontWeight:600,fontSize:`18px`}}  className="form-check-label" htmlFor="zero">{"Dues < 500"}</span>
          </div> */}
                                            <div className="form-check form-check-inline">
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="duesFilter"
                                                    id="greater500"
                                                    value="greater500"
                                                    checked={duesFilter === "greater500"}
                                                    onChange={handleDuesFilterChange}
                                                />
                                                <span style={{ fontStyle: "bold", fontWeight: 600, fontSize: `18px` }} className="form-check-label" htmlFor="greater500">{"Dues > 500"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <h5 style={{ color: 'darkslategray', cursor: 'pointer' }}>
                                        {/* <div class="container"> */}
                                        {/* <div class="pane mb-1 mt-1">
        <label class="label">
            <span>All</span>
            <input id="left" class="input" name="radio" type="radio"/>
        </label>
        <label class="label">
            <span>DUES</span>
            <input id="middle" class="input" checked="checked" name="radio" type="radio"/>
        </label>
        <label class="label">
            <span>{"> 500"}</span>
            <input id="right" class="input" name="radio" type="radio"/>
        </label>
        <span class="selection"></span>
    </div> */}
                                        {/* </div> */}
                                        <span className="span5" style={{ color: 'black', fontWeight: "700" }}>
                                            <span style={{ float: "left", cursor: 'pointer', color: 'black', fontWeight: "700", textDecoration: "underline" }} className="span1">
                                                <span onClick={() => handleFilterByBPType('Sealing')} >Selected Result: </span> {selectedRows_1.length}
                                            </span>
                                            <span onClick={() => handleFilterByBPType(null)} >Total:</span>
                                            {false ? <span style={{ marginLeft: '8px' }}>0</span> : <span style={{ marginLeft: '8px' }}>{counts.total || 0}</span>},

                                        </span>

                                        <span style={{ marginLeft: '16px', cursor: 'pointer', color: 'black', fontWeight: "700" }} className="span4">
                                            <span onClick={() => handleFilterByBPType('Normal')}>Regular:</span> {(counts.normal || 0)}
                                        </span>
                                        <span style={{ marginLeft: '16px', cursor: 'pointer', color: 'black', fontWeight: "700" }} className="span3">
                                            <span onClick={() => handleFilterByBPType('ENFORCEMENT')} >Enforcement:</span> {(counts.enforcement || 0)}
                                        </span>
                                        <span style={{ marginLeft: '16px', cursor: 'pointer', color: 'black', fontWeight: "700" }} className="span2">
                                            <span onClick={() => handleFilterByBPType('LEGAL')}>Legal:</span> {(counts.legal || 0)}
                                        </span>
                                        {/* <span style={{ marginLeft: '16px', cursor: 'pointer', color: 'black', fontWeight:"700" }} className="span1">
                    <span onClick={() => handleFilterByBPType('Sealing')} >MCD:</span> {(counts.mcd || 0)}
                  </span> */}
                                        <span style={{ marginLeft: '16px', cursor: 'pointer', color: 'black', fontWeight: "700" }} className="span1">
                                            <span onClick={() => handleFilterByBPType('other')} >Other:</span> {(counts.other || 0)}
                                        </span>
                                        <span style={{ marginLeft: '16px', cursor: 'pointer', color: 'black', fontWeight: "700" }} className="span1">
                                            <span onClick={() => handleFilterByBPType('move')} >Move Out Cases:</span> {(counts.move || 0)}
                                        </span>

                                        <span style={{ marginRight: "60px", color: "green", float: "right" }}>  {!isDuesSearchComplete_1 ? "" : "Sent To DSK"}

                                            {isDuesSearchComplete_1 && (<i className="fa fa-check" style={{ color: 'green', fontSize: '20px' }} />)}



                                        </span>

                                    </h5>

                                </div>
                                <div class="row">
                                    <div class="col-lg-12">
                                        <div className="table-responsive table-bordered table-striped table-hover shadow-lg" style={{ maxHeight: "400px", overflow: "auto", marginBottom: "10px" }}>
                                            <table className="table table2 table-bordered table-striped table-hover" >
                                                <thead className="fixed-header">


                                                    <tr>
                                                        <th style={{ whiteSpace: 'nowrap', width: '5%' }}>
                                                            <input onChange={(e) => handleRowClick_1(e)} type="checkbox" name="" />
                                                        </th>
                                                        <th style={{ width: '5%' }}>MODE</th>
                                                        <th style={{ whiteSpace: 'nowrap', width: '3%' }}>SOLR DUES</th>
                                                        <th style={{ whiteSpace: 'nowrap', width: '3%' }}>SAP DUES</th>

                                                        <th style={{ width: '10%' }}>MOVE OUT DATE</th>
                                                        <th style={{ width: '10%' }}>ACCOUNT CLASS</th>
                                                        <th style={{ width: '4%' }}>BP TYPE</th>
                                                        <th style={{ width: '5%' }}>CA NUMBER</th>
                                                        <th style={{ width: '5%' }}>CSTS CD</th>
                                                        <th style={{ whiteSpace: 'nowrap', maxWidth: '15%', width: '15%' }}>CONSUMER NAME</th>
                                                        <th style={{ width: '40%', textAlign: 'left' }} className="text-left">
                                                            CONSUMER ADDRESS
                                                        </th>
                                                        <th style={{ width: '10%' }}>POLE ID</th>
                                                        <th style={{ width: '10%' }}>TARIFF CATEGORY</th>
                                                    </tr>
                                                </thead>
                                                {searchResults.map((result, index) => {
                                                    const isResultInExisting = existingResult.some(
                                                        (existingRow) => existingRow == result.CONS_REF
                                                    );

                                                    function formatDateToDDMMYYYY(dateString) {
                                                        const date = new Date(dateString);
                                                        const day = date.getDate().toString().padStart(2, '0');
                                                        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based
                                                        const year = date.getFullYear();
                                                        return `${day}-${month}-${year}`;
                                                    }

                                                    return (
                                                        <tr key={index} style={{ backgroundColor: isResultInExisting ? '#transparent' : "" }}>
                                                            <td>
                                                                <input
                                                                    className="check_box"
                                                                    type="checkbox"
                                                                    onChange={(e) => handleRowClick(result, e)}
                                                                    checked={selectedRows_1.some((selectedRow) => selectedRow.id === result.id)}
                                                                />
                                                            </td>
                                                            <td>{result.SEARCH_MODE || 'MANUAL-MODE'}</td>
                                                            <td>{result.solr_dues || '-'}</td>
                                                            <td>{result.DUES || '-'}</td>
                                                            <td style={{ width: '17%' }} >{result.MOVE_OUT ? formatDateToDDMMYYYY(result.MOVE_OUT) : "-"}</td>
                                                            <td>{result.SAP_DEPARTMENT}</td>
                                                            <td>{result.BP_TYPE}</td>
                                                            <td>{result.CONTRACT_ACCOUNT}</td>
                                                            <td>{result.CSTS_CD}</td>


                                                            <td style={{ textAlign: "left" }}>{result.SAP_NAME}</td>
                                                            <td style={{ whiteSpace: 'pre-line', wordWrap: 'break-word', maxWidth: '2000px', textAlign: 'left' }} className="text-left">
                                                                {result.SAP_ADDRESS}
                                                            </td>                            <td>{result.SAP_POLE_ID}</td>
                                                            <td>{result.TARIFF}</td>
                                                        </tr>
                                                    );
                                                })}

                                            </table>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {showLoading && (
                    // CSS overlay for the loading component
                    <div className="overlay" >
                        <div className="loading-container">
                            <CircularProgress size={100} />
                            <h2>Manual Search in progress</h2>
                        </div>
                    </div>
                )}

                <div style={{ padding: " 1px 16px 16px 16px", position: "sticky", top: "0px" }}>
                    {showProgressBar && <ProgressBar value={progressValue} max={100} />}



                    {!isDuesSearchComplete_1 && (<div className="container-fluid mb-2">
                        <div className="row justify-content-center">
                            {/* <div className="col-2">
              <h4 className="mt-2" style={{ color:"#007bff"}}>Manual Search</h4>
            </div> */}
                            <div className="col-1"></div>
                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-12 mb-1">
                                <input type="textarea"
                                    name="textValue"
                                    className="form-control"
                                    placeholder="House/Plot/Block/Khasra"
                                    value={addressPart1}
                                    onChange={(e) => setAddressPart1(e.target.value)}
                                    style={{ border: "1px solid #9a9da1" }}
                                />
                            </div>

                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-12 mb-1">
                                <input type="textarea"
                                    name="textValue"
                                    className="form-control"
                                    placeholder="Number(House/Plot/Block/Khasra)"
                                    value={addressPart2}
                                    onChange={(e) => setAddressPart2(e.target.value)}
                                    style={{ border: "1px solid #9a9da1" }}
                                />
                            </div>

                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-12 mb-1">
                                <input type="textarea"
                                    name="textValue"
                                    className="form-control"
                                    placeholder="Area"
                                    value={addressPart3}
                                    onChange={(e) => setAddressPart3(e.target.value)}
                                    style={{ border: "1px solid #9a9da1" }}
                                />
                            </div>

                            <div className="col-xl-4 col-lg-5 col-md-6 col-sm-12 mb-1">
                                {/* <Button
              variant="contained"
              color="primary"
              onClick={handleAutoBreakClick}
              style={{ marginRight: "5px" }}
            >
              AutoBreak
            </Button> */}
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleManualSearchClick}
                                >
                                    Start Manual Search
                                </Button>

                            </div>


                        </div>
                        <hr style={{ width: "85%", margin: "10px auto", borderColor: "black", borderBottom: "1px solid black" }} />
                    </div>

                    )}



                    {/* Inputs and buttons */}
                    <Grid container spacing={2} style={{ textAlign: "center" }}>


                        <Grid item xs={12} >

                            {!isDuesSearchComplete_1 && (<Button
                                variant="contained"
                                disabled={isDuesSearchComplete_2}
                                color="success"
                                onClick={(e) => handleCalculateDues()}
                                style={{ marginLeft: "10px" }}
                            >
                                Complete Dues Search
                            </Button>

                            )}
                            {!isDuesSearchComplete_1 && (<Button
                                variant="contained"
                                color="warning"
                                onClick={(e) => openModal()}
                                style={{ marginLeft: "10px" }}
                            >
                                Reset
                            </Button>

                            )}

                            <div class='modal modal-container' id="searchModal" tabindex="-1" role="dialog" style={{ top: "270px", left: "968px", width: "440px", position: "absolute" }}>
                                <div class="modal-dialog modal-container" role="document">
                                    <div className="modal-content modal-container">
                                        <div id="head" style={{ textAlign: "center", padding: "6px", display: "block", background: "linear-gradient(to bottom,#69c 40%,#316598) !important" }} className="modal-header">
                                            <h5 style={{ textAlign: "center" }} className="modal-title">Refine Search</h5>

                                        </div>
                                        <div className="modal-body" style={{ padding: "9px" }}>
                                            {/* Search Input */}
                                            <div className="form-group">

                                                <div class="d-flex justify-content-center " >

                                                    <div>
                                                        <label>Search Query</label>

                                                        <input
                                                            type="text"
                                                            className="form-control mr-5"
                                                            style={{ width: "95%" }}
                                                            value={searchQuery}
                                                            onKeyPress={(e) => handleKeyPress(e)}

                                                            onChange={handleSearchInputChange}
                                                        />
                                                    </div>
                                                    {/* {searchError && <span style={{color:"red"}} className="invalid-feedback1">{searchError}</span>} */}
                                                    <div className="mt-4">
                                                        <button
                                                            type="button"
                                                            className="btn btn-primary"
                                                            onClick={handleSearchClick}
                                                        >
                                                            Search
                                                        </button>
                                                    </div>
                                                    <div className="mt-4 ml-2">
                                                        <button
                                                            type="button"
                                                            className="btn btn-secondary"
                                                            onClick={closeModal}
                                                        >
                                                            Close
                                                        </button>
                                                    </div>


                                                </div>


                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>








                            {true > 0 && (<Button
                                variant="contained"
                                color="info"
                                onClick={(e) => goBack()}
                                style={{ marginLeft: "10px" }}
                            >
                                Back to Home
                            </Button>

                            )}

                            {!isDuesSearchComplete_1 && (<div className="form-group searchBorder" style={{ display: "inline-block" }}>

                                <div class="d-flex justify-content-center mr-3" style={{ marginLeft: "5px" }}>

                                    <div>
                                        {/* <label>Search Query</label> */}

                                        <input
                                            type="text"
                                            className="form-control mr-5"
                                            style={{ width: "100%" }}
                                            placeholder="Refine Search"
                                            value={searchQuery}
                                            onKeyPress={(e) => handleKeyPress(e)}

                                            onChange={handleSearchInputChange}
                                        />
                                    </div>

                                    <div className="ml-3" style={{ marginLeft: "0px" }}>

                                        <Button
                                            variant="contained"
                                            color="warning"
                                            onClick={handleSearchClick}
                                            style={{ marginLeft: "10px" }}
                                        >
                                            Refine Seach
                                        </Button>

                                        {true && (<Button
                                            variant="contained"
                                            color="info"
                                            onClick={(e) => originalList()}
                                            style={{ marginLeft: "10px" }}
                                        >
                                            Original List
                                        </Button>

                                        )}

                                        {/* <button
      type="button"
      className="btn btn-primary"
      onClick={handleSearchClick}
    >
      Search
    </button> */}
                                    </div>

                                </div>
                            </div>)}







                        </Grid>
                    </Grid>
                </div>


                <div style={{ marginTop: "-32px" }}>
                    {/* <ReactPaginate
                  pageCount={Math.ceil(searchResultsOther.length / itemsPerPage)}
                  pageRangeDisplayed={3}
                  marginPagesDisplayed={1}
                  onPageChange={handlePageClick}
                  containerClassName="pagination"
        activeClassName="active"
        previousLabel={<i className="previous" />}
        nextLabel={<i className="next" />}
                /> */}
                </div>

            </div>
        </>

    );
}

export default ManualSearch;