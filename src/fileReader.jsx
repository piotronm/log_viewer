import React, { Component } from "react";

window.arrayList = '';

class fileReader extends Component {
    constructor (props) {
        super(props);
        this.state = {
            fileName: '',
            fileContent: '',
            fileSize: 0,
            displayArray: [],
            filterArray: [],
            value: '',
            handleInputChange: ''
        };
        this.handleInputChange = this.handleInputChange.bind(this);
    }
    handleFileChange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = () => {
            const fileArray = reader.result.split('\r\n');
            this.setState({fileName: file.name, fileContent: reader.result, fileSize: file.size, displayArray: fileArray});
        }
        reader.onerror = () => {
            console.error('File Error', reader.error);
        }
    }
    handleInputChange(event) {
        this.setState({value: event.target.value});
    }

    render() {
         const filteredArray = this.state.displayArray.filter(item => item.indexOf(this.state.value) >= 0);
        return(
            <div>
                <input 
                type="file"
                className="input-box"
                accept=".txt,.log,.docx"
                onChange={this.handleFileChange}>
                </input>
                <br></br>
                <h4 className="fileName">File Name: {this.state.fileName}</h4>
                <div className="fileSize">File Size: {this.state.fileSize} bytes</div>
                <br></br>
                
                <div className="file-display">
                    {filteredArray.map((item, index)=>
                    <div key={index}>{item}</div>)}
                </div>
            </div>
        );
    }
}

export default fileReader