import React, { useState } from 'react';
import Web3 from 'web3';
import ExamContract from './contracts/ExamContract.json';
import lighthouse from '@lighthouse-web3/sdk';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import {ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ExamForm.css';

const apiKey = '0e483d3e.866aabb315f8492b8fabe87617ae0237';
// const apiKey='5c3cb7bd.155abfe3378746479dc8aaa9f1c32297';
const ExamForm = ({ userDID }) => {
  // toast.success("HII");
  const [question, setQuestion] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState(1);
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctOption, setCorrectOption] = useState('');
  const [status, setStatus] = useState('');
  const [hash,setHash] = useState('');
  const uploadToLighthouse = async (questionData) => {
    try {
      const blob = new Blob([JSON.stringify(questionData)], { type: 'application/json' });
      const file = new File([blob], 'questionData.json', { type: 'application/json' });

      console.log('File to upload:', file);

      const uploadResponse = await lighthouse.upload([file], apiKey);

      console.log('Full uploadResponse:', uploadResponse);
      //&& uploadResponse.data && uploadResponse.data.Hash
      if (uploadResponse && uploadResponse.data && uploadResponse.data.Hash) {
        setHash(uploadResponse.data.Hash);
        return uploadResponse.data.Hash;
      } else {
        console.error('No Hash returned in the response:', uploadResponse);
        return null;
      }
    } catch (error) {
      console.error('Error uploading to Lighthouse:', error);
      return null;
    }
  };
  const copyToClipboard = () => {
      navigator.clipboard.writeText(hash)
        .then(() =>{ toast.success("CID copied to clipboard!");
          console.log("copied");
        })
        .catch(() => toast.error("Failed to copy the CID."));
  };
  const submitQuestion = async () => {
    try {
      // Display the confirmation alert
      const confirmation = window.confirm(
        "Are you sure you want to submit this question? Please recheck all the details as changes cannot be made later."
      );

      if (confirmation) {
        // Proceed with submission
        setStatus("Submitting...");
        const web3 = new Web3(Web3.givenProvider || "http://localhost:7545");
        let correctOptionValue;
        switch (correctOption.trim().toUpperCase()) {
          case 'A':
            correctOptionValue = optionA;
            break;
          case 'B':
            correctOptionValue = optionB;
            break;
          case 'C':
            correctOptionValue = optionC;
            break;
          case 'D':
            correctOptionValue = optionD;
            break;
          default:
            setStatus('Please enter a valid correct option (A, B, C, or D).');
            return;
        }
        //const questionhash = Web3.utils.soliditySha3({ type: 'string', value: question.trim() });
        const correctOptionHash = Web3.utils.soliditySha3({ type: 'string', value: correctOptionValue.trim() });
        console.log(correctOptionValue.trim(), correctOptionValue);

        console.log('Correct Option Hashed:', correctOptionHash);

        const contractAddress = '0x91dc760375333AD12C8Fe42343284c70A553cCDD';
        const contractABI = ExamContract.abi;
        const contract = new web3.eth.Contract(contractABI, contractAddress);

        const accounts = await web3.eth.getAccounts();
        const account = accounts[1];

        if (![1, 2, 3].includes(Number(difficultyLevel))) {
          setStatus('Please select a valid difficulty level (1, 2, or 3).');
          return;
        }

        const questionData = {
          id: Date.now(),
          did: userDID,
          question: String(question),
          difficultyLevel: Number(difficultyLevel),
          options: [String(optionA), String(optionB), String(optionC), String(optionD)],
          correctOptionHash,
          timestamp: Date.now(),
        };

        const lighthouseCID = await uploadToLighthouse(questionData);
        if (!lighthouseCID) {
          setStatus('Failed to upload question data to Lighthouse.');
          return;
        }

        let adjustedGasEstimate;
        try {
          const gasEstimate = await contract.methods.addQuestion(
            questionData.question,
            questionData.difficultyLevel,
            optionA,
            optionB,
            optionC,
            optionD,
            correctOptionHash,
            lighthouseCID
          ).estimateGas({ from: account });

          adjustedGasEstimate = Number(gasEstimate) + 50000;
          console.log("Estimated Gas:", adjustedGasEstimate);
        } catch (error) {
          console.error("Error estimating gas:", error);
          setStatus('Failed to estimate gas for adding question.');
          return;
        }

        try {
          const tx = await contract.methods.addQuestion(
            questionData.question,
            questionData.difficultyLevel,
            optionA,
            optionB,
            optionC,
            optionD,
            correctOptionHash,
            lighthouseCID
          ).send({
            from: account,
            gas: adjustedGasEstimate,
            gasPrice: web3.utils.toWei('20', 'gwei')
          });

          console.log('Transaction successful:', tx);
          setStatus('Question added to the blockchain and stored in Lighthouse successfully!');

          // Reset form fields after successful submission
          setQuestion('');
          setDifficultyLevel(1);
          setOptionA('');
          setOptionB('');
          setOptionC('');
          setOptionD('');
          setCorrectOption('');

        } catch (error) {
          console.error('Error submitting the question:', error);
          setStatus('Failed to submit question.');
        }
      }
      else{
        setStatus("Submission canceled. Please review the question.");
      }
      

      // Simulate an API or blockchain call to submit the question
      // setTimeout(() => {
      //   setStatus("Question submitted successfully!");
      // }, 500);
      
    } 
    catch (error) {
      console.error('Error in submitQuestion:', error);
      setStatus('Failed to submit question.');
    }
    
  };

//   return (
//     <div>
//       <h2>Submit a New Question</h2>
//       <input type="text" placeholder="Question" value={question} onChange={e => setQuestion(e.target.value)} />
//       <input
//         type="number"
//         placeholder="Difficulty Level"
//         value={difficultyLevel}
//         onChange={e => setDifficultyLevel(Number(e.target.value))}
//       />
//       <input type="text" placeholder="Option A" value={optionA} onChange={e => setOptionA(e.target.value)} />
//       <input type="text" placeholder="Option B" value={optionB} onChange={e => setOptionB(e.target.value)} />
//       <input type="text" placeholder="Option C" value={optionC} onChange={e => setOptionC(e.target.value)} />
//       <input type="text" placeholder="Option D" value={optionD} onChange={e => setOptionD(e.target.value)} />
//       <input
//         type="text"
//         placeholder="Correct Option (A/B/C/D)"
//         value={correctOption}
//         onChange={e => setCorrectOption(e.target.value)}
//       />
//       <button onClick={submitQuestion}>Submit Question</button>
//       <p>Status: {status}</p>
//       <p>CID(Save this for later Editing):{hash}
     
//       <FontAwesomeIcon 
//                 icon={faCopy} 
//                 style={{ marginLeft: '8px', cursor: 'pointer' }} 
//                 onClick={copyToClipboard} 
//                 title="Copy to clipboard"
//               />
//       </p>
      
//     </div>
//   );
// };
return (
  <div className='examform-container'>
  <div className="question-form-container">
    <h2 className="form-title">Submit a New Question</h2>
    <input
      type="text"
      placeholder="Question"
      value={question}
      onChange={(e) => setQuestion(e.target.value)}
      className="form-input"
    />
    <input 
      type="number"
      placeholder="Difficulty Level"
      value={difficultyLevel}
      onChange={(e) => setDifficultyLevel(Number(e.target.value))}
      className="form-input"
    />
    <input
      type="text"
      placeholder="Option A"
      value={optionA}
      onChange={(e) => setOptionA(e.target.value)}
      className="form-input"
    />
    <input
      type="text"
      placeholder="Option B"
      value={optionB}
      onChange={(e) => setOptionB(e.target.value)}
      className="form-input"
    />
    <input
      type="text"
      placeholder="Option C"
      value={optionC}
      onChange={(e) => setOptionC(e.target.value)}
      className="form-input"
    />
    <input
      type="text"
      placeholder="Option D"
      value={optionD}
      onChange={(e) => setOptionD(e.target.value)}
      className="form-input"
    />
    <input
      type="text"
      placeholder="Correct Option (A/B/C/D)"
      value={correctOption}
      onChange={(e) => setCorrectOption(e.target.value)}
      className="form-input"
    />
    <button onClick={submitQuestion} className="form-button">
      Submit Question
    </button>
    <p className="status-text">Status: {status}</p>
    <p className="cid-text">
      CID (Save this for later Editing): {hash}
      <FontAwesomeIcon
        icon={faCopy}
        className="copy-icon"
        onClick={copyToClipboard}
        title="Copy to clipboard"
      />
    </p>
  </div>
  </div>
);
};

export default ExamForm;
