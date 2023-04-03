import React, { useState } from 'react';
import "./App.css";
import Header from './Header';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import About from './About';
import Contact from './Contact';

function App() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [logType, setLogType] = useState('');
  const [fileSize, setFileSize] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedContentId, setSelectedContentId] = useState('All');

  function getClass(logType) {
    switch (logType) {
      case 'info':
        return 'info';
      case 'warn':
        return 'warn';
      case 'error':
        return 'error';
      default:
        return '';
    }
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
      setData(lines);
  
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
            option.addEventListener('change', () => setSelectedContentId(contentId));
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
  
  
  

  const handleSearchInput = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleLogTypeChange = (event) => {
    setLogType(event.target.value);
  };

  const handleStartDateChange = (event) => {
    const startDate = event.target.value ? new Date(event.target.value) : null;
    setStartDate(startDate);
  };

  const handleEndDateChange = (event) => {
    const endDate = event.target.value ? new Date(event.target.value) : null;
    setEndDate(endDate);
  };

  const filteredData = data
  .filter((item) => {
    if (selectedContentId === 'All') {
      return true;
    } else {
      const contentIdRegex = new RegExp(`\\bcontentid-${selectedContentId}\\b`, 'i');
      return contentIdRegex.test(item);
    }
  })  
  .filter((item) => {
      if (logType === '') {
        return true;
      } else {
        return item.toLowerCase().includes(logType.toLowerCase());
      }
    })
    .filter((item) => {
      if (searchTerm === '') {
        return true;
      } else {
        return item.toLowerCase().includes(searchTerm.toLowerCase());
      }
    })
    .filter((item) => {
      if (startDate === null || endDate === null) {
        return true;
      } else {
        const timestamp = item.split(' ')[0];
        const date = new Date(timestamp);
        return date >= startDate && date <= endDate;
      }
    });
    

    return (
      <Router>
        <div>
          <div className='header'>
            <Header/>
            <Routes>
              <Route exact path="/" component={Home} />
              <Route path="/about" component={About} />
              <Route path="/contact" component={Contact} />
            </Routes>
          </div>
          <br/> <br/> <br/> <br/>
          <h1>File Upload and Sorting</h1>
          <div>
            <input type="file" onChange={handleFileUpload} /> 
          </div>
          {fileSize && (
          <div>
            File size: {fileSize} MB
          </div>
          )}
          <div>
            <br/>
            <label htmlFor="search-input">Search:</label>
            <input type="text" id="search-input" value={searchTerm} onChange={handleSearchInput} />
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
  <select id="contentid-dropdown"></select>
</div>

          <div>
            <label htmlFor="start-date">Start Date:</label>
            <input type="date" id="start-date" onChange={handleStartDateChange} />
            <label htmlFor="end-date">End Date:</label>
            <input type="date" id="end-date" onChange={handleEndDateChange} />
          </div>
          <ul>
            {filteredData.map((item, index) => {
              const parts = item.split(',');
              const display = searchTerm ? (
                <span>
                  {parts[0].replace(new RegExp(`(${searchTerm})`, 'gi'), '$1')} - {parts[1]}
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
          <div className='footer'>
          </div>
        </div>
      </Router>
    );    
}    

export default App