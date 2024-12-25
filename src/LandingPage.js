import React from 'react';
import './LandingPage.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();

    // Function to display toast notification
    const notify = (message) => {
        toast.success(message, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
        });
    };

    // Function to handle User role selection
    const handleUserClick = () => {
        notify("You selected: User");
        navigate('/register-did', { state: { role: 'User' } });
    };

    // Function to handle Moderator role selection
    const handleModeratorClick = () => {
        notify("You selected: Moderator");
        navigate('/register-did', { state: { role: 'Moderator' } });
    };

    return (
        <div className="landing-container">
            {/* Navigation Bar */}
            <nav className="navbar">
                <h1>Blockchain Based Exam Platform</h1>
            </nav>

            {/* ToastContainer for notifications */}
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />

            <div className="button-container">
                <div className="half-screen user-div">
                    <div className="user-inner">
                        {/* <div className="user-overlay" /> */}
                    </div>
                    <button className="button" onClick={handleUserClick}>
                        User
                    </button>
                </div>
                <div className="half-screen moderator-div">
                    <div className="moderator-inner">
                        {/* <div className="moderator-overlay" /> */}
                    </div>
                    <button className="button" onClick={handleModeratorClick}>
                        Moderator
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
