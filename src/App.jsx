import React, { useState, useEffect } from 'react';
import "./App.css";
import { BrowserRouter as Router} from 'react-router-dom';
import moment from 'moment-timezone';

function App() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [logType, setLogType] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [sortOrder, setSortOrder] = useState("newest");
  const [userIdData, setUserIdData] = useState([]);
  const [machineData, setMachineData] = useState([]);
  const [cewVersion, setCewVersion] = useState ('');
  const [startupPath, setStartupPath] = useState("");
  const [moduleNameOptions, setModuleNameOptions] = useState([]);
  const [selectedModuleName, setselectedModuleName] = useState('');
  const [contentNameOptions, setContentNameOptions] = useState([]);
  const [selectedContentName, setselectedContentName] = useState('');
  const [contentIDNameOptions, setContentIDNameOptions] = useState([]);
  const [selectedContentIDName, setselectedContentIDName] = useState('');
  
  useEffect(() => {
      // Filter data by Module Name
  const moduleNameRegex = /\[([^\[\]]*?[\w-]+[^\[\]]*?)\]/gi;
  const filteredOptions = data.filter(item => moduleNameRegex.test(item));
  // Extract the options within '[' and ']', remove duplicates, and exclude "contentid"
  const moduleNameOptionsSet = new Set();
  filteredOptions.forEach(item => {
    const matches = item.match(moduleNameRegex);
    if (matches && matches.length > 0) {
      matches.forEach(match => {
        const option = match.replace('[', '').replace(']', '');
        if (!option.toLowerCase().includes('contentid-')) {
          moduleNameOptionsSet.add(option);
        }
      });
    }
  });
  // Sort the options alphabetically
  const sortedModuleNameOptions = Array.from(moduleNameOptionsSet).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: 'base' }));
  setModuleNameOptions(sortedModuleNameOptions);
    // Filter data by Content Identifier Name
    const moduleContentRegex = /12345/g;
    const filteredContentNameOptions = data.filter(item => moduleContentRegex.test(item));
    setContentNameOptions(filteredContentNameOptions);
    // Filter data by Content ID
    const moduleContentIDRegex = /%/g;
    const filteredContentIDNameOptions = data.filter(item => moduleContentIDRegex.test(item));
    setContentIDNameOptions(filteredContentIDNameOptions);

  }, [data]);
  
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setFileName(file.name);
    const reader = new FileReader();
  
    if (file.size > 6 * 1024 * 1024) {
      alert('File size is too large. Please select a file under 6 MB');
      event.target.value = null;
      return;
    }
    let lines;
    reader.onload = () => {
  lines = reader.result.split('\n');
  const fileName = file.name; // get the name of the file
  const convertedData = lines.map(line => {
    const date = moment.utc(line.slice(0, 23)).tz(moment.tz.guess());
    const restOfLine = line.slice(24);
    const convertedDate = date.tz(moment.tz.guess()).format('YYYY-MM-DD h:mm:ss A');
    const lineWithFileName = `${convertedDate} ${restOfLine} ${fileName}`; // add the file name at the end of each line
    return lineWithFileName;
  });
  setData(convertedData);

 // Extract user IDs from file
const userIdsSet = new Set();
const userIdRegex = /"Username":\s*"(.+?)"/i;
lines.forEach((line) => {
  const matches = line.match(userIdRegex);
  if (matches && matches[1]) {
    const userId = matches[1] //.replace('@corp.bankofamerica.com', '');  Remove "@corp.bankofamerica" from the User ID
    userIdsSet.add(userId);
  }
});
const userIds = Array.from(userIdsSet);
setUserIdData(userIds);
/// Extract machine names from file
const machineSet = new Set();
const machineRegex = /Machine=([^ ]+)/i;
lines.forEach((line) => {
  const matches = line.match(machineRegex);
  if (matches && matches[1]) {
    machineSet.add(matches[1]);
  }
});
const machines = Array.from(machineSet);
setMachineData(machines);

// Extract CEW Version number from file
const cewVersions = new Set();
const cewVersionRegex = /"cewVersion":"([^"]+)"|CEW starting\. CewVersion: ([^ ]+)/i;
lines.forEach((line) => {
  const matches = line.match(cewVersionRegex);
  if (matches && (matches[1] || matches[2])) {
    const versionNumber = matches[1] || matches[2];
    cewVersions.add(versionNumber);
  }
});
const cewVersionsArray = Array.from(cewVersions);
setCewVersion(cewVersionsArray);

