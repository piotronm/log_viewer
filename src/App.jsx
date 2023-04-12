import React, { useState } from 'react';
import "./App.css";
import Header from './Header';
import { BrowserRouter as Router} from 'react-router-dom';
import moment from 'moment-timezone';

function App() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [logType, setLogType] = useState('');
  const [fileSize, setFileSize] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedContentId, setSelectedContentId] = useState('');
  const [sortOrder, setSortOrder] = useState("newest");

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
    const reader = new FileReader();
  
    if (file.size > 6 * 1024 * 1024) {
      alert('File size is too large. Please select a file under 6 MB');
      event.target.value = null;
      return;
    }
  
    reader.onload = () => {
      const lines = reader.result.split('\n');
      const convertedData = lines.map(line => {
        const date = moment.utc(line.slice(0, 23)).tz(moment.tz.guess());
        const restOfLine = line.slice(24);
        const convertedDate = date.format('YYYY-MM-DD HH:mm:ss');
        return `${convertedDate} ${restOfLine}`;
      });
      setData(convertedData);
  
      // Extract content IDs from file and populate dropdown
      const contentIds = new Set();
      const contentIdRegex = /contentid-([^\s]+)/gi;
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
  
  
  
  const handleExport = () => {
    const filteredText = data.join('\n');
    const blob = new Blob([filteredText], {type: "text/plain;charset=utf-8"});
    const fileName = "filtered_data.txt";
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      // For IE browser
      window.navigator.msSaveOrOpenBlob(blob, fileName);
    } else {
      // For other browsers
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
    }
  }
  
  const handleSearchInput = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleLogTypeChange = (event) => {
    setLogType(event.target.value);
  };

  const handleContentIdChange = (event) => {
    setSelectedContentId(event.target.value);
  };

  const handleStartDateChange = (event) => {
    const selectedDate = event.target.value;
    const startDate = selectedDate ? new Date(selectedDate) : null;
    if (startDate) {
      const offset = -4; // EST is UTC-4
      const utcDate = new Date(startDate.getTime() + (startDate.getTimezoneOffset() * 60000));
      const estDate = new Date(utcDate.getTime() + (offset * 60 * 60 * 1000));
      setStartDate(estDate);
    } else {
      setStartDate(null);
    }
  };
  
  const handleEndDateChange = (event) => {
    const selectedDate = event.target.value;
    const endDate = selectedDate ? new Date(selectedDate) : null;
    if (endDate) {
      const offset = -4; // EST is UTC-4
      const utcDate = new Date(endDate.getTime() + (endDate.getTimezoneOffset() * 60000));
      const estDate = new Date(utcDate.getTime() + (offset * 60 * 60 * 1000));
      setEndDate(estDate);
    } else {
      setEndDate(null);
    }
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

    

  return (
    <Router>
      <div id='top'>
        <div className='header'>
          <Header/>
        </div>
          
        <div>
          <label for="file-upload" class="custom-file-upload">Choose File</label>
          <input type="file" id='file-upload' onChange={handleFileUpload} /> 
        </div>
        <div className='file-size'>
        <div>
          File size: {fileSize} MB
        </div>
        </div>
        <div>
          <br/>
          <label htmlFor="search-input" id='search-input'className='search-input'>Search:</label>
          <input type="text" id="search-input" value={searchTerm} onChange={handleSearchInput} />
        </div>
        <div>
          <button onClick={toggleSortOrder}>Currently Displaying {sortOrder === "newest" ? "Oldest - Newest" : "Newest - Oldest"}</button>
        </div>
        <div>
          <label htmlFor="log-types">Log Level:</label>
          <select id="log-types" value={logType} onChange={handleLogTypeChange}>
            <option value="">All</option>
            <option value="Info">Info</option>
            <option value="Warn">Warn</option>
            <option value="Error">Error</option>
          </select>
        </div>
        <div>
          <label htmlFor="contentid-dropdown">Content ID:</label>
          <select id="contentid-dropdown" value={selectedContentId} onChange={handleContentIdChange}>
          {/* options */}
          </select>
        </div>
        <div>
          <label htmlFor="start-date">Start Date:</label>
          <input type="date" id="start-date" onChange={handleStartDateChange} />
          <label htmlFor="end-date">End Date:</label>
          <input type="date" id="end-date" onChange={handleEndDateChange} />
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
