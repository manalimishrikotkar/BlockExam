import Web3 from 'web3';
import ExamContract from './contracts/ExamContract.json';
import axios from 'axios';
import seedrandom from 'seedrandom';
import LighthouseSDK from '@lighthouse-web3/sdk';
// import { getInvalidCIDs } from './Edit';
import { saveInvalidCID, getInvalidCIDs, initDB } from './db';

const invalidCIDs = getInvalidCIDs(); // Retrieve the array of invalid CIDs
const web3 = new Web3(Web3.givenProvider || "http://localhost:7545");
const contractAddress = '0x91dc760375333AD12C8Fe42343284c70A553cCDD';
const contractABI = ExamContract.abi;
const contract = new web3.eth.Contract(contractABI, contractAddress);
const lighthouseGatewayURL = 'https://gateway.lighthouse.storage/ipfs/';


 console.log("Invalid CIDs:", invalidCIDs);
// Fetch the latest block hash for randomness
const getBlockHashSeed = async () => {
    try {
        const latestBlock = await web3.eth.getBlock('latest');
        return latestBlock.hash;
    } catch (error) {
        console.error('Error fetching block hash:', error);
        throw new Error('Unable to fetch block hash for randomization.');
    }
};
// const fetchInvalidCIDs = async () => {
//     try {
//         // Fetch invalid CIDs from the blockchain
//         const invalidCIDsFromContract = await contract.methods.getInvalidCIDs().call();
//         console.log("Fetched invalid CIDs:", invalidCIDsFromContract);
//         return invalidCIDsFromContract;
//     } catch (error) {
//         console.error("Error fetching invalid CIDs from the contract:", error);
//         return [];
//     }
// };
const fetchInvalidCIDs = async (contract) => {
    try {
        // Fetch invalid CIDs from the blockchain
        const invalidCIDsFromContract = await contract.methods.getInvalidCIDs().call();
        console.log("Fetched invalid CIDs from blockchain:", invalidCIDsFromContract);

        // Sync invalid CIDs with IndexedDB
        for (const cid of invalidCIDsFromContract) {
            await saveInvalidCID(cid); // Save each CID to IndexedDB
        }

        return invalidCIDsFromContract;
    } catch (error) {
        console.error("Error fetching invalid CIDs from the contract:", error);
        console.log("Falling back to locally cached CIDs...");
        return await getInvalidCIDs(); // Fallback to locally cached CIDs
    }
};

//Fetch question data from IPFS using Lighthouse CID
// const fetchQuestionData = async (cid) => {
//     if (!cid) {
//         console.warn("No CID found for question.");
//         return null;
//     }
//     const invalidCIDs = await fetchInvalidCIDs();
//     if (invalidCIDs.includes(cid)) {
//         console.warn(`Skipping invalid CID: ${cid}`);
//         return null; // Skip processing for this CID
//     }
//     console.log("Fetching question data for CID:", cid);
//     try {
//         const response = await axios.get(`${lighthouseGatewayURL}${cid}`);
//         console.log("Fetched data from IPFS:", response.data);
//         return response.data;
//     } catch (error) {
//         console.error('Error fetching question data from Lighthouse IPFS:', error);
//         return null;
//     }
// };
const fetchQuestionData = async (cid) => {
    if (!cid) {
        console.warn("No CID provided for question.");
        return null;
    }

    // Load cached invalid CIDs
    const invalidCIDs = await getInvalidCIDs();

    // Check if the CID is invalid
    if (invalidCIDs.includes(cid)) {
        console.warn(`Skipping invalid CID: ${cid}`);
        return null;
    }

    console.log("Fetching question data for CID:", cid);

    try {
        const response = await axios.get(`${lighthouseGatewayURL}${cid}`);
        console.log("Fetched data from IPFS:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching question data from Lighthouse IPFS:", error);

        // Cache this CID as invalid
        console.warn(`Caching invalid CID: ${cid}`);
        await saveInvalidCID(cid);
        return null;
    }
};



async function addQuestionAndCheckSetters() {
    const accounts = await web3.eth.getAccounts();
    
    // Sample question data
    const questionData = {
        _questionText: "What is the capital of France?",
        _difficultyLevel: 1,
        _optionA: "Paris",
        _optionB: "Berlin",
        _optionC: "Madrid",
        _optionD: "Rome",
        _correctOptionHash: web3.utils.keccak256("A"), // Hash for correct answer
        _lighthouseCID: "exampleCID", // Example CID
    };

    for (const account of accounts) {
        const man = await contract.methods.addQuestion(
            questionData._questionText,
            questionData._difficultyLevel,
            questionData._optionA,
            questionData._optionB,
            questionData._optionC,
            questionData._optionD,
            questionData._correctOptionHash,
            questionData._lighthouseCID
        ).estimateGas({ from: account });
        console.log("Transaction receipt:", man);
        // Check the setters after each addition
        const setters = await contract.methods.getSetters().call();
        console.log("Current Setters:", setters);
    }
}
    console.log("Current1");
    //addQuestionAndCheckSetters();
    console.log("Current2");
