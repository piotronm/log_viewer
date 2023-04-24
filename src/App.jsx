import React, { useState } from 'react';
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
  const [selectedContentId, setSelectedContentId] = useState('');
  const [selectedModuleName, setSelectedModuleName] = useState('');
  const [sortOrder, setSortOrder] = useState("newest");
  const [userIdData, setUserIdData] = useState([]);
  const [machineData, setMachineData] = useState([]);
  const [cewVersion, setCewVersion] = useState ('');


  function getClass(str) {
    if (str && str.length >= 31) {
      const code = str.slice(27, 31);
      if (code === "0001") {
        return "green";
      } else if (code === "0002") {
        return "red";
      } else if (code === "0003") {
        return "blue";
      }
    }
    return "";
  }
  
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setFileName(file.name);
    const reader = new FileReader();
  
    if (file.size > 6 * 1024 * 1024) {
      alert('File size is too large. Please select a file under 6 MB');
      event.target.value = null;
      return;
    }
  
    reader.onload = () => {
  const lines = reader.result.split('\n');
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
    const userId = matches[1].replace('@corp.bankofamerica.com', ''); // Remove "@corp.bankofamerica" from the User ID
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


  // Extract module names from file and populate dropdown
const moduleNameDropdown = document.getElementById('module-name-dropdown');
if (moduleNameDropdown) {
  let moduleNames = ['All'];
  const moduleNameRegex = /\[([^\[\]]*?[\w-]+[^\[\]]*?)\]/gi; // modified regex to include "-"
  const uniqueModuleNames = new Set();
  lines.forEach((line) => {
    const matches = line.match(moduleNameRegex);
    if (matches) {
      matches.forEach((match) => {
        const moduleName = match.slice(1, -1); // Remove brackets
        if (moduleName.indexOf('contentid') === -1) { // Check if moduleName doesn't contain "contentid"
          uniqueModuleNames.add(moduleName);
        }
      });
    }
  });
  moduleNames = ['All', ...Array.from(uniqueModuleNames).sort((a, b) => a.localeCompare(b, undefined, { ignorePunctuation: true, sensitivity: 'base' }))];
  moduleNameDropdown.innerHTML = '';
  moduleNames.forEach((moduleName) => {
    // Check if moduleName contains only letters, numbers, and "-"
    const regex = /^[a-zA-Z0-9-_]*$/;
    if (regex.test(moduleName)) {
      const option = document.createElement('option');
      option.value = moduleName;
      option.text = moduleName;
      moduleNameDropdown.appendChild(option);
    }
  });
  moduleNameDropdown.value = 'All';
}

      // Extract content IDs from file and populate dropdown
      const contentIds = new Set();
      const contentIdRegex = /contentid-([0-9a-z]+)/gi;
      lines.forEach((line) => {
        const matches = line.match(contentIdRegex);
        if (matches) {
          matches.forEach((match) => {
            const contentId = match.replace('contentid-', '');
            contentIds.add(contentId);
          });
        }
      });
      // Add "All" option to content ID dropdown and set it as the default value
      contentIds.add('All');
      const contentIdDropdown = document.getElementById('contentid-dropdown');
      if (contentIdDropdown) {
        contentIdDropdown.innerHTML = '';
          const optionAll = document.createElement('option');
          optionAll.value = 'All';
          optionAll.text = 'All';
          contentIdDropdown.appendChild(optionAll);
          contentIds.forEach((contentId) => {
      if (contentId !== 'All') {
        const option = document.createElement('option');
        option.value = contentId;
        option.text = contentId;
        contentIdDropdown.appendChild(option);
        }
      });
    contentIdDropdown.value = 'All';
      }
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
    setSelectedContentId('');
    setSelectedModuleName('');
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
  }
  

  const handleExport = () => {
    const filterInfo = `Filters:
    File name: ${fileName}
    File size: ${fileSize || 'none'} MB
    User ID: ${userIdData || 'none'}
    Machine: ${machineData || 'none'}
    Search term: ${searchTerm || 'none'}
    Log type: ${logType || 'none'}
    Content ID: ${selectedContentId || 'none'}
    Module name: ${selectedModuleName || 'none'}
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
  
      // Filter based on content ID
      if (selectedContentId && !item.includes(`contentid-${selectedContentId}`)) {
        return false;
      }
  
      // Filter based on module name
      if (selectedModuleName && !item.includes(`[${selectedModuleName}]`)) {
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

  const handleContentIdChange = (event) => {
    const value = event.target.value;
    setSelectedContentId(value === 'All' ? '' : value);
  };  

  const handleModuleNameChange = (event) => {
    const value = event.target.value;
    setSelectedModuleName(value === 'All' ? '' : value);
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
    // Filter based on selectedContentId
    if (selectedContentId && !item.includes(`contentid-${selectedContentId}`)) {
      return false;
    }
    // Filter based on selectedModuleName
    if (selectedModuleName && !item.includes(`[${selectedModuleName}]`)) {
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
        <div className='header'>
        <h1>Log Viewer</h1>
          <button className='header-link' onClick={handleAboutClick}>
            Top of Page
          </button>
          <button className='header-link' onClick={handleContactClick}>
            Bottom of Page
          </button>
    </div>
        <div>
          <label for="file-upload" class="custom-file-upload">Choose File</label>
          <input type="file" id='file-upload' onChange={handleFileUpload} /> 
        </div>
        <div className='file-name'>File Name: {fileName}</div>
        <div className='file-size'>File size: {fileSize} MB</div>
        <div className='userId'>
          <label>User ID:</label>
          {userIdData.map((userId, index) => (
          <strong key={index}>{`${index > 0 ? ', ' : ''}${userId}`}</strong>))}        
          </div>
          <div className='machine'>
          <label>Machine:</label>  
          {machineData.map((machineData, index) => (
          <strong key={index}>{`${index > 0 ? ', ' : ''}${machineData}`}</strong>))}      
          </div>
          <div className='cew-version'>
            <label>CEW Version: {cewVersion} </label>

          </div>
        <div>
          <br/>
          <label htmlFor="search-input" id='search-input'className='search-input'>Search:</label>
          <input type="text" id="search-input" value={searchTerm} onChange={handleSearchInput} />
          <button onClick={resetFilters}>Reset Filters</button>
        </div>
        <div>
          <button onClick={toggleSortOrder}>Currently Displaying {sortOrder === "newest" ? "Oldest - Newest" : "Newest - Oldest"}</button>
        </div>
        <div class='form-group'>
          <label htmlFor="log-types">Log Level:</label>
          <select id="log-types" value={logType} onChange={handleLogTypeChange}>
            <option value="">All</option>
            <option value="- Info:">Info</option>
            <option value="- Warn:">Warn</option>
            <option value="- Error:">Error</option>
          </select>
          <label htmlFor="contentid-dropdown">Content ID:</label>
          <select id="contentid-dropdown" value={selectedContentId} onChange={handleContentIdChange}>
          {/* options */}
          </select>
          <label for="module-name">Module Name:</label>
          <select id="module-name-dropdown" value={selectedModuleName} onChange={handleModuleNameChange}>
            {/* options */}
            </select>
        </div>
        <div>
          <label>Start Date and Time:</label>
            <input type="datetime-local" onChange={handleStartDateChange} />
          <label>End Date and Time:</label>
            <input type="datetime-local" onChange={handleEndDateChange} />
        </div>
        <div>
          <button onClick={handleExport}>Export</button>
        </div>
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
            <li key={index} className={getClass(parts[2])}>
              {display}
            </li>
          );
            })}
          </ul>
        <div id='bottom'>
        </div>
      </div>
    </Router>
  );    
}
export default App
