// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Voting {
    struct Candidate {
        uint256 id;
        string name;
        string party;
        string imageUrl;
        uint256 voteCount;
    }

    struct Voter {
        bool isAuthorized;
        bool hasVoted;
        uint256 votedCandidateId;
    }

    struct RegisteredUser {
        address userAddress;
        string username;
        bool isRegistered;
    }

    address public admin;
    mapping(address => Voter) public voters;
    mapping(address => RegisteredUser) public registeredUsers;
    Candidate[] public candidates;
    address[] public voterAddresses; // To keep track of all voters for admin view
    address[] public registeredUserAddresses; // To keep track of all registered users

    enum ElectionState { NotScheduled, Open, Closed }
    ElectionState public electionState;

    uint256 public maxCandidates;
    uint256 public maxVoters;
    uint256 public maxRegisteredUsers;
    uint256 public startTime;
    uint256 public endTime;
    string public adminEmail;
    string public adminPhone;

    event CandidateAdded(uint256 id, string name, string party);
    event VoterAuthorized(address voter);
    event VoteCasted(address voter, uint256 candidateId);
    event ElectionStateChanged(ElectionState newState);
    event UserRegistered(address userAddress, string username);
    event UserDeleted(address userAddress, string username);
    event ElectionTimesSet(uint256 startTime, uint256 endTime);
    event LimitsUpdated(uint256 maxCandidates, uint256 maxVoters, uint256 maxRegisteredUsers);
    event AdminContactUpdated(string email, string phone);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyDuringElection() {
        require(electionState == ElectionState.Open, "Election is not open");
        _;
    }

    constructor() {
        admin = msg.sender;
        electionState = ElectionState.NotScheduled;
        maxCandidates = 10; // Default limit, can be adjustable
        maxVoters = 100; // Default limit
        maxRegisteredUsers = 200; // Default registration limit
        adminEmail = "admin@trustchain.com"; // Default
        adminPhone = "+1234567890"; // Default
    }

    function setAdminContact(string memory _email, string memory _phone) external onlyAdmin {
        adminEmail = _email;
        adminPhone = _phone;
        emit AdminContactUpdated(_email, _phone);
    }

    function setLimits(uint256 _maxCandidates, uint256 _maxVoters, uint256 _maxRegisteredUsers) external onlyAdmin {
        maxCandidates = _maxCandidates;
        maxVoters = _maxVoters;
        maxRegisteredUsers = _maxRegisteredUsers;
        emit LimitsUpdated(_maxCandidates, _maxVoters, _maxRegisteredUsers);
    }

    function addCandidate(string memory _name, string memory _party, string memory _imageUrl) external onlyAdmin {
        require(candidates.length < maxCandidates, "Max candidates reached");
        require(electionState == ElectionState.NotScheduled, "Cannot add candidates during election");
        
        uint256 id = candidates.length;
        candidates.push(Candidate({
            id: id,
            name: _name,
            party: _party,
            imageUrl: _imageUrl,
            voteCount: 0
        }));

        emit CandidateAdded(id, _name, _party);
    }

    function authorizeVoter(address _voter) external onlyAdmin {
        require(voterAddresses.length < maxVoters, "Max voters reached");
        require(!voters[_voter].isAuthorized, "Voter already authorized");
        
        voters[_voter].isAuthorized = true;
        voterAddresses.push(_voter);
        
        emit VoterAuthorized(_voter);
    }

    function registerUser(string memory _username) external {
        require(!registeredUsers[msg.sender].isRegistered, "User already registered");
        require(bytes(_username).length > 0, "Username cannot be empty");
        
        registeredUsers[msg.sender] = RegisteredUser({
            userAddress: msg.sender,
            username: _username,
            isRegistered: true
        });
        registeredUserAddresses.push(msg.sender);
        
        emit UserRegistered(msg.sender, _username);
    }

    function deleteUser(address _userAddress) external onlyAdmin {
        require(registeredUsers[_userAddress].isRegistered, "User not registered");
        require(!voters[_userAddress].isAuthorized, "Cannot delete authorized voter");
        
        // Get username before deletion for event
        string memory username = registeredUsers[_userAddress].username;
        
        // Delete from mapping
        delete registeredUsers[_userAddress];
        
        // Remove from array
        for (uint256 i = 0; i < registeredUserAddresses.length; i++) {
            if (registeredUserAddresses[i] == _userAddress) {
                registeredUserAddresses[i] = registeredUserAddresses[registeredUserAddresses.length - 1];
                registeredUserAddresses.pop();
                break;
            }
        }
        
        emit UserDeleted(_userAddress, username);
    }

    function setElectionTimes(uint256 _startTime, uint256 _endTime) external onlyAdmin {
        require(electionState == ElectionState.NotScheduled, "Cannot set times after election started");
        require(_endTime > _startTime, "End time must be after start time");
        require(_startTime > block.timestamp, "Start time must be in the future");
        
        startTime = _startTime;
        endTime = _endTime;
        
        emit ElectionTimesSet(_startTime, _endTime);
    }

    function startElection() external onlyAdmin {
        require(electionState == ElectionState.NotScheduled, "Election already started or closed");
        require(startTime > 0 && endTime > 0, "Election times must be set first");
        electionState = ElectionState.Open;
        emit ElectionStateChanged(ElectionState.Open);
    }

    function endElection() external onlyAdmin {
        require(electionState == ElectionState.Open, "Election is not open");
        electionState = ElectionState.Closed;
        emit ElectionStateChanged(ElectionState.Closed);
    }

    function resetElection() external onlyAdmin {
        require(electionState == ElectionState.Closed, "Can only reset after election is closed");
        
        delete candidates;
        
        // Reset voters
        for (uint256 i = 0; i < voterAddresses.length; i++) {
            delete voters[voterAddresses[i]];
        }
        delete voterAddresses;
        
        // Reset registered users
        for (uint256 i = 0; i < registeredUserAddresses.length; i++) {
            delete registeredUsers[registeredUserAddresses[i]];
        }
        delete registeredUserAddresses;
        
        // Reset election times
        startTime = 0;
        endTime = 0;
        
        electionState = ElectionState.NotScheduled;
        emit ElectionStateChanged(ElectionState.NotScheduled);
    }

    function vote(uint256 _candidateId) external onlyDuringElection {
        require(voters[msg.sender].isAuthorized, "You are not authorized to vote");
        require(!voters[msg.sender].hasVoted, "You have already voted");
        require(_candidateId < candidates.length, "Invalid candidate ID");

        voters[msg.sender].hasVoted = true;
        voters[msg.sender].votedCandidateId = _candidateId;
        candidates[_candidateId].voteCount++;

        emit VoteCasted(msg.sender, _candidateId);
    }

    function getCandidates() external view returns (Candidate[] memory) {
        return candidates;
    }

    function getVoterStatus(address _voter) external view returns (bool isAuthorized, bool hasVoted) {
        return (voters[_voter].isAuthorized, voters[_voter].hasVoted);
    }

    function getAllVoters() external view returns (address[] memory) {
        return voterAddresses;
    }

    function getRegisteredUsers() external view returns (RegisteredUser[] memory) {
        RegisteredUser[] memory users = new RegisteredUser[](registeredUserAddresses.length);
        for (uint256 i = 0; i < registeredUserAddresses.length; i++) {
            users[i] = registeredUsers[registeredUserAddresses[i]];
        }
        return users;
    }

    function getElectionTimes() external view returns (uint256, uint256) {
        return (startTime, endTime);
    }

    function getUserInfo(address _user) external view returns (string memory username, bool isRegistered, bool isAuthorized, bool hasVoted) {
        return (
            registeredUsers[_user].username,
            registeredUsers[_user].isRegistered,
            voters[_user].isAuthorized,
            voters[_user].hasVoted
        );
    }
}
