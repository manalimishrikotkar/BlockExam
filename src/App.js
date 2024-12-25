// import React, { useState } from 'react';
// import './App.css';
// import LandingPage from './LandingPage'; 
// import RegisterDID from './RegisterDID'; 
// import SignMessage from './SignMessage'; // Import SignMessage

// function App() {
//   const [showRegisterDID, setShowRegisterDID] = useState(false); // State to toggle RegisterDID component
//   const [role, setRole] = useState(null); // State to hold user role

//   const handleButtonClick = () => {
//     setShowRegisterDID(true); // Show RegisterDID when a button is clicked
//   };

//   return (
//     <div>
//       {/* Show Landing Page, RegisterDID or SignMessage based on state */}
//       {!showRegisterDID ? (
//         <LandingPage onButtonClick={handleButtonClick} /> // Pass click handler to LandingPage
//       ) : role ? (
//         <SignMessage role={role} /> // Show SignMessage if role is set
//       ) : (
//         <RegisterDID setRole={setRole} /> // Pass setRole to RegisterDID
//       )}
//     </div>
//   );
// }

// export default App;
import React from 'react';
// import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Importing Router and Routes
import LandingPage from './LandingPage'; 
import RegisterDID from './RegisterDID'; 
import ExamResult from './ExamResult';
import SignMessage from './SignMessage'; // Import SignMessage
// import Home from './Home
import ExamForm from './ExamForm';
import Edit from './Edit';
// import View from './View';
import {ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Test from './Test';


function App() {
  return (
    // <ToastContainer />
    <Router>
      <ToastContainer />
      <div>
      <ToastContainer />
        <Routes>
          {/* Define routes for your components */}
          <Route path="/" element={<LandingPage />} /> 
          <Route path="/register-did" element={<RegisterDID />} /> 
          <Route path="/sign-message" element={<SignMessage />} /> 
          <Route path="/exam-form" element={<ExamForm />} />
          <Route path="/edit" element={<Edit/>} />
          <Route path="/test" element={<Test/>} /> 
          <Route path="/exam-result" element={<ExamResult />} />
        </Routes>
        <ToastContainer /> 
      </div>
    </Router>
  );
}

export default App;
