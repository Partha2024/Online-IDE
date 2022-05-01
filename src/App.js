import React, { Component } from "react";
import "./App.css"

export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            langId:localStorage.getItem('language_Id'),
            input: localStorage.getItem('input'),
            output: "",
            userInput: "",
            userOutput: ""
        };
    }

    codeInput = (event) => {
        event.preventDefault();
        this.setState({ input: event.target.value });
        localStorage.setItem('input', event.target.value)
    };

    userInput = (event) => {
        event.preventDefault();
        this.setState({ userInput: event.target.value });
    };

    userOutput = (event) => {
        event.preventDefault();
        this.setState({ userOutput: event.target.value });
    };

    language = (event) => {
        event.preventDefault();
        this.setState({ langId: event.target.value });
        localStorage.setItem('language_Id',event.target.value)
    };

    submit = async (e) => {
        e.preventDefault();
        let outputText = document.getElementById("output");
        outputText.innerHTML = "";
        outputText.innerHTML += "Compiling...\n";
        console.log("POST")

        const response = await fetch(`https://judge0-ce.p.rapidapi.com/submissions`,
            {
                method: "POST",
                headers: {
                    "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
                    "x-rapidapi-key": "74bf99fc21msh2b4ff766e24ca83p1c722cjsn261aedcec40b", //Confidencial🔐
                    'content-type': 'application/json',
                    'Content-Type': 'application/json',
                    accept: "application/json",
                },
                body: JSON.stringify({
                    source_code: this.state.input,
                    stdin: this.state.userInput,
                    language_id: this.state.langId,
                }),
            }
        );

        outputText.innerHTML += "Submitted...\n";
        const jsonResponse = await response.json();

        let jsonGetSolution = {
            status: { description: "Please Wait" },
            stderr: null,
            compile_output: null,
        };

        while (
            jsonGetSolution.status.description !== "Accepted" &&
            jsonGetSolution.stderr == null &&
            jsonGetSolution.compile_output == null
        ){
            outputText.innerHTML = `Creating Submission ... \nSubmission Created ...\nChecking Submission Status \n${jsonGetSolution.status.description}`;
            if (jsonResponse.token) {
                console.log("GET")
                let url = `https://judge0-ce.p.rapidapi.com/submissions/${jsonResponse.token}?base64_encoded=true&fields=*`
                const getSolution = await fetch(url, {
                    method: "GET",
                    headers: {
                        "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
                        "x-rapidapi-key": "74bf99fc21msh2b4ff766e24ca83p1c722cjsn261aedcec40b", //Confidencial🔐
                    },
                });
                jsonGetSolution = await getSolution.json();
            }
        }

        if(jsonGetSolution.stdout){
            let result = "nAn";
            const uO = this.state.userOutput;
            const output = atob(jsonGetSolution.stdout);
            // eslint-disable-next-line
            if(output !== uO){
                console.log("output : " + output)
                console.log("uO : " + uO)
                console.log("typeof output : " + typeof output)
                console.log("typeof uO : "+typeof uO)

                result = "Wrong : Output Dosen't Matches With Expected Output";
            }else{
                result = "Correct : Output Matches With Expected Output ";
            }

            outputText.innerHTML = "";
            outputText.innerHTML += `Result :\n${output}\n\n\n\nExecution Time Taken : ${jsonGetSolution.time} Secs.\nMemory used : ${jsonGetSolution.memory} bytes \n\n${result}`;
        }else if(jsonGetSolution.stderr) {
            const error = atob(jsonGetSolution.stderr);
            outputText.innerHTML = "";
            outputText.innerHTML += `\n Error :${error}`;
        }else{
            const compilation_error = atob(jsonGetSolution.compile_output);
            outputText.innerHTML = "";
            outputText.innerHTML += `\n Error :${compilation_error}`;
        }
    };

    render() {
        return (
            <div id='main'>

                <div className="header">  
                    <span className="heading">Online Code Editor</span>
                    <span className="language">
                        <label htmlFor="tags" className="lang"><b>Language:</b></label>
                        <select value={this.state.langId} onChange={this.language} id="tags">
                            <option value="54">C++</option>
                            <option value="50">C</option>
                            <option value="62">Java</option>
                            <option value="71">Python</option>
                        </select>
                    </span>
                    <button type="submit" className="runBtn" onClick={this.submit}>Run</button>
                </div>

                <div className='sides'>
                    <div className='leftSide'>        
                        <p className='sideTitle ide'>Code</p> 
                        <textarea id="codeTextArea" required name="solution" onChange={this.codeInput} 
                            value={this.state.input} placeholder = "Write Your Code Here">
                        </textarea>
                    </div>

                    <div className='rightSide'>
                        <p className='sideTitle out'>Output</p>
                        <textarea id="output" readOnly></textarea>

                        <span id="titleSpan">
                            <p className='sideTitle inp'>Input</p>
                            <p className='sideTitle exOut'>Expected Output</p>
                        </span>

                        <div id="inputArea">
                            <textarea id="userInput" onChange={this.userInput}></textarea>
                            <textarea id="userOutput" onChange={this.userOutput}></textarea>
                        </div>
                        
                    </div>

                </div>
            </div>
        );
    }
}