// Startup Path
const startupPathRegex = /startupArguments:\s*\[([^\]]+)\]/i;
lines.forEach((line) => {
  const matches = line.match(startupPathRegex);
  if (matches && matches[1]) {
    setStartupPath(matches[1]);
  }
});
    };
    reader.readAsText(file);
    const fileSizeInMB = file.size / (1024 * 1024);
    setFileSize(fileSizeInMB.toFixed(3));
  };

  function resetFilters() {
    setSearchTerm('');
    setLogType('');
    setStartDate(null);
    setEndDate(null);
    setSortOrder('newest');
    
    // Reset dropdowns to their default values
    const contentIdDropdown = document.getElementById('contentid-dropdown');
    if (contentIdDropdown) {
      contentIdDropdown.value = 'All';
    }
    const moduleNameDropdown = document.getElementById('module-name-dropdown');
    if (moduleNameDropdown) {
      moduleNameDropdown.value = 'All';
    }
    const identifierNameDropdown = document.getElementById('identifier-name-dropdown');
    if (identifierNameDropdown) {
      identifierNameDropdown.value = 'All';
    }
  }

  const handleExport = () => {
    const filterInfo = `Filters:
    File name: ${fileName}
    File size: ${fileSize || 'none'} MB
    User ID: ${userIdData || 'none'}
    Machine: ${machineData || 'none'}
    CEW Version: ${cewVersion || 'none'}
    Startup Path: ${startupPath || 'none'}
    Search term: ${searchTerm || 'none'}
    Log type: ${logType || 'none'}

    Sort order: ${sortOrder}
    Start date: ${startDate || 'none'}
    End date: ${endDate || 'none'}`;
  
    const filteredData = data.filter((item) => {
      // Filter based on search term
      if (searchTerm && !item.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
  
      // Filter based on log type
      if (logType && !item.toLowerCase().includes(` ${logType.toLowerCase()} `)) {
        return false;
      }
  
      // Filter based on date range
      if (startDate && moment.utc(item.slice(0, 23)).isBefore(startDate)) {
        return false;
      }
      if (endDate && moment.utc(item.slice(0, 23)).isAfter(endDate)) {
        return false;
      }
  
      return true;
    });
  
    const filteredDataText = `${filterInfo}\n\n${filteredData.join('\n')}`;
    const element = document.createElement('a');
    const file = new Blob([filteredDataText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = 'filteredData.txt';
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };  
  
  const handleSearchInput = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleLogTypeChange = (event) => {
    setLogType(event.target.value);
  };

  const handleModuleNameChange = (event) => {
    setselectedModuleName(event.target.value);
  };

  const handleContentNameChange = (event) => {
    setselectedContentName(event.target.value);
  };

  const handleContentIDNameChange = (event) => {
    setselectedContentIDName(event.target.value);
  };

  const handleStartDateChange = (event) => {
    const selectedDate = event.target.value;
    const startDate = selectedDate ? new Date(selectedDate) : null;
    setStartDate(startDate);
  };
  
  const handleEndDateChange = (event) => {
    const selectedDate = event.target.value;
    const endDate = selectedDate ? new Date(selectedDate) : null;
    setEndDate(endDate);
  };
  
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "newest" ? "oldest" : "newest");
  };
  
  const options = {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };

  const filteredData = data
  .filter((item) => {
    // Filter based on searchTerm
    if (searchTerm && !item.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    // Filter based on logType
    if (logType && !item.toLowerCase().includes(logType.toLowerCase())) {
      return false;
    }
    // Filter based on Module Name
    if (selectedModuleName && !item.toLowerCase().includes(selectedModuleName.toLowerCase())) {
      return false;
    }
    // Filter based on Content Identifier Name
    if (selectedContentName && !item.toLowerCase().includes(selectedContentName.toLowerCase())) {
      return false;
    }
    // Filter based on Content ID Name
    if (selectedContentIDName && !item.toLowerCase().includes(selectedContentIDName.toLowerCase())) {
      return false;
    }
    // Filter based on startDate
    if (startDate && new Date(item.split(" ")[0]) < startDate) {
      return false;
    }
    // Filter based on endDate
    if (endDate && new Date(item.split(" ")[0]) > endDate) {
      return false;
    }
    return true;
  })
  .sort((a, b) => {
    // Sort based on sortOrder
    const dateA = new Date(a.split(" ")[0] + " " + a.split(" ")[1] + " " + options.timeZone);
    const dateB = new Date(b.split(" ")[0] + " " + b.split(" ")[1] + " " + options.timeZone);
    if (sortOrder === "newest") {
      return dateB - dateA;
    } else {
      return dateA - dateB;
    }
  });

if (sortOrder === "oldest") {
  filteredData.reverse();
}

  const handleAboutClick = () => {
    const top = document.getElementById('top');
    top.scrollIntoView({ behavior: 'smooth' });
  };

  const handleContactClick = () => {
    const bottom = document.getElementById('bottom');
    bottom.scrollIntoView({ behavior: 'smooth' });
  };
  
  return (
    <Router>
    <div id='top'>
      <div className='header-wrapper'>
      <div className='top-row'>
        <button className='top-of-page' onClick={handleAboutClick}>Top of Page</button>
        <input className='upload-file' title='Upload File' type="file" id='file-upload' onChange={handleFileUpload} />
        <input type="text" className="search-input" value={searchTerm} onChange={handleSearchInput} placeholder='Search' />
        <button className='export' onClick={handleExport}>Export</button>
        <button className='reset-filters' onClick={resetFilters}>Reset Filters</button>
      </div>
      <div className='all-dropdowns'>
        <label className='dropdown-label' htmlFor="log-types">Log Level:</label>
        <select className='dropdown-boxes' id="log-types" value={logType} onChange={handleLogTypeChange}>
          <option value="">All</option>
          <option value="- Info:">Info</option>
          <option value="- Warn:">Warn</option>
          <option value="- Error:">Error</option>
        </select>
        <label className='dropdown-label' htmlFor="module-name-dropdown">Module Name:</label>
          <select className='dropdown-boxes' id="module-name-dropdown" value={selectedModuleName} onChange={handleModuleNameChange}>
            <option value="">All</option>
            {moduleNameOptions.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        <label className='dropdown-label' htmlFor="content-name-dropdown">Content Identifier Name:</label>
        <select className='dropdown-boxes' id="content-name-dropdown" value={selectedContentName} onChange={handleContentNameChange}>
          <option value="">All</option>
          {contentNameOptions.map((option, index) => (
            <option key={index} value={option}>{option}</option>
          ))}
        </select>
        <label className='dropdown-label' htmlFor="contentID-name-dropdown">Content ID:</label>
        <select className='dropdown-boxes' id="contentID-name-dropdown" value={selectedContentIDName} onChange={handleContentIDNameChange}>
          <option value="">All</option>
          {contentIDNameOptions.map((option, index) => (
            <option key={index} value={option}>{option}</option>
          ))}
        </select>
        </div>
        <div className='date-time'>
          <label className='start-date'>Start Date and Time:</label>
          <input className='start-date' id='datetime-id' type="datetime-local" onChange={handleStartDateChange} />
          <label className='end-date'>End Date and Time:</label>
          <input className='end-date' type="datetime-local" onChange={handleEndDateChange} />
          <button className='togglesortorder' onClick={toggleSortOrder}>Currently Displaying {sortOrder === "newest" ? "Oldest - Newest" : "Newest - Oldest"}</button>
        </div>
        </div>
        <div className='sub-header'>
          <label className='file-name'>File Name: <strong className='output-info'>{fileName}</strong></label>
          <label className='file-size'>File size: <strong className='filesizeoutput-info'>{fileSize}</strong> <label className='filesizebytes'>MB</label></label>
            <label className='userId'>User ID:</label>
            {userIdData.map((userId, index) => (
            <strong className='output-info' key={index}>{`${index > 0 ? ', ' : ''}${userId}`}</strong>))}        
          <label className='machine'>Machine: 
            {machineData.map((machineData, index) => ( 
            <strong className='machineoutput-info' key={index}>{`${index > 0 ? ', ' : ' '}${machineData}`}</strong>))}      
          </label>
          <label className='cew-version'>CEW Version: <strong className='output-info'>{cewVersion}</strong></label>
          <label className='startup-path'>Startup Path: <strong className='output-info'>{startupPath}</strong></label>
        </div>
        <div className='body'>
          <ul className='display-items'>
            {filteredData.map((item, index) => {
            const parts = item.split(',');
            const regex = new RegExp(`(${searchTerm})`, 'gi');
            const partsHighlighted = parts[0].split(regex);
            const display = searchTerm ? (
          <span>
            {partsHighlighted.map((part, i) =>
            regex.test(part) ? <mark key={i} className="highlight">{part}</mark> : part
            )}
            - {parts[1]}
          </span>
          ) : (
          <span>{item}</span>
          );
          return (
            <li key={index} className='li-display'>
              {display}
            </li>
          );
          })}
          </ul>
        </div>
      <div id='bottom'>
        <div className='footer'>
          <button className='bottom-of-page' onClick={handleContactClick}>
            Bottom of Page
          </button>
        </div>
      </div>
  </div>
    </Router>
  );    
}
export default App
