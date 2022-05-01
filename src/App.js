import React, { Component } from "react";
import "./App.css"
export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            input: localStorage.getItem('input'),
            output: "",
            language_id:localStorage.getItem('language_Id'),
            user_input: "",
        };
    }

    input = (event) => {
        event.preventDefault();
        this.setState({ input: event.target.value });
        localStorage.setItem('input', event.target.value)
    };

    userInput = (event) => {
        event.preventDefault();
        this.setState({ user_input: event.target.value });
    };

    language = (event) => {
        // console.log(event.target.value)
        event.preventDefault();
        this.setState({ language_id: event.target.value });
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
                    "x-rapidapi-key": "74bf99fc21msh2b4ff766e24ca83p1c722cjsn261aedcec40b", 
                    'content-type': 'application/json',
                    'Content-Type': 'application/json',
                    accept: "application/json",
                },
                body: JSON.stringify({
                    source_code: this.state.input,
                    stdin: this.state.user_input,
                    language_id: this.state.language_id,
                }),
            }
        );

        outputText.innerHTML += "Submitted...\n";
        const jsonResponse = await response.json();

        let jsonGetSolution = {
            status: { description: "Queue" },
            stderr: null,
            compile_output: null,
        };

        while (
            jsonGetSolution.status.description !== "Accepted" &&
            jsonGetSolution.stderr == null &&
            jsonGetSolution.compile_output == null
        ){
            outputText.innerHTML = `Creating Submission ... \nSubmission Created ...\nChecking Submission Status\nstatus : ${jsonGetSolution.status.description}`;
            if (jsonResponse.token) {
                console.log("GET")
                let url = `https://judge0-ce.p.rapidapi.com/submissions/${jsonResponse.token}?base64_encoded=true&fields=*`
                const getSolution = await fetch(url, {
                    method: "GET",
                    headers: {
                        "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
                        "x-rapidapi-key": "74bf99fc21msh2b4ff766e24ca83p1c722cjsn261aedcec40b", 
                        // "content-type": "application/json",
                    },
                });
                jsonGetSolution = await getSolution.json();
            }
        }
        if(jsonGetSolution.stdout){
            const output = atob(jsonGetSolution.stdout);
            outputText.innerHTML = "";
            outputText.innerHTML += `Results :\n${output}\nExecution Time : ${jsonGetSolution.time} Secs\nMemory used : ${jsonGetSolution.memory} bytes`;

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
                    <span className="heading">
                        Online Code Editor
                    </span>
                    <span className="language">
                        <label htmlFor="tags" className="lang"><b>Language:</b></label>
                        <select value={this.state.language_id} onChange={this.language} id="tags">
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
                        <textarea id="codeTextArea" required name="solution" className="source" onChange={this.input} 
                            value={this.state.input} placeholder = "Write Your Code Here">
                        </textarea>
                    </div>

                    <div className='rightSide'>
                        <p className='sideTitle out'>Output</p>
                        <textarea id="output"></textarea>
                        <p className='sideTitle inp'>Input</p>
                        <textarea id="userInput" onChange={this.userInput}></textarea>
                    </div>

                </div>

            </div>
        );
    }
}
