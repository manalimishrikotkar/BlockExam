import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import ExamResult from './ExamResult'; // Import your ExamResult component
import { useNavigate } from 'react-router-dom';
import './Test.css';
import { useLocation } from 'react-router-dom';

const Test = () => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(5 * 60); // 5 minutes in seconds
    const navigate = useNavigate();
    const location = useLocation();
    const { questions, role } = location.state || {}; 
    

    useEffect(() => {
        if (timeLeft > 0 && !isSubmitted) {
            const timer = setInterval(() => {
                setTimeLeft((prevTime) => prevTime - 1);
            }, 1000);

            // Clear the timer on component unmount or if the test is submitted
            return () => clearInterval(timer);
        } else if (timeLeft === 0) {
            handleSubmit(); // Auto-submit when time runs out
        }
    }, [timeLeft, isSubmitted]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    const handleOptionChange = (event) => {
        const { value } = event.target;
        setAnswers((prevAnswers) => ({
            ...prevAnswers,
            [currentQuestionIndex]: value,
        }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
        } else {
            toast.warn("You have reached the last question.");
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
        } else {
            toast.warn("You are at the first question.");
        }
    };

    const handleSubmit = () => {
        console.log("Submitted Answers:", answers);
        setIsSubmitted(true);
        toast.success("Your answers have been submitted!");
        navigate('/exam-result', { state: { answers: answers, questions: questions } });
    };

    console.log("answer", answers);
    console.log("question", questions);

    return (
        <div className="test-container">
            <div className="test-header">
            {isSubmitted ? (
                <ExamResult answers={answers} questions={questions} />
            ) : (
                <>
                    <h2>Exam Questions</h2>
                    <div className="timer-container">
                        <p className={`timer ${timeLeft <= 30 ? 'warning' : ''}`}>
                            Time Remaining: {formatTime(timeLeft)}
                        </p>
                    </div>
                    <p className="question-number">
                        Question {currentQuestionIndex + 1} of {questions.length}
                    </p>
                    <p className="question-text">{questions[currentQuestionIndex]?.question}</p>
                    <div className='option-label'>
                        {questions[currentQuestionIndex]?.options ? (
                            Object.entries(questions[currentQuestionIndex].options).map(([key, value], index) => (
                                <div key={index}>
                                    <input className='test-input'
                                        type="radio"
                                        id={`option${index}`}
                                        name={`question${currentQuestionIndex}`}
                                        value={value}
                                        checked={answers[currentQuestionIndex] === value}
                                        onChange={handleOptionChange}
                                    />
                                    <label htmlFor={`option${index}`}>{`${key}: ${value}`}</label>
                                </div>
                            ))
                        ) : (
                            <p>No options available for this question.</p>
                        )}
                    </div>
                    <div className="button-container-test">
                        <button className='test-b' onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
                            Previous
                        </button>
                        <button className='test-b' onClick={handleNext} disabled={currentQuestionIndex === questions.length - 1}>
                            Next
                        </button>
                        <button className='test-b' onClick={handleSubmit} disabled={Object.keys(answers).length < questions.length}>
                            Submit
                        </button>
                    </div>
                </>
            )}
        </div>
        </div>
    );
};

export default Test;
