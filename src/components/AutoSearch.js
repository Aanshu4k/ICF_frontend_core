import React, { useState, useEffect } from "react";
import "./AutoSearch.css";
import Select from "react-dropdown-select";
import toast, { Toaster } from "react-hot-toast";
import CircularProgressWithLabel from "./CircularProgressWithLabel";
// import {useHistory} from 'react-router-dom';
import ProgressBar from '../components/progressBar/progressBar';
import { useNavigate } from "react-router-dom";
import axios from "axios";

const url = require("./config.json");

function AutoSearch(navigation) {

  const [casesData, setCasesData] = useState([]);
  const [casesDataOther, setCasesDataOther] = useState([]);
  const [icfData, setIcfData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState([]);
  const [matchingAddresses, setMatchingAddresses] = useState({});
  const [caseCount, setCaseCount] = useState(0);
  const [resetDivision, setResetDivision] = useState(false);
  const [selectedRowCount, setSelectedRowCount] = useState(0);
  const [searchProgress, setSearchProgress] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [urlDivision, seturlDivision] = useState([]);
  const [userId, setUserId] = useState();
  const [urlIpAddress, seturlIpAddress] = useState("");
  const [exclude_terms, set_exclude_terms] = useState([]);
  const [exclude_terms1, set_exclude_terms1] = useState([]);
  const [previousRoute, setPreviousRoute] = useState(null);
  const navigate = useNavigate();

  // const previousRoute = history.location.state && history.location.state.from.pathname;
  // alert(previousRoute)
  useEffect(() => {
    const preserveKey = "systemId";

    // Get all keys from sessionStorage
    const allKeys = Object.keys(sessionStorage);

    // Iterate through keys and remove those not matching the specified key
    allKeys.forEach(key => {
      if (key !== preserveKey || key !== "_selectedRows" || key != "_currentPage") {
        sessionStorage.removeItem(key);
      }
    });
    // Update the previous route when the route changes
    setPreviousRoute(navigate.location);
    console.log(previousRoute, "llllllllllll")
  }, []);

  useEffect(() => {
    // Function to extract the token from the URL
    const extractTokenFromURL = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const tokenParam = urlParams.get('token');
      if (tokenParam && !userId) {
        const key = "DSK19092022";
        localStorage.setItem("isTokenExist", "true");
        let decryptedData = DecryptData(tokenParam, key);
        decryptedData = decryptedData.split('&');
        if (decryptedData.length && !userId) {
          setUserId("done");
          seturlDivision(decryptedData[1] ? decryptedData[1].split(',') : []);
          seturlIpAddress(decryptedData[2])

        }
        console.log(decryptedData)

      } else {
        localStorage.removeItem("isTokenExist");
        console.error('Token not found in URL parameters');
      }
    };


    const DecryptData = (encryptedData, key) => {
      // Convert the Base64-encoded string to a byte array
      const encryptedBytes = atob(encryptedData).split('').map(char => char.charCodeAt(0));

      let decryptedString = '';
      for (let i = 0; i < encryptedBytes.length; i++) {
        const encryptedByte = encryptedBytes[i];
        const keyChar = key[i % key.length];
        const decryptedChar = String.fromCharCode(encryptedByte ^ keyChar.charCodeAt(0));
        decryptedString += decryptedChar;
      }

      // Ensure that the correct character encoding is used (UTF-8)
      return decodeURIComponent(encodeURIComponent(decryptedString));
    };
    // Call the function when the component mounts
    if (!userId) {
      extractTokenFromURL();
    }
  }, [userId]);



  const [aufnrSearch, setAufnrSearch] = useState('');
  const [filteredRows, setFilteredRows] = useState([]);

  // Function to handle changes in the AUFNR search input
  const handleAufnrSearch = (value) => {
    setAufnrSearch(value);
  };

  // Function to handle the search button click
  const handleSearch = () => {
    // Filter the rows based on the entered AUFNR
    console.log(aufnrSearch, "aufnrSearch");
    handlePageChange(1)
    if (!aufnrSearch) {
      setCasesData(casesDataOther);
      return
    }
    const newFilteredRows = casesDataOther.filter(row => row.AUFNR.includes(aufnrSearch));
    setCasesData(newFilteredRows);
  };
  const fetchDivisions = () => {
    let usertype = localStorage.getItem("user") || "undefined";

    // Define the data payload for the POST request
    const postData = {
      usertype
    };

    fetch(`${url.api_url}/api/divisions_on_page_load2`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Include any additional headers if required
      },
      body: JSON.stringify(postData), // Convert data to JSON format
    })
      .then((response) => response.json())
      .then((data) => {
        let arr = [];
        if (data.data) {
          data.data.forEach((x) => {
            arr.push({
              value: x.VAPLZ,
              label: x.VAPLZ + '-' + x.DIVISION_NAME,
            });
          });
        }

        console.log(arr, "arrarrarrarr");
        setDivisions(arr);
      })
      .catch((error) => {
        console.error("Error fetching divisions:", error);
      });
  };

  useEffect(() => {
    fetchDivisions();
  }, []);

  const pageIdentifier = "autoSearchPage";


  const handleFetchCases = () => {
    console.log(selectedDivision)
    if (!selectedDivision.length) {
      console.warn("Please select a division before fetching cases.");
      toast.error("Please select a division before fetching cases.");
      return;
    }
    let value = selectedDivision[0].value;
    let usertype = localStorage.getItem("user") || "undefined"
    handleButtonClick(1);

    const requestPromise = fetch(`${url.API_url_DEV}/api/fetch_cases`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ VAPLZ: value, usertype }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("HELLOOOOOO", data)
        const rowsWithId = data.data.map((row, index) => ({
          ...row,
          id: index + 1,
        }));
        handleButtonClick(0);

        for (let case_ of rowsWithId) {
          let exist = icfData.filter(x => x.aufnr == case_.AUFNR);
          console.log(exist, "existexistessssssssxistexist")
          if (exist.length) {
            if (exist[0].duesData.length) {
              case_.dues_found = true
            }
            if (exist[0].tpye && exist[0].tpye == 2) {
              case_.mcd_found = true
            }
          }
        }

        console.log(rowsWithId, "rowsWithIdrowsWithIdrowsWithIdrowsWithIdrowsWithId")
        setCasesData(rowsWithId);
        setCasesDataOther(rowsWithId);
        // Update the case count
        setCaseCount(rowsWithId.length);
        console.log("Fetched cases data:", rowsWithId);
        let filter = divisions.filter(x => x.VAPLZ === value);

        localStorage.setItem("selectedDivision", JSON.stringify(filter))
        const requestPromise = fetch(`${url.API_url}/api/synonyms`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ division: value }),
        })
          .then((response) => response.json())
          .then((data) => {
            localStorage.setItem('synom', JSON.stringify(data.data));
            localStorage.setItem('area#', JSON.stringify(data.area))
            console.log("synommmmmmmmmmmmmmmmm", data)
          })
          .catch((error) => {
            handleButtonClick(0);
            console.error("Error fetching cases:", error);
          });

        const requestPromise1 = fetch(`${url.API_url}/api/exclude_list`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ division: value }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.data && data.data.length) {
              set_exclude_terms(data.data[0]);
              localStorage.setItem("exclude_1", JSON.stringify(data.data[0]))
            }
            if (data.area && data.area.length) {
              set_exclude_terms1(data.area[0]);
              localStorage.setItem("exclude_2", JSON.stringify(data.area[0]))
            }
          })
          .catch((error) => {
            handleButtonClick(0);
            console.error("Error fetching cases:", error);
          });
      })
      .catch((error) => {
        handleButtonClick(0);
        console.error("Error fetching cases:", error);
      });
  };

  function splitStringByNumericBetweenAlphabets(inputString) {
    const regex = /([A-Za-z]+)(\d+)([A-Za-z]+)/;
    const match = inputString.match(regex);

    if (match) {
      const [, firstPart, numericPart, secondPart] = match;
      console.log(firstPart, numericPart, secondPart)
      const firstResult = firstPart + numericPart;
      const secondResult = numericPart + secondPart;

      return [firstResult, secondResult];
    }

    return [inputString];
  }

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
        console.log(word, "wordwordword", longestWord)
        if (word.length > longestWord.length) {
          longestWord = word;
        }
      }
      console.log(longestWord, "aaaaaaaaaa")
      res(longestWord);

    })
  }
  // removes specific word from the search string in both top and bottom window
  let removeonlystr = ["dairy", "hn0", "propno", "and"];
  // removes word from final string passes in top window 

  const addCommaAfterSpace = (inputString) => {
    // Split the input string into an array of words
    const wordsArray = inputString.split(' ');
    // Join the words in the array with a comma and a space
    const resultString = wordsArray.join(', ');
    return resultString;
  }

  const searchMatchingResultAlgoAgainForWords = async (address, data, finalArar) => {
    return new Promise(async (res, rej) => {
      try {
        let sap_address = address;
        sap_address = addCommaAfterSpace(sap_address);
        let filteredSapAddress = sap_address;
        filteredSapAddress = filteredSapAddress.replace(/([a-zA-Z0-9])-*, *([a-zAZ0-9])/g, '$1, $2');
        exclude_terms1.forEach(term => {
          const regex = new RegExp(`\\b${term}\\b`, 'gi');
          filteredSapAddress = filteredSapAddress.replace(regex, '');
        });

        // filteredSapAddress = filteredSapAddress.replace(/[^\w\s-]/g, '');
        filteredSapAddress = filteredSapAddress.replace(/[^\w\s-/()]/g, '');
        // Add space before opening parenthesis
        filteredSapAddress = filteredSapAddress.replace(/(\()/g, ' $1');

        // Add space after closing parenthesis
        filteredSapAddress = filteredSapAddress.replace(/(\))/g, '$1 ');
        filteredSapAddress = filteredSapAddress.replace(/[()]/g, '');


        filteredSapAddress = filteredSapAddress.split(/\s+/).join(' ');

        let searchWords = filteredSapAddress.split(' ');

        searchWords = searchWords.filter(x => x !== "")
        console.log(searchWords, "filteredSapAddressfilteredSapAddress");

        let longestWord = searchWords.reduce((prev, current) => (current.length > prev.length ? current : prev), '');
        let lastLongestWord = await findLastLongestWord(sap_address);
        searchWords.splice(searchWords.indexOf(longestWord), 1);
        let secondLongestWord = searchWords.reduce((prev, current) =>
          current.length > prev.length ? current : prev,
          ''
        );

        console.log(searchWords, longestWord, lastLongestWord, secondLongestWord, "word Arr");

        searchWords.splice(searchWords.indexOf(secondLongestWord), 1);
        let thirdLongestWord = searchWords.reduce((prev, current) =>
          current.length > prev.length ? current : prev,
          ''
        );

        searchWords.splice(searchWords.indexOf(thirdLongestWord), 1);

        let fourLongestWord = searchWords.reduce((prev, current) =>
          current.length > prev.length ? current : prev,
          ''
        );

        searchWords.splice(searchWords.indexOf(fourLongestWord), 1);

        let fiveLongestWord = searchWords.reduce((prev, current) =>
          current.length > prev.length ? current : prev,
          ''
        );

        let final_array_of_words = [longestWord, lastLongestWord, secondLongestWord, thirdLongestWord, longestWord, fiveLongestWord];
        console.log(final_array_of_words, fiveLongestWord, "final words array")
        final_array_of_words = final_array_of_words.filter(word => {
          if (/\d/.test(word)) {
            return false;
          }
          return true;
        }).map(word => word.toLowerCase());
        // exclude_terms1.push("KHASRA","khasra")
        console.log(exclude_terms1, "exclude_terms1exclude_terms1exclude_terms1")
        let send_to_backend = final_array_of_words.filter(item => !exclude_terms1.includes(item) && item !== "");
        console.log(send_to_backend, fiveLongestWord, "send_to_backendsend_to_backend")

        send_to_backend = send_to_backend.filter(word => word.length >= 3);
        // send_to_backend.push()
        res(send_to_backend);
      } catch (error) {
        console.log(error);
        res([]);
      }
    });
  };


  const searchMatchingResultAlgoAgain = async (address, data) => {
    return new Promise(async (res, rej) => {
      try {
        let inputAddress = address;
        // inputAddress = inputAddress.replace('&',' ')
        inputAddress = inputAddress.replace(/([a-zA-Z0-9])-*, *([a-zA-Z0-9])/g, '$1, $2');
        console.log(inputAddress, "inputAddressfilteredSapAddress");

        // inputAddress = inputAddress.replace(/[^\w\s-/()]/g, '');
        inputAddress = inputAddress.replace(/[^\w\s&/() -]/g, '');
        inputAddress = inputAddress.replace(/&/g, '/');
        inputAddress = inputAddress.replace('AND', '/');
        // Add space before opening parenthesis
        inputAddress = inputAddress.replace(/(\()/g, ' $1');
        // Add space after closing parenthesis
        inputAddress = inputAddress.replace(/(\))/g, '$1 ');
        inputAddress = inputAddress.replace(/[()]/g, '');

        console.log(inputAddress, "inputAddress3");

        let regex = /\/(\w+)/g;
        inputAddress = inputAddress.replace(regex, '/$1 ');
        inputAddress = inputAddress.replace(/ \//g, '');
        console.log(inputAddress, "inputAddress2")

        inputAddress = inputAddress.split(/\s+/).join(' ');
        console.log(inputAddress, "inputAddress1")


        function doesNotContainAlphabet(inputString) {
          return !/[a-zA-Z]/.test(inputString);
        }
        function containsNumbers(word) {
          return /\d/.test(word);
        }

        function containsOnlyLetters(inputString) {
          return /^[a-zA-Z]+$/.test(inputString);
        }
        console.log(inputAddress, "inputAddress");

        let wordsArray = inputAddress.split(' ');

        let mergedWords = [];
        let currentWord = '';
        wordsArray = wordsArray.filter(x => x != "AND" || x != "OR")
        for (let word of wordsArray) {
          if (currentWord && !containsNumbers(word)) {
            mergedWords.push(currentWord);
          }
          const endsWithNumber = /\d$/.test(currentWord);
          const startsWithNumber = /^\d/.test(word);
          console.log(currentWord, word, isNaN(word), "defrf");
          // // alert()
          if (!/[a-zA-Z]/.test(word)) {
            let numbersBeforeSlash = word.split("/")[0];

            mergedWords.push(numbersBeforeSlash)
          };

          if (currentWord && currentWord.length <= 2 && containsNumbers(word)) {
            currentWord = currentWord ? `${currentWord} ${word}` : word;
          } else {
            if (startsWithNumber && !endsWithNumber) {
              currentWord = currentWord ? `${currentWord} ${word}` : word;
            } else if ((word.toLowerCase()).startsWith("no") && containsOnlyLetters(currentWord)) {
              currentWord = currentWord ? `${currentWord} ${word}` : word;
            } else if ((currentWord.startsWith("KH") || currentWord.startsWith("PLOT") || currentWord.startsWith("PLT") || currentWord.startsWith("GALI")) && doesNotContainAlphabet(word)) {
              const prefix = currentWord.match(/^([a-zA-Z]+)(.*)/);
              if (prefix && prefix.length) {
                word = prefix[1] + word;
                mergedWords.push(currentWord);
                currentWord = word;
              }
            } else {
              mergedWords.push(currentWord);
              currentWord = word;
            }
          }
        }

        if (currentWord) {
          mergedWords.push(currentWord);
        }

        let mergedWords_bkp = mergedWords;
        mergedWords = [];
        const alphabetPattern = /[a-zA-Z]/;
        mergedWords_bkp.forEach(x => {
          if (x.includes("/") && !x.startsWith("KH")) {
            let split = x.split("/");
            if (split.length) {
              let split1 = split[1];
              console.log(split1)
              if (alphabetPattern.test(split1)) {
                console.log(split1, "checking ...")
                mergedWords.push(...split)
              } else {
                mergedWords.push(x)
              }
            }
          }
          else {
            mergedWords.push(x)
          }
          // if (x.includes("/")) {
          //   let split = x.split("/");
          //   if (split.length) {
          //     let split1 = split[0];
          //     console.log(split1)
          //     if (alphabetPattern.test(split1)) {
          //       console.log(split1, "checking ...")
          //       mergedWords.push(...split, x)
          //     } else {
          //       mergedWords.push(x)
          //     }
          //   }
          // }
          let str = x;
          if (str.includes("/")) {
            let split = str.split("/");
            if (split.length > 1) {
              let split1 = split[0];
              let split2 = split[1];
              split1 = split1.replace(' ', '')
              let alphabeticPart = split1.match(/[a-zA-Z]+\s*/);
              console.log(alphabeticPart, "alphabeticPartalphabeticPartalphabeticPart")
              if (alphabeticPart) {
                let mergedWord = alphabeticPart[0].replace(/\s/g, '') + split2;
                mergedWords.push(split1, mergedWord);
              } else {
                mergedWords.push(str);
              }
            }
          } else {
            mergedWords.push(str);
          }
        })

        console.log(mergedWords, "mergedWords");

        let splitAndCleanedWords = mergedWords.map(word => word.replace(/\W/g, '').split(' ')).flat();
        splitAndCleanedWords = splitAndCleanedWords.map(x => x.toUpperCase())
        console.log(splitAndCleanedWords, "splitAndCleanedWords");

        let new_words_arr = []

        function addRomanNumerals(word) {
          let new_word = word;
          if (word.includes("1ST")) {
            let r = new_word.replace('1ST', '');
            new_words_arr.push(r)
            new_word = new_word.replace('1ST', 'I');
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

        const wordsWithNumbers = splitAndCleanedWords.filter(containsNumbers);
        let modifiedWords = wordsWithNumbers.map(addRomanNumerals);
        modifiedWords = modifiedWords.concat(new_words_arr);
        console.log(modifiedWords, "modifiedWords")
        res(modifiedWords);
      } catch (error) {
        console.log(error);
        res([]);
      }
    });
  };
  function removeWordsFromArray(inputString, wordsToRemove) {
    let result = inputString;

    wordsToRemove.forEach(word => {
      word = word.toUpperCase();
      result = result.replace(new RegExp(word, "g"), "");
    });
    console.log(result, "resultresult")
    return result;
  }
  const handleRowClick = (row) => {
    setSelectAllChecked(false);
    console.log(selectedRows, "fffffffffffff");

    setSelectedRows([row]); // Set the selected row to an array containing only the clicked row

    setSelectedRowCount(1);
  };
  function removeSpecialCharsFromArray(array) {
    const resultArray = array.map(str => str.replace(/[^\w\s]/g, ''));
    return resultArray;
  }
  const [ipAddress, setIpAddress] = useState(null);

  useEffect(() => {
    const fetchIpAddress = async () => {
      try {
        const response = await axios.get('https://api.ipify.org/?format=json');
        setIpAddress(response.data.ip);
      } catch (error) {
        console.error('Error fetching IP address:', error);
      }
    };
    fetchIpAddress();
  }, []);


  const handleSearchMatchingAddresses = async () => {
    localStorage.setItem('selectedRows_1', JSON.stringify([]));
    localStorage.setItem('selectedMatchedRows', JSON.stringify(selectedRows));
    if (selectedRows.length === 0) {
      console.warn("No rows selected. Please select one or more rows.");
      toast.error("Please select a case to start searching");
      return;
    }

    function setSearchLogs(payload) {
      let usertype = localStorage.getItem("user") || "undefined"
      payload['usertype'] = usertype;
      const requestPromise = fetch(`${url.API_url}/api/create_log`, {
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
    handleButtonClick(1);
    const requests = [];
    let saveExistRes = {};
    let addr = [];
    const requestPromises = selectedRows.map(async (row, index) => {
      const startTime = new Date();
      let finalStr = await searchMatchingResultAlgoAgain(row.SAP_ADDRESS, []);
      const inputAddress = row.SAP_ADDRESS;
      function containsWord(word) {
        if (word && word.includes('NO')) {
          return false;
        }
        return exclude_terms.some(arrWord => word.includes(arrWord.toUpperCase()))
      }
      let new_arr = finalStr.filter(x => !containsWord(x))
      finalStr = new_arr;
      const uniqueArray = [...new Set(finalStr)];
      finalStr = uniqueArray;
      let secondFinalStr = await searchMatchingResultAlgoAgainForWords(row.SAP_ADDRESS, []);
      console.log(finalStr, "Second Final Str => ", secondFinalStr);

      let uniqueArray1 = [...new Set(secondFinalStr)];
      uniqueArray1 = uniqueArray1.map(x => x.toUpperCase());
      console.log(finalStr, "kaml sharma", uniqueArray1);
      let gali_no = finalStr.filter(x => x.includes('GALI'));
      finalStr = finalStr.filter(x => !x.includes('GALI'));

      uniqueArray1 = uniqueArray1.filter(x => !x.includes('GALI'))

      uniqueArray1.push(...gali_no);
      uniqueArray1 = uniqueArray1.filter(x => !x.includes('EXT'));

      let r = [];
      let r1 = [];
      let isAreaExis1t = [];

      finalStr.forEach(x => {
        const prefix = x.match(/^([a-zA-Z]+)(.*)/);
        if (prefix && prefix.length) {
          let arr = getWordArr(prefix[1], prefix[2]);
          let isAreaExist = getWordArr1(prefix[1]);
          if (isAreaExist.length) {
            isAreaExis1t.push(x);
            r1.push(x, ...arr)
          } else {
            console.log(arr, "arrarrarr")
            r.push(x, ...arr)
          }
        } else {
          r.push(x)
        }
      });
      console.log(r, "qwerty...");
      let areaExist2 = [];
      console.log(uniqueArray1, "ajay sir");
      r.map(x => x = removeWordsFromArray(x, removeonlystr));

      let sealing_str = []
      uniqueArray1.forEach(x => {
        console.log("Unique Array 1 : ", x)
        const prefix = x.match(/^([a-zA-Z]+)(.*)/);
        if (prefix && prefix.length) {
          let arr = getWordArr(prefix[1], prefix[2]);
          let area = getWordArr1(prefix[1]);
          if (area.length) {
            if (x && x.length <= 3) {
              areaExist2.push(x);
              sealing_str.push(x);
            } else {
              let breakword = x.slice(0, 3);
              let breakword1 = x.slice(0, 4);
              sealing_str.push(x, breakword1);
              areaExist2.push(x, breakword)
            }

          } else {
            console.log(arr, "array")
            r1.push(x, ...arr)
          }
        } else {
          r1.push(x)
        }
      });

      console.log(r, "isAreaExis1tisAreaExis1t")
      r = r.filter(x => !isAreaExis1t.includes(x));
      console.log(r, "isAreaExis1tisAreaExis1t 111")
      sealing_str = [...sealing_str];
      sealing_str = sealing_str.filter(x => x !== "PHASE")

      r1 = [...r1, ...isAreaExis1t, ...areaExist2];
      r = r.map(x => {
        return removeWordsFromArray(x, removeonlystr)
      });
      const nonKhElements = r.filter(element => !element.startsWith("KH") && !element.startsWith("KN"));
      if (nonKhElements.length > 0) {
        // Remove any element starting with "kh" from arr and push to arr2
        r = r.filter(element => {
          if (element.startsWith("KH") || element.startsWith("KN")) {
            r1.push(element);
            return false; // Remove "kh" element from arr
          }
          return true; // Keep non-"kh" element in arr
        });
      }

      r = r.filter(x => {
        console.log(x, "is number")
        if (/^[0-9]+$/.test(x)) {
          if ((+x) >= 99) {
            return true
          } else {
            return false
          }
        } else {
          return true
        }
      });
      r = r.filter(
        (value, index, self) => self.indexOf(value) === index
      );
      const nonKhElements1 = r.filter(element => !element.startsWith("KH") && !element.startsWith("KN"));

      if (nonKhElements1.length === 0) {
        // alert("kamal")
        let filter = r1.filter(x => x.startsWith("KH"));
        console.log(filter, "filterfilterfilter")
        r.push(...filter);
        r1 = r1.filter(x => !x.startsWith("KH"));
      } else {
        // r = r.filter(element => isNaN(element) || element >= 100);
      };
      if (!r.length) {
        let data = localStorage.getItem('area#');
        if (data) {
          data = JSON.parse(data);
        } else {
          data = []
        };
        let flattenedArray = [].concat(...data);
        console.log(flattenedArray, "data ...");
        r = r1;
        r = r.filter(element => !flattenedArray.includes(element));
        r = r.filter(element => element.length > 2);
        r1 = r1.filter(element => !r.includes(element));
      }

      r = r.filter(item => {
        const numericPart = item.match(/\d+/);
        return numericPart !== null;
      });
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
        finalStr: r,
        sealing_str,
        secondFinalStr: r1
      };
      console.log("PAYLOAD FOR SEARCH API : ", payload)
      let splitedNumeric = []
      r.map(x => {
        if (x) {
          let word = splitStringByNumericBetweenAlphabets(x);
          splitedNumeric.push(...word);
        }
      })
      let finalSplitWords = []
      r.map(x => {
        if (x) {
          let match = x.match(/([0-9]+)([A-Za-z]+)([0-9]+)/);
          if (match) {
            let numericPart1 = match[1];
            let alphabeticPart = match[2];
            let numericPart2 = match[3];
            finalSplitWords.push(`${numericPart1}${alphabeticPart}`, `${alphabeticPart}${numericPart2}`)
          } else {
            finalSplitWords.push(x)
            console.log("No match found");

          }
        }
      });
      finalSplitWords = finalSplitWords.filter(x => !x.startsWith("1100"));
      payload.secondFinalStr = payload.secondFinalStr.filter(x => !x.startsWith("1100"));
      payload.secondFinalStr = removeSpecialCharsFromArray(payload.secondFinalStr);

      payload.finalStr = finalSplitWords;
      let ndstr = [];
      let khExist = payload.secondFinalStr.filter(x => x.startsWith("KH"));
      if (khExist.length) payload.finalStr = [];
      payload.secondFinalStr.map(x => {
        if (x.startsWith("KH")) {
          payload.finalStr.push(x)
        } else {
          ndstr.push(x)
        }
      });
      payload.secondFinalStr = ndstr;
      payload['addr'] = row;
      localStorage.setItem('searchStr', JSON.stringify(payload));
      try {
        let response = await fetch(`${url.API_url}/api/search`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        let data = await response.json();
        console.log("SEARCH API RESPONSE : ", data)
        row.final = data.results_count;
        if (data.count <= 2000) {
          saveExistRes[`${row.AUFNR}`] = data.results_count;
        }
        saveExistRes[`${row.AUFNR}_count`] = data.count;
        addr.push(row);
        const endTime = new Date();
        const timeElapsedInMilliseconds = endTime - startTime;
        const minutes = Math.floor(timeElapsedInMilliseconds / 60000);
        const seconds = Math.floor((timeElapsedInMilliseconds % 60000) / 1000);
        const milliseconds = (timeElapsedInMilliseconds % 1000).toString().padStart(3, '0').slice(0, 2);
        const formattedTime = `${minutes.toString().padStart(2, '0')} minutes, ${seconds.toString().padStart(2, '0')} seconds, ${milliseconds} milliseconds`;

        localStorage.setItem('manual', JSON.stringify(row));
        let obj = {
          "obj": {
            "LogTextMain": finalStr.join(','),
            "logTextAndSrc": uniqueArray1.join(','),
            "MethodName": "AUTO-MODE",
            "SolrSearchTime": formattedTime,
            "REQUEST": row.AUFNR,
            "refineStr": data.refine_str,
            result_count: '' + data.count,
            IP_address: ipAddress
          }
        };
        setSearchLogs(obj);
        localStorage.setItem('sealing_data_1', JSON.stringify(data.sealing_data))
      } catch (error) {
        console.error("Error in one or more requests:", error);
        setIsSearching(false);
        handleButtonClick(0);
        // Show an error toast
        toast.error("Error in one or more requests. Search Process is complete.");
      }
    });

    // Use Promise.all to wait for all promises to resolve
    await Promise.all(requestPromises);
    localStorage.removeItem('existingResult');
    console.log("saveExistRes : ", saveExistRes);
    localStorage.setItem('saveExistRes', JSON.stringify(saveExistRes));
    navigate('/output');
    handleButtonClick(0);
    setIsSearching(false);
    setSearchProgress(0);

  };
  const handleSearchMatchingAddresses1 = async (selectedRows) => {
    localStorage.setItem('selectedRows_1', JSON.stringify([]));
    localStorage.setItem('selectedMatchedRows', JSON.stringify(selectedRows));
    if (selectedRows.length === 0) {
      console.warn("No rows selected. Please select one or more rows.");
      toast.error("Please select a case to start searching");
      return;
    }
    if (true) {
      // localStorage.setItem('needInsertion',JSON.stringify(addr));
      navigate('/output')
      handleButtonClick(0);
      return
    }
  };

  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const handleRowClickAll = (e) => {
    if (e.target.checked) {
      console.log("sss")
      // setSelectedRows([...selectedRows]);
      setSelectedRows([...currentRows])
      setSelectedRowCount(currentRows.length)
      setSelectAllChecked(true)
    } else {
      setSelectedRows([]);
      console.log("kam")
      setSelectAllChecked(false);
      setSelectedRowCount(0)
    }
    console.log(selectAllChecked, "kkkkkjj")
  }
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  // Example usage

  // console.log('Generated UUID:', uuid);

  useEffect(() => {
    const systemId = sessionStorage.getItem('systemId');
    if (!systemId) {
      const uuid = generateUUID();
      sessionStorage.setItem("systemId", uuid)
    }
  }, []);

  const handleRowClickAll1 = async (casesData) => {

    return new Promise((res, rej) => {
      console.log(casesData, "casesDatacasesData")
      setSelectedRows([...casesData])
      setSelectedRowCount(casesData.length)
      setSelectAllChecked(true);
      res(casesData);
    })
  }

  function removeSpecialCharsAndCapitalize(inputString) {
    // Remove special characters and spaces, but keep numeric characters
    const cleanedString = inputString.replace(/[^a-zA-Z0-9]/g, '');

    // Capitalize the cleaned string
    const capitalizedString = cleanedString.toUpperCase();

    return capitalizedString;
  }

  const getWordArr = (word, rest) => {

    console.log(word, "wordwordwordword")
    let data = localStorage.getItem('synom');
    if (data) {
      data = JSON.parse(data);
    } else {
      data = []
    };
    console.log(data, "datadatadatadata")
    const wordToMatch = word; // The complete word you want to match
    const regex = new RegExp(`\\b${wordToMatch}\\b`); // Create a regular expression with word boundaries
    let filteredData = data.filter(subarray => {
      return subarray.some(element => typeof element === "string" && regex.test(element));
    });
    let finalArr = [];
    if (!filteredData.length) {
      return []
    }
    filteredData[0].forEach(x => {
      if (x) {
        let r = removeSpecialCharsAndCapitalize(x);
        console.log(r, "wadhjxnm")
        finalArr.push(r + rest)
      }

    })

    console.log(finalArr);
    return finalArr
  }

  const getWordArr1 = (word, rest) => {

    console.log(word, "wordwordwordword")
    let data = localStorage.getItem('area#');
    if (data) {
      data = JSON.parse(data);
    } else {
      data = []
    };
    console.log(data, "datadatadatadata")
    const wordToMatch = word; // The complete word you want to match
    let filteredData = data.filter(subarray => {
      return subarray.some(element => typeof element === "string" && ((element.toUpperCase()) == wordToMatch));
    });
    let filteredData1 = data.filter(subarray => {
      return subarray.some(element => typeof element === "string" && ((wordToMatch.includes(element.toUpperCase()))));
    });
    if (!filteredData.length) {
      // if(filteredData1.length)
      return []
    } else {
      return ['1']
    }

  }

  // Function to handle reset
  const handleReset = () => {
    setSelectedDivision(""); // Reset selected division
    setCasesData([]); // Clear cases data
    setCaseCount(0); // Reset case count
    setResetDivision(true); // Trigger a reset for the division dropdown
  };

  const rowsPerPage = 10; // Number of rows to display per page
  const [currentPage, setCurrentPage] = useState(1);

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;

  const currentRows = casesData.slice(indexOfFirstRow, indexOfLastRow);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };


  const [progressValue, setProgressValue] = useState(0);
  const [showProgressBar, setShowProgressBar] = useState(false);

  const handleButtonClick = (val) => {
    setProgressValue(0)
    setShowProgressBar(true)
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

  const handleFetchCases1 = async (element) => {
    console.log(urlDivision)

    return new Promise((res, rej) => {
      let finalTotalCases = []
      if (!element || !element[0]) {
        console.warn("Please select a division before fetching cases.");
        toast.error("Please select a division before fetching cases.");
        return;
      }
      handleButtonClick(1);
      fetch(`${url.api_url}/api/fetch_cases_all`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ VAPLZ: element }),
      })
        .then((response) => response.json())
        .then((data) => {
          const rowsWithId = data.data.map((row, index) => ({
            ...row,
            id: index + 1,
          }));
          handleButtonClick(0);
          setCasesData(rowsWithId);
          localStorage.setItem("selectedDivision", JSON.stringify(element));
          res(rowsWithId);
        })
        .catch((error) => {
          handleButtonClick(0);
          rej("s")
          console.error("Error fetching cases:", error);
        });
    })



  };

  const handleAutomaticSearch = async () => {
    if (userId && urlDivision[0]) {
      let db = await handleFetchCases1(urlDivision);
      await handleRowClickAll1(db);
      await handleSearchMatchingAddresses1(db);
    }
  };

  useEffect(() => {
    const fetchIpAddress = async () => {
      try {
        let obj = {
          systemId: sessionStorage.getItem("systemId")
        }
        let data = await fetch(`https://icf1.bsesbrpl.co.in/api/icf_data_by_params_id`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(obj),
        });
        const apiResponse = await data.json();
        setIcfData(apiResponse.data || []);
      } catch (error) {
        console.error('Error fetching IP address:', error);
      }
    };
    fetchIpAddress();
  }, []);

  useEffect(() => {
    if (userId) {
      handleAutomaticSearch();

    }
  }, [userId]); // Ensure that this effect runs when userId changes
  useEffect(() => {
    if (!localStorage.getItem("userIsLoggedIn")) {
      navigate('/login')
    }
  }, []); // Ensure that this effect runs when userId changes

  return (
    <div>

      <div className="table-container">


        <div className="App">

        </div>
        {showProgressBar && <ProgressBar value={progressValue} max={100} />}
        <div className="g-dropdown container-fluid">

          <div className="row">
            <div className="col-xs-12 col-sm-12 col-md-8 col-lg-8">

              {divisions.length > 0 && (
                <Select
                  options={divisions}
                  labelField="label"
                  placeholder="Select Division"
                  menuContainerStyle={{ width: '1000px', height: '600px' /* set your desired width here */, fontSize: '18px' /* set your desired font size here */ }}
                  optionStyle={{ fontSize: '18px', fontWeight: "600", width: '1000px', color: "black", alignItems: "left", textAlign: "left"/* set your desired font size here */, width: '100%' /* set your desired width here */ }}
                  dropdownHeight="400px"
                  style={{ borderRadius: "9px", height: "39px", fontSize: '20px', textAlign: "left" }}
                  searchable={true}
                  valueField="value"
                  onChange={setSelectedDivision}
                />
              )}

            </div>
            <div className="col-xs-12 col-sm-12 col-md-4 col-lg-4">
              <div className="button-container">

                <button onClick={handleFetchCases} class="button-21" role="button">Fetch Cases</button>



                <button type="button" style={{ width: "290px", justifyContent: "ceter" }} onClick={handleSearchMatchingAddresses} class="button-21"> Dues Process</button>
                <button type="button" style={{ width: "120px", justifyContent: "center" }} onClick={handleReset} class="button-88">Reset</button>
              </div>
            </div>

          </div>




        </div>
        <div className="top-paginastion container-fluid">
          <div class="row" style={{ marginTop: "6px" }}>
            <div className="col-xs-12 col-sm-12 col-md-4 col-lg-4">
              <div style={{ float: "left" }}> <p className="case-count">
                Number of Cases Fetched: {caseCount}
                {selectedRowCount > 0 && (
                  <>
                    {" "}
                    | {selectedRowCount} row{selectedRowCount > 1 ? "s" : ""} selected
                  </>
                )}
              </p></div>
            </div>

            <div className="col-xs-12 col-sm-12 col-md-8 col-lg-8">
              <div style={{ float: "left" }}>
                <input
                  placeholder="Search by Order No"
                  type="text"
                  className="mr-3 ml-3"
                  id="aufnrSearch"
                  style={{
                    borderRadius: "9px", height: "39px", width: "330px", marginRight: "13px",
                    paddingLeft: "10px",  // Adjust the left padding as needed

                  }}
                  onChange={(e) => handleAufnrSearch(e.target.value)}
                />
                <button className="ml-3" onClick={handleSearch}>Search</button>
              </div>
            </div>


          </div>



          <div>{casesData.length > 0 && (
            <div className="pagination">
              <button style={{ padding: "2px 7px" }}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <span> &larr; </span> Previous
              </button>
              <button style={{ backgroundColor: "transparent", color: "black", padding: "0px 0px" }}>Page {currentPage}</button>
              <button style={{ padding: "2px 7px" }}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={indexOfLastRow >= casesData.length}
              >
                Next <span> &rarr; </span>
              </button>
            </div>
          )}</div>
        </div>

        {isSearching && (
          <div className="overlay">
            <CircularProgressWithLabel value={searchProgress} />
          </div>
        )}
        {!userId && (
          <div class="tables-page-section">
            <div class="container-fluid">
              <div class="row">
                <div class="row">
                  {/* Add the new field and search button */}


                  <div class="col-lg-12">
                    <div className="table-responsive table-bordered table-striped table-hover" style={{ maxHeight: "450px", overflow: "auto", marginBottom: "10px" }}>
                      <table className="table table-bordered table-striped table-hover" style={{ width: "100%", overflow: "scroll" }}>
                        <thead className="fixed-header">
                          <tr>
                            <th style={{ width: "5%" }}></th>

                            <th style={{ width: "12%" }}>ORDER NO</th>
                            <th style={{ width: "13%" }}>REQUEST NO</th>
                            {/* <th style={{ width: "13%" }}>DIVISION</th> */}
                            <th style={{ width: "16%" }}>NAME</th>
                            <th style={{ width: "30%" }}>APPLIED ADDRESS</th>
                            <th style={{ width: "10%" }}>REQUEST TYPE</th>
                            <th style={{ width: "8%" }}>Dues Search</th>
                            <th style={{ width: "9%" }}>MCD Search</th>
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
                            {/* <td>{row.VAPLZ}</td> */}
                            <td>{row.NAME}</td>
                            <td style={{ textAlign: "left" }}>{row.SAP_ADDRESS}</td>
                            <td> {(() => {
                              switch (row.ILART) {
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
                                  return row.ILART; // If none of the above, just display the original value
                              }
                            })()}</td>
                            <td>
                              {row.dues_found ? (
                                <i className="fa fa-check" style={{ color: 'green', fontSize: '18px' }} />
                              ) : (
                                <i className="fa fa-times" style={{ color: 'red', fontSize: '18px' }} />
                              )}
                            </td>

                            <td>
                              {row.mcd_found ? (
                                <i className="fa fa-check" style={{ color: 'green', fontSize: '18px' }} />
                              ) : (
                                <i className="fa fa-times" style={{ color: 'red', fontSize: '18px' }} />
                              )}
                            </td>
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
      <Toaster />
    </div>
  );
}

export default AutoSearch;