const getQuestionsFromBlockchain = async () => {
    try {

        const accounts = await web3.eth.getAccounts(); // Retrieve accounts
        console.log("acc=",accounts);
        const account = accounts[1];
        // Fetching all question setters from the contract
        const setters = await contract.methods.getSetters().call();
        console.log("Fetched Setters:", setters);

        let allQuestions = [];
        const addedQuestions = await contract.methods.getAllQuestionsForSetter(account).call();
        console.log("Added Questions:", addedQuestions);
        // Looping through each setter to get their questions
        for (let setter of setters) {
            console.log(`Fetching questions for setter: ${setter}`);
            const questionCount = await contract.methods.getQuestionCount(setter).call();
            console.log(`Setter ${setter} has ${questionCount} questions.`);

            for (let i = 0; i < questionCount; i++) {
                try {
                    const question = await contract.methods.getQuestionByIndex(setter, i).call();
                    console.log(`Fetched question at index ${i} for setter ${setter}:`, question);

                    if (question && question.lighthouseCID) {
                        allQuestions.push(question);
                        console.log(`Added question to list:`, question);
                    } else {
                        console.warn(`Question at index ${i} for setter ${setter} does not have a valid lighthouseCID.`);
                    }
                } catch (innerError) {
                    console.error(`Error fetching question at index ${i} for setter ${setter}:`, innerError);
                }
            }
        }

        console.log(`Total questions fetched: ${allQuestions.length}`);
        return allQuestions;

    } catch (error) {
        console.error("Error fetching questions from blockchain:", error);
        throw new Error("Unable to fetch questions from the blockchain.");
    }
};

// Random selection function
const randomSelection = (questions, seed, count) => {
    let selectedQuestions = [];
    let randomizer = seedrandom(seed);
    for (let i = 0; i < count; i++) {
        if (questions.length === 0) break;
        const randomIndex = Math.floor(randomizer() * questions.length);
        selectedQuestions.push(questions[randomIndex]);
        questions.splice(randomIndex, 1);
    }
    console.log(`Selected ${selectedQuestions.length} questions from the pool.`);
    return selectedQuestions;
};

//Main function to select and prepare questions
export const selectQuestions = async () => {
    try {
        const blockHashSeed = await getBlockHashSeed();
        const questions = await getQuestionsFromBlockchain();
       
        let difficultyLevel1 = [];
        let difficultyLevel2 = [];
        let difficultyLevel3 = [];

        for (let question of questions) {
            switch (Number(question.difficultyLevel)) {
                case 1:
                    difficultyLevel1.push(question);
                    break;
                case 2:
                    difficultyLevel2.push(question);
                    break;
                case 3:
                    difficultyLevel3.push(question);
                    break;
                default:
                    console.warn(`Unknown difficulty level for question: ${question.difficultyLevel}`);
            }
        }

        const selectedLevel1 = randomSelection(difficultyLevel1, blockHashSeed, Math.min(3, difficultyLevel1.length));
        const selectedLevel2 = randomSelection(difficultyLevel2, blockHashSeed, Math.min(3, difficultyLevel2.length));
        const selectedLevel3 = randomSelection(difficultyLevel3, blockHashSeed, Math.min(3, difficultyLevel3.length));

        const selectedQuestions = [...selectedLevel1, ...selectedLevel2, ...selectedLevel3];
        let questionSet = [];
        
        // Fetch data for each selected question
        console.log("Selected Questions before fetching data:", selectedQuestions);
        const fetchPromises = selectedQuestions.map(async (selected) => {
            if (!selected.lighthouseCID) {
                console.warn("Skipping question with missing CID:", selected);
                return null; // Skip this question if no CID is available
            }

            try {
                console.log("Fetching data for CID:", selected.lighthouseCID);
                const questionData = await fetchQuestionData(selected.lighthouseCID);
                console.log(questionData);
                console.log(questionData.question);
                console.log(questionData.options[0]);
                if (questionData) {
                    return {
                        question: questionData.question || "Default question text",
                        options: {
                            A: questionData.options[0] || "Default option A",
                            B: questionData.options[1] || "Default option B",
                            C: questionData.options[2] || "Default option C",
                            D: questionData.options[3] || "Default option D",
                        },
                        correctOptionHash: questionData.correctOptionHash || "Default hash",
                        difficultyLevel: Number(selected.difficultyLevel) || 1,
                        cid: selected.lighthouseCID
                    };
                } else {
                    console.warn("No data returned for CID:", selected.lighthouseCID);
                    return null; // Return null if no data was fetched
                }
            } catch (error) {
                console.error("Error fetching question data:", error);
                return null; // Return null on error
            }
        });

        // Wait for all fetch promises to resolve
        const results = await Promise.all(fetchPromises);
        
        // Filter out any null results (errors or missing data)
        questionSet = results.filter(q => q !== null);

        // Log final selection count
        console.log("Final Selected Question Set:", questionSet);

        // Validate the types of the questions
        if (Array.isArray(questionSet)) {
            questionSet.forEach(question => {
                // Check types for each question
                if (typeof question.question !== 'string') {
                    console.error('Invalid questionText type');
                }
                
                if (typeof question.difficultyLevel !== 'number' || question.difficultyLevel < 0) {
                    console.error('Invalid difficultyLevel type or value');
                }

                if (typeof question.options.A !== 'string' || typeof question.options.B !== 'string' ||
                    typeof question.options.C !== 'string' || typeof question.options.D !== 'string') {
                    console.error('Invalid option type');
                }
            });
        } else {
            console.error('Expected an array but got:', questionSet);
        }

        return questionSet;

    } catch (error) {
        console.error('Error in selecting questions:', error);
        throw new Error('Unable to select questions.');
    }
};





export default selectQuestions;
