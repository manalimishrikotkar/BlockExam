// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DIDRegistry {
    struct UserDID {
        string did;
        address publicKey;
        uint256 balance; // Balance of the user after payment
    }

    mapping(address => UserDID) public didRegistry;

    event DIDRegistered(address indexed user, string did);
    event FeePaid(address indexed user, uint256 amount);

    // Register a new DID
    function registerDID(string memory _did) public {
        require(bytes(didRegistry[msg.sender].did).length == 0, "DID already registered");
        didRegistry[msg.sender] = UserDID(_did, msg.sender, 0);
        emit DIDRegistered(msg.sender, _did);
    }

    // Pay fee
    function payFee() public payable {
        require(bytes(didRegistry[msg.sender].did).length != 0, "DID not registered");
        require(msg.value > 0, "Fee amount must be greater than zero");

        // Update the user's balance
        didRegistry[msg.sender].balance += msg.value;
        emit FeePaid(msg.sender, msg.value);
    }

    // Get DID and balance by user address
    function getDID(address _user) public view returns (string memory, address, uint256) {
        UserDID memory user = didRegistry[_user];
        return (user.did, user.publicKey, user.balance);
    }
}
