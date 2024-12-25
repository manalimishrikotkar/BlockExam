import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faCopy } from '@fortawesome/free-solid-svg-icons';
import ExamForm from './ExamForm'; // Import the ExamForm component
import { selectQuestions } from './Random'; // Import the random selection function
import './SignMessage.css';
import Test from './Test';
import { useNavigate } from 'react-router-dom';
import Edit from './Edit';
import DIDRegistry from './contracts/DIDRegistry.json'; // ABI of deployed contract
import { useLocation } from 'react-router-dom';



const SignMessage = () => {
  const [account, setAccount] = useState('');
  const [message, setMessage] = useState('Authenticate me'); // The message to be signed
  const [signature, setSignature] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false); // State to track authentication status
  const [showExamForm, setShowExamForm] = useState(false); // State to track whether to show ExamForm
  const [questions, setQuestions] = useState([]); // State to store selected questions
  const [showTest, setShowTest] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { userDID, role } = location.state || {}; // Destructure state
  
  console.log('User DID:', userDID);
  console.log('Role:', role);
  

  const payFee = async () => {
    if (!account) {
      toast.error("Please connect your MetaMask wallet first.");
      return;
    }
    const web3 = new Web3(window.ethereum);
    const contractAddress = '0x190CA243BEAE53292a60b87f9b12eac8D8a33A94'; // Update with your contract address
    const contractABI = DIDRegistry.abi;
    const contract = new web3.eth.Contract(contractABI, contractAddress);

    try {
      const feeAmount = web3.utils.toWei('0.0001', 'ether'); // Example fee amount (0.01 ETH)
      const transaction = await contract.methods.payFee().send({
        from: account,
        value: feeAmount,
      });

      // Wait for the receipt
      const receipt = await web3.eth.getTransactionReceipt(transaction.transactionHash);

      if (!receipt) {
        throw new Error("Transaction receipt not found.");
      }

      return receipt;
    } catch (error) {
      toast.error("Payment failed");
    }
  };
  const [x, setX] = useState(false);
  const handleGoToTest = async () => {
    try {
      const receipt = await payFee(); // Await the payment and transaction receipt

      // Check if the transaction was confirmed
      if (receipt && receipt.status) {
        toast.success("Payment successful, you are getting redirected to Exam")
        setTimeout(() => setX(true), 3000);
        enterFullScreen(); // Enter fullscreen
        setShowTest(true); // Show the test
        navigate('/test',{state:{ questions: questions, role: role}});
      } else {
        // Handle failed transaction (status false or no receipt)
        toast.error("Transaction failed. Payment was not completed.");
      }
    } catch (error) {
      // Handle user canceling the transaction or other errors
      console.error("Payment error or canceled:", error);
      toast.error("Payment canceled or failed. Please try again.");
    }
  };

  const enterFullScreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) { // Firefox
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) { // Chrome, Safari, and Opera
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { // IE/Edge
      elem.msRequestFullscreen();
    }
  };

  // Restrict navigation keys and detect fullscreen exit
  const handleKeyEvents = (event) => {
    // Restrict Alt+Tab and F11
    if (event.key === 'F11' || (event.altKey && event.key === 'Tab')) {
      event.preventDefault();
      alert("Navigation is restricted during the test.");
    }

    // Detect Esc key press to exit fullscreen
    if (event.key === 'Escape') {
      handleDebarredUser();
    }
  };

  // Handle debarred user
  const handleDebarredUser = () => {
    alert("You have been debarred from the exam for exiting fullscreen.");
    setTimeout(() => {
      navigate('/'); // Redirect to the landing page
    }, 2000);
  };

  // Detect if the user exits fullscreen manually
  const checkFullscreenExit = () => {
    if (!document.fullscreenElement) {
      handleDebarredUser();
    }
  };

  useEffect(() => {
    if (showTest) {
      window.addEventListener('keydown', handleKeyEvents);
      document.addEventListener('fullscreenchange', checkFullscreenExit);
    } else {
      window.removeEventListener('keydown', handleKeyEvents);
      document.removeEventListener('fullscreenchange', checkFullscreenExit);
    }

    // Cleanup on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyEvents);
      document.removeEventListener('fullscreenchange', checkFullscreenExit);
    };
  }, [showTest]);
  // Automatically connect to MetaMask when the component mounts
  useEffect(() => {
    connectWallet();
  }, []);

  // Connect to MetaMask
  const connectWallet = async () => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      try {
        const accounts = await web3.eth.requestAccounts();
        setAccount(accounts[0]);
        // console.log(accounts[0]);
        toast.success("MetaMask connected successfully!");
      } catch (error) {
        console.error("User rejected MetaMask connection", error);
        toast.error("MetaMask connection was rejected.");
      }
    } else {
      console.error("MetaMask not detected");
      toast.error("MetaMask not detected. Please install MetaMask.");
    }
  };
  console.log(account);

  // Sign a message using the private key
  const signMessage = async () => {
    if (!account) {
      console.error("Account not connected");
      toast.error("Please connect your MetaMask wallet first.");
      return;
    }

    const web3 = new Web3(window.ethereum);
    try {
      const signedMessage = await web3.eth.personal.sign(message, account, '');
      setSignature(signedMessage);
      console.log('Signed Message:', signedMessage);

      // After signing, verify the signature
      await verifySignature(signedMessage, message, account);
    } catch (error) {
      console.error("Signing failed", error);
      toast.error("Message signing failed.");
    }
  };

  // Verify signed message
  const verifySignature = async (signedMessage, originalMessage, signerAddress) => {
    const web3 = new Web3(window.ethereum);
    try {
      const recoveredAddress = web3.eth.accounts.recover(originalMessage, signedMessage);
      console.log('Recovered Address:', recoveredAddress);

      if (recoveredAddress.toLowerCase() === signerAddress.toLowerCase()) {
        setVerificationStatus('User authenticated successfully');
        toast.success('User authenticated successfully!');
        setIsAuthenticated(true);
        console.log("Calling selectQuestions1...");
        console.log("User role:", role);
        // Fetch questions only if the user is a student
        if (role === 'User') {
          console.log("Calling selectQuestions...");
          const selectedQuestions = await selectQuestions();
          console.log('Selected Questions:', selectedQuestions);
          setQuestions(selectedQuestions);
        }
      } else {
        console.log('hello');
        setVerificationStatus('Authentication failed');
        toast.error('Authentication failed');
      }
    } catch (error) {
      console.error("Verification failed", error);
      setVerificationStatus('Verification failed');
      toast.error('Verification failed');
    }
  };

  // Copy the signed message to clipboard
  const copyToClipboard = () => {
    if (signature) {
      navigator.clipboard.writeText(signature)
        .then(() => toast.success("Signed message copied to clipboard!"))
        .catch(() => toast.error("Failed to copy the signed message."));
    } else {
      toast.warn("No signed message to copy.");
    }
  };

  console.log(questions);
  const handleGoToFormClick = () => {
    // notify("Going to exam form");
    navigate('/exam-form');
  };
  const handleEditClick = () => {
    // notify("Going to exam form");
    navigate('/edit');
  };

  return (
    <div className="signouter-container" >
      <div className="signinner-container" >
        <div className="signheader-container" >
      {!showExamForm && !showTest && !showEdit ? (
        <>
          <h2 style={{ color: 'Black',fontSize:30 }}>Sign Message for Authentication</h2>
          <button className='sign-button' onClick={signMessage} >Sign Message</button>

          {signature && (
            <div className="signed-message-container">
              <p className='sign-p' style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',fontSize:20,color:'black' }}>
                {verificationStatus}
                <FontAwesomeIcon
                  icon={faCheck}
                  style={{
                    marginLeft: '8px',
                    cursor: 'pointer',
                    color: 'green',
                    height: '30px',
                    width: '30px',
                  }}
                  title="Verified"
                />
              </p>

            </div>
            
          )}
          {/* <div className='img'></div> */}
          {/* <image src="checked.png"/> */}
          {/* <p >{verificationStatus}</p> */}

          {isAuthenticated && role === 'Moderator' && (
            <button className='sign-button' onClick={handleGoToFormClick}>
              Go to Exam Form
            </button>

          )}
          {isAuthenticated && role === 'Moderator' && (
            <button className='sign-button' onClick={handleEditClick}>
              Edit Incorrect Question
            </button>
          )}
          {isAuthenticated && role === 'User' && (
            <button className='sign-button' onClick={handleGoToTest}>
              Pay fee and Go to Test
            </button>
          )}
        </>
      )  : showEdit ? (
        <Edit />
      ) : (
        <ExamForm />
      )
      }
    </div>
    </div>
    </div>
  );
};

export default SignMessage;