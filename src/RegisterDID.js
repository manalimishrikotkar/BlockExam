import React, { useState } from 'react';
import Web3 from 'web3';
import { EthrDID } from 'ethr-did';
import DIDRegistry from './contracts/DIDRegistry.json'; // ABI of deployed contract
import SignMessage from './SignMessage'; // Import SignMessage component
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import { useLocation } from 'react-router-dom';
import './RegisterDID.css';
import { useNavigate } from 'react-router-dom';


const RegisterDID = ({ }) => {
  const [account, setAccount] = useState(null);
  const [did, setDID] = useState('');
  const [status, setStatus] = useState('');
  const [showSignMessage, setShowSignMessage] = useState(false); // Track whether to show SignMessage
  const location = useLocation();
  const role = location.state?.role || 'User';
  const navigate = useNavigate();


  // Connect to MetaMask
  const connectWallet = async () => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.requestAccounts();
      setAccount(accounts[0]);
    } else {
      console.error("MetaMask not detected");
    }
  };

  const generateDID = async () => {
    if (!account) {
      setStatus('Please connect your wallet first');
      return;
    }

    const ethrDid = new EthrDID({ identifier: account });
    const newDid = ethrDid.did;
    setDID(newDid);

    const web3 = new Web3(window.ethereum || "http://localhost:7545");
    const contractAddress = "0x190CA243BEAE53292a60b87f9b12eac8D8a33A94"; // Replace with deployed contract address
    const contractABI = DIDRegistry.abi;
    const contract = new web3.eth.Contract(contractABI, contractAddress);

    try {

      const existingDid = await contract.methods.getDID(account).call();
      if (existingDid[0]) {
        setStatus(`DID already registered: ${existingDid[0]}`);
        // setShowSignMessage(true); // Show SignMessage even if DID already exists
        setTimeout(() => {
          setShowSignMessage(true);
          navigate('/sign-message',{ state: { userDID: did, role: role } }); // Show SignMessage component after 5 seconds
        }, 6000); 
        return;
      }

      await contract.methods.registerDID(newDid).send({ from: account });
      setStatus('DID registered successfully on the blockchain!');
      setShowSignMessage(true);
      
    } catch (error) {
      console.error('Error registering DID:', error);
      setStatus('Failed to register DID');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(did);
    alert("DID copied to clipboard!");
  };
  const handleGoToSignClick = () => {
    // notify("Going to exam form");
    navigate('/sign-message');
  };

  return (
    <div className="reg-container">
      {/* <div className="right-section"> */}
        <div className="right-content">
          {!showSignMessage ? (
            <>
              <p className="text">
                Get Yourself Register
              </p>
              <div className="form-container">
                
                {role==="Moderator" &&(
                <input className='reg-input' type='text' placeholder='Enter Institute Id'/>)}
                <button className='reg-button' onClick={connectWallet}>Connect MetaMask</button>

                {/* Conditionally render the Generate & Register DID button */}
                {account && (
                  <button className='reg-button' onClick={generateDID}>Generate & Register DID</button>
                )}

                <p className={`status ${account ? "status-success" : ""}`} style={{fontSize:15}}>
                  Status: {status}
                  <FontAwesomeIcon
                      icon={faCopy}
                      className="copy-icon"
                      onClick={copyToClipboard}
                      title="Copy DID"
                      style={{
                        cursor: "pointer",
                        fontSize: "18px", // Adjust size of the icon if needed
                      }}
                    />
                </p>
                <br/>
                {/* Display DID with copy functionality */}
                {did && (
                  <div
                    className="did-container"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center", // Center DID and copy icon horizontally
                      marginTop: "10px",
                    }}
                  >
                    {/* <p style={{  fontSize: "16px" }}>
                      Your DID: {did}
                    </p>{" "} */}
                    {/* DID text */}
                  
                  </div>
                 )}
              </div>
            </>
          ) : (
            
           <p>blasnnrfg</p>
              // <button className='sign-button' onClick={handleGoToSignClick}>
              //   Go to sign
              // </button>
  
           
            // <SignMessage userDID={did} role={role} /> // Render SignMessage component
          )}
        </div>
      </div>
    // </div>
  );
};

export default RegisterDID;
