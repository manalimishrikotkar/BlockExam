const DIDRegistry = artifacts.require("DIDRegistry");
const ExamContract = artifacts.require("ExamContract");

module.exports = function(deployer) {
    deployer.deploy(DIDRegistry);
    deployer.deploy(ExamContract);
};
