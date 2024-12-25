import React, { useState } from 'react';
import ExamForm from './ExamForm';
import Web3 from 'web3';
import ExamContract from './contracts/ExamContract.json';
import { saveInvalidCID } from "./db";
import { useNavigate } from 'react-router-dom';
import './Edit.css';

let invalidCIDsArray = []; // Array to hold invalid CIDs


const InvalidCIDsInput = () => {
    const navigate = useNavigate();
    const [inputCID, setInputCID] = useState(''); // For the current CID input
    const [invalidCIDs, setInvalidCIDs] = useState([]); // To manage and display the list of invalid CIDs
    const handleSubmit = async () => {
        const web3 = new Web3(Web3.givenProvider || "http://localhost:7545");
        const contractAddress = "0x91dc760375333AD12C8Fe42343284c70A553cCDD";
        const contractABI = ExamContract.abi;
        const contract = new web3.eth.Contract(contractABI, contractAddress);
        const accounts = await web3.eth.getAccounts();
        const account = accounts[1];

        try {
            const gasEstimate = await contract.methods.addInvalidCID(inputCID.trim()).estimateGas({ from: account });
            await contract.methods.addInvalidCID(inputCID.trim()).send({ from: account, gas: gasEstimate });

            await saveInvalidCID(inputCID.trim()); // Save CID locally in IndexedDB
            setInvalidCIDs((prev) => [...prev, inputCID.trim()]); // Update state to re-render
            setInputCID(""); // Clear the input field
            alert("CID added successfully!");
        } catch (error) {
            console.error("Error adding CID to the contract:", error);
            alert("Failed to add CID to the contract. Please try again.");
        }
    };
    // Function to handle CID submission
    // const handleSubmit = async () => {
    //     const web3 = new Web3(Web3.givenProvider || "http://localhost:7545");
    //     const contractAddress = '0x2Ac67E63B3bAbeAA6622C37B527779e17cbFc98e';
    //     const contractABI = ExamContract.abi;
    //     const contract = new web3.eth.Contract(contractABI, contractAddress);
    //     const accounts = await web3.eth.getAccounts();
    //     const account = accounts[1];
    //     try {
    //         const InvalidCIDs = (cids) => {
    //             localStorage.setItem("invalidCIDs", JSON.stringify(cids));
    //         };
    //         const gasEstimate = await contract.methods.addInvalidCID(inputCID.trim()).estimateGas({ from: account });
    //         invalidCIDsArray.push(inputCID.trim()); // Add the CID to the exported array
    //         setInvalidCIDs([...invalidCIDsArray]); // Update state to re-render the list
    //         setInputCID(''); // Clear the input field
    //         alert("CID added successfully!");
    //     }
    //     catch(error){
    //         console.error("Error adding CID to the contract:", error);
    //         alert("Failed to add CID to the contract. Please try again.");
    //     }
        
        // let adjustedGasEstimate;
        // try {
        //   const gasEstimate = await contract.methods.addQuestion(
        //     questionData.question,
        //     questionData.difficultyLevel,
        //     optionA,
        //     optionB,
        //     optionC,
        //     optionD,
        //     correctOptionHash,
        //     lighthouseCID
        //   ).estimateGas({ from: account });

        //   adjustedGasEstimate = Number(gasEstimate) + 50000;
        //   console.log("Estimated Gas:", adjustedGasEstimate);
        // } catch (error) {
        //   console.error("Error estimating gas:", error);
        //   setStatus('Failed to estimate gas for adding question.');
        //   return;
        // }

       
    // };
    const handleGoToFormClick = () => {
        // notify("Going to exam form");
        navigate('/exam-form');
      };

    return (
        <div className='edit-container' >
            <div className="card">
            <h2>Enter Invalid CIDs</h2>
            <input  className='edit-i' type='text'
                value={inputCID}
                onChange={(e) => setInputCID(e.target.value)}
                placeholder="Enter CID here"
                rows="4"
                cols="50"
                
            />
            <br />
            <button  className='edit-b' onClick={handleSubmit} style={{ marginTop: '10px' }}>
                Submit CID
            </button>
            <h3>Invalid CIDs List:</h3>
            <ul>
                {invalidCIDs.map((cid, index) => (
                    <li key={index}>{cid}</li>
                ))}
            </ul>
            <button  className='edit-b' onClick={handleGoToFormClick} style={{ marginTop: '10px' }}>
                Add diff question
            </button>
            </div>
        </div>
    );
};

// Exporting the array of invalid CIDs for use in other files
export const getInvalidCIDs = () => invalidCIDsArray;

export default InvalidCIDsInput;
