// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ExamContract {
    struct Question {
        string questionText;
        uint8 difficultyLevel; // 1 = Easy, 2 = Medium, 3 = Hard
        string optionA;
        string optionB;
        string optionC;
        string optionD;
        bytes32 correctOptionHash;
        string lighthouseCID;  // CID field directly within the Question struct
    }

    mapping(address => Question[]) public setterQuestions;
    mapping(address => bool) private isSetterMap;
    address[] public setters;
     string[] private invalidCIDs;

    event QuestionAdded(address indexed setter, string questionText, uint8 difficultyLevel);
    event CIDAdded(address indexed setter, string lighthouseCID);
    event CIDMarkedInvalid(string invalidCID);

    // Function to add a question with associated Lighthouse CID
    function addQuestion(
        string memory _questionText,
        uint8 _difficultyLevel,
        string memory _optionA,
        string memory _optionB,
        string memory _optionC,
        string memory _optionD,
        bytes32 _correctOptionHash,
        string memory _lighthouseCID
    ) public {
        Question memory newQuestion = Question({
            questionText: _questionText,
            difficultyLevel: _difficultyLevel,
            optionA: _optionA,
            optionB: _optionB,
            optionC: _optionC,
            optionD: _optionD,
            correctOptionHash: _correctOptionHash,
            lighthouseCID: _lighthouseCID  // Assign CID directly within the struct
        });

        setterQuestions[msg.sender].push(newQuestion);

        emit QuestionAdded(msg.sender, _questionText, _difficultyLevel);
        emit CIDAdded(msg.sender, _lighthouseCID);

        if (!isSetterMap[msg.sender]) {
            setters.push(msg.sender);
            isSetterMap[msg.sender] = true;
        }
    }

    // Function to get all questions for a setter
    function getAllQuestionsForSetter(address _setter) public view returns (Question[] memory) {
        return setterQuestions[_setter];
    }

    // Function to get the count of questions for a setter
function getQuestionCount(address _setter) public view returns (uint256) {
    return setterQuestions[_setter].length;
}

   function getQuestionByIndex(address _setter, uint256 index) public view returns (
    string memory questionText,
    uint8 difficultyLevel,
    string memory optionA,
    string memory optionB,
    string memory optionC,
    string memory optionD,
    bytes32 correctOptionHash,
    string memory lighthouseCID
) {
    require(index < setterQuestions[_setter].length, "Index out of bounds");
    Question memory question = setterQuestions[_setter][index];
    return (
        question.questionText,
        question.difficultyLevel,
        question.optionA,
        question.optionB,
        question.optionC,
        question.optionD,
        question.correctOptionHash,
        question.lighthouseCID
    );
}

    // Function to get list of all setters
    function getSetters() public view returns (address[] memory) {
        return setters;
    }

     // Function to add an invalid CID
    function addInvalidCID(string memory _invalidCID) public {
        invalidCIDs.push(_invalidCID);
        emit CIDMarkedInvalid(_invalidCID);
    }

    // Function to get all invalid CIDs
    function getInvalidCIDs() public view returns (string[] memory) {
        return invalidCIDs;
    }

    
    // Optional: Paginated retrieval of questions for a setter
    function getQuestionsPaginated(address _setter, uint256 _start, uint256 _count) public view returns (Question[] memory) {
        uint256 end = _start + _count;
        if (end > setterQuestions[_setter].length) {
            end = setterQuestions[_setter].length;
        }
        Question[] memory questionsSubset = new Question[](end - _start);
        for (uint256 i = _start; i < end; i++) {
            questionsSubset[i - _start] = setterQuestions[_setter][i];
        }
        return questionsSubset;
    }

}
