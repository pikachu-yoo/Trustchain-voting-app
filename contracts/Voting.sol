// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Voting {
    struct Candidate {
        uint256 id;
        string name;
        string party;
        string imageUrl;
        string post;
        uint256 voteCount;
    }

    struct Voter {
        bool isAuthorized;
        mapping(string => bool) hasVotedByPost;
        mapping(string => uint256) votedCandidateIdByPost;
    }

    struct RegisteredUser {
        address userAddress;
        string username;
        bool isRegistered;
    }

    struct ElectionInfo {
        ElectionState state;
        uint256 startTime;
        uint256 endTime;
        bool exists;
    }

    address public admin;
    mapping(address => Voter) public voters;
    mapping(address => RegisteredUser) public registeredUsers;
    Candidate[] public candidates;
    address[] public voterAddresses;
    address[] public registeredUserAddresses;

    enum ElectionState { NotScheduled, Open, Closed }
    
    mapping(string => ElectionInfo) public elections;
    string[] public postList;

    uint256 public maxCandidates;
    uint256 public maxVoters;
    uint256 public maxRegisteredUsers;
    
    string public adminEmail;
    string public adminPhone;
    string public adminUsername;
    bytes32 private adminPasswordHash;

    event CandidateAdded(uint256 id, string name, string party, string post);
    event CandidateDeleted(uint256 id, string name, string post);
    event VoterAuthorized(address voter);
    event VoteCasted(address voter, uint256 candidateId, string post);
    event ElectionStateChanged(string post, ElectionState newState);
    event UserRegistered(address userAddress, string username);
    event UserDeleted(address userAddress, string username);
    event ElectionTimesSet(string post, uint256 startTime, uint256 endTime);
    event LimitsUpdated(uint256 maxCandidates, uint256 maxVoters, uint256 maxRegisteredUsers);
    event AdminContactUpdated(string email, string phone);
    event AdminCredentialsUpdated(string username);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender;
        maxCandidates = 50;
        maxVoters = 500;
        maxRegisteredUsers = 1000;
        adminEmail = "admin@trustchain.com";
        adminPhone = "+1234567890";
        adminUsername = "admin";
        adminPasswordHash = keccak256(abi.encodePacked("admin"));
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

    function addCandidate(string memory _name, string memory _party, string memory _imageUrl, string memory _post) external onlyAdmin {
        require(candidates.length < maxCandidates, "Max candidates reached");
        require(elections[_post].state == ElectionState.NotScheduled, "Cannot add candidates during election");
        
        if (!elections[_post].exists) {
            elections[_post].exists = true;
            postList.push(_post);
        }

        uint256 id = candidates.length;
        candidates.push(Candidate({
            id: id,
            name: _name,
            party: _party,
            imageUrl: _imageUrl,
            post: _post,
            voteCount: 0
        }));

        emit CandidateAdded(id, _name, _party, _post);
    }

    function deleteCandidate(uint256 _candidateId) external onlyAdmin {
        require(_candidateId < candidates.length, "Invalid candidate ID");
        string memory post = candidates[_candidateId].post;
        require(elections[post].state == ElectionState.NotScheduled, "Cannot delete candidates during or after election");

        string memory name = candidates[_candidateId].name;

        if (_candidateId < candidates.length - 1) {
            candidates[_candidateId] = candidates[candidates.length - 1];
            candidates[_candidateId].id = _candidateId;
        }
        candidates.pop();

        emit CandidateDeleted(_candidateId, name, post);
    }

    function authorizeVoter(address _voter) external onlyAdmin {
        require(voterAddresses.length < maxVoters, "Max voters reached");
        require(!voters[_voter].isAuthorized, "Voter already authorized");
        
        voters[_voter].isAuthorized = true;
        voterAddresses.push(_voter);
        
        emit VoterAuthorized(_voter);
    }

    function registerUser(string memory _username) external {
        require(registeredUserAddresses.length < maxRegisteredUsers, "Max registration limit reached");
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

        // If user is authorized, revoke authorization and remove from voterAddresses
        if (voters[_userAddress].isAuthorized) {
            voters[_userAddress].isAuthorized = false;
            
            // Remove from voterAddresses array
            for (uint256 i = 0; i < voterAddresses.length; i++) {
                if (voterAddresses[i] == _userAddress) {
                    voterAddresses[i] = voterAddresses[voterAddresses.length - 1];
                    voterAddresses.pop();
                    break;
                }
            }
        }
        
        string memory username = registeredUsers[_userAddress].username;
        delete registeredUsers[_userAddress];
        
        for (uint256 i = 0; i < registeredUserAddresses.length; i++) {
            if (registeredUserAddresses[i] == _userAddress) {
                registeredUserAddresses[i] = registeredUserAddresses[registeredUserAddresses.length - 1];
                registeredUserAddresses.pop();
                break;
            }
        }
        
        emit UserDeleted(_userAddress, username);
    }

    function setElectionTimes(string memory _post, uint256 _startTime, uint256 _endTime) external onlyAdmin {
        require(elections[_post].state == ElectionState.NotScheduled, "Cannot set times after election started");
        require(_endTime > _startTime, "End time must be after start time");
        require(_startTime > block.timestamp, "Start time must be in the future");
        
        if (!elections[_post].exists) {
            elections[_post].exists = true;
            postList.push(_post);
        }

        elections[_post].startTime = _startTime;
        elections[_post].endTime = _endTime;
        
        emit ElectionTimesSet(_post, _startTime, _endTime);
    }

    function startElection(string memory _post) external onlyAdmin {
        require(elections[_post].state == ElectionState.NotScheduled, "Election already started or closed");
        require(elections[_post].startTime > 0 && elections[_post].endTime > 0, "Election times must be set first");
        elections[_post].state = ElectionState.Open;
        emit ElectionStateChanged(_post, ElectionState.Open);
    }

    function endElection(string memory _post) external onlyAdmin {
        require(elections[_post].state == ElectionState.Open, "Election is not open");
        elections[_post].state = ElectionState.Closed;
        emit ElectionStateChanged(_post, ElectionState.Closed);
    }

    function resetElection(string memory _post) external onlyAdmin {
        require(elections[_post].state == ElectionState.Closed, "Can only reset after election is closed");
        
        // Clear votes for candidates of this post
        for (uint256 i = 0; i < candidates.length; i++) {
            if (keccak256(bytes(candidates[i].post)) == keccak256(bytes(_post))) {
                candidates[i].voteCount = 0;
            }
        }

        // Reset voter status for this post
        for (uint256 j = 0; j < voterAddresses.length; j++) {
            voters[voterAddresses[j]].hasVotedByPost[_post] = false;
            voters[voterAddresses[j]].votedCandidateIdByPost[_post] = 0;
        }
        
        elections[_post].startTime = 0;
        elections[_post].endTime = 0;
        elections[_post].state = ElectionState.NotScheduled;
        
        emit ElectionStateChanged(_post, ElectionState.NotScheduled);
    }

    function deleteElection(string memory _post) external onlyAdmin {
        // Remove candidates for this post
        uint256 i = 0;
        while (i < candidates.length) {
            if (keccak256(bytes(candidates[i].post)) == keccak256(bytes(_post))) {
                if (i < candidates.length - 1) {
                    candidates[i] = candidates[candidates.length - 1];
                    candidates[i].id = i;
                }
                candidates.pop();
            } else {
                i++;
            }
        }

        // Reset voter status for this post
        for (uint256 j = 0; j < voterAddresses.length; j++) {
            voters[voterAddresses[j]].hasVotedByPost[_post] = false;
            voters[voterAddresses[j]].votedCandidateIdByPost[_post] = 0;
        }
        
        // Remove from postList
        for (uint256 k = 0; k < postList.length; k++) {
            if (keccak256(bytes(postList[k])) == keccak256(bytes(_post))) {
                postList[k] = postList[postList.length - 1];
                postList.pop();
                break;
            }
        }

        // Delete from mapping
        delete elections[_post];
        
        emit ElectionStateChanged(_post, ElectionState.NotScheduled);
    }

    function vote(uint256 _candidateId) external {
        require(voters[msg.sender].isAuthorized, "You are not authorized to vote");
        require(_candidateId < candidates.length, "Invalid candidate ID");
        
        string memory post = candidates[_candidateId].post;
        require(elections[post].state == ElectionState.Open, "Election for this post is not open");
        require(!voters[msg.sender].hasVotedByPost[post], "You have already voted for this post");

        voters[msg.sender].hasVotedByPost[post] = true;
        voters[msg.sender].votedCandidateIdByPost[post] = _candidateId;
        candidates[_candidateId].voteCount++;

        emit VoteCasted(msg.sender, _candidateId, post);
    }

    function getCandidates() external view returns (Candidate[] memory) {
        return candidates;
    }

    function getVoterStatus(address _voter, string memory _post) external view returns (bool isAuthorized, bool hasVoted, uint256 candidateId) {
        return (voters[_voter].isAuthorized, voters[_voter].hasVotedByPost[_post], voters[_voter].votedCandidateIdByPost[_post]);
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

    function getElectionInfo(string memory _post) external view returns (ElectionState state, uint256 startTime, uint256 endTime) {
        return (elections[_post].state, elections[_post].startTime, elections[_post].endTime);
    }

    function getPostList() external view returns (string[] memory) {
        return postList;
    }

    function updateAdminCredentials(string memory _newUsername, string memory _newPassword) external onlyAdmin {
        require(bytes(_newUsername).length > 0, "Username cannot be empty");
        require(bytes(_newPassword).length > 0, "Password cannot be empty");
        adminUsername = _newUsername;
        adminPasswordHash = keccak256(abi.encodePacked(_newPassword));
        emit AdminCredentialsUpdated(_newUsername);
    }

    function verifyAdmin(string memory _username, string memory _password) external view returns (bool) {
        return (keccak256(bytes(_username)) == keccak256(bytes(adminUsername)) && 
                keccak256(abi.encodePacked(_password)) == adminPasswordHash);
    }

    function getUserInfo(address _user) external view returns (string memory username, bool isRegistered, bool isAuthorized) {
        return (
            registeredUsers[_user].username,
            registeredUsers[_user].isRegistered,
            voters[_user].isAuthorized
        );
    }
}
