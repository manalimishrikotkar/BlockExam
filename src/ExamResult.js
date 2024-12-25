import React from 'react';
import { useLocation } from 'react-router-dom'; // Assuming you're using React Router for navigation
import Web3 from 'web3'; // Ensure Web3 is imported
import './ExamResult.css';
import checkedImage from './checked.png';
import cancelImage from './cancel.png';
const ExamResult = () => {
    const location = useLocation();
    const { answers, questions } = location.state || { answers: {}, questions: [] };

    // Debugging: Log the received answers and questions
    console.log('Received answers:', answers);
    console.log('Received questions:', questions);

    const calculateScore = () => {
        let score = 0;
        questions.forEach((question, index) => {
            const userSelectedOption = answers[index]; // User's selected option
            const correctHash = question.correctOptionHash; // Get the correct option hash from the question
            console.log(correctHash);
            // Generate the hash for the user's selected option
            console.log('User Selected Option1:', userSelectedOption);
            const userSelectedHash = hashOption(userSelectedOption);

            // Debugging: Log the hashes for comparison
            console.log(`Question ${index + 1}:`);
            console.log('User Selected Option:', userSelectedOption);
            console.log('User Selected Hash:', userSelectedHash);
            console.log('Correct Hash:', correctHash);

            // Compare the hashes
            if (userSelectedHash === correctHash) {
                score += 1;
                console.log(`Question ${index + 1} is correct. Current Score: ${score}`);
            } else {
                console.log(`Question ${index + 1} is incorrect.`);
            }
        });
        return score;
    };

    const score = calculateScore();
    const totalQuestions = questions.length;

    // Debugging: Log the final score
    console.log(`Final Score: ${score} out of ${totalQuestions}`);

    return (
        <div className="ExamResult-container">
            <div className='ri'>
            <h2>Exam Results</h2>
            <p>Your score: {score} / {totalQuestions}</p>
            {score / totalQuestions >= 0.5 ? (
                <>
                <p>Congratulations! You passed the exam.</p>
                <img src={checkedImage} alt="Passed" className="result-image" />                </>
            ) : (
                <>
                <p>Sorry, you did not pass. Better luck next time!</p>
                <img src={cancelImage} alt="Failed" className="result-image"  />
                </>
            )}
        </div>
        </div>
    );
};
// console.log("hashvalueforC",Web3.utils.soliditySha3({ type: 'string', value: 'C' }));
// console.log("hashvalueforA",Web3.utils.soliditySha3({ type: 'string', value: 'A' }));
// console.log("hashvalueforB",Web3.utils.soliditySha3({ type: 'string', value: 'B' }));
// console.log("hashvalueforD",Web3.utils.soliditySha3({ type: 'string', value: 'D ' }));
// Hashing function to create the hash of the selected option
const hashOption = (selectedOption) => {
    console.log("selectopt",selectedOption);
    // Clean the selected option to ensure no extra spaces or formatting
    const correctOptionCleaned = selectedOption.trim(); // Clean the option
    // Generate the hash using Web3's soliditySha3 method
    const correctOptHash = Web3.utils.soliditySha3({ type: 'string', value: correctOptionCleaned });
    // Debugging: Log the generated hash
    console.log('Generated Hash for Selected Option:', correctOptHash);

    // Return the generated hash
    return correctOptHash;
};

export default ExamResult;
