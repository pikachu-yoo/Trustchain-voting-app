# 🗳️ TrustChain - Decentralized Voting Application

A transparent, secure, and decentralized e-voting application built on Ethereum blockchain using React, Hardhat, and Ethers.js.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Test Accounts](#test-accounts)
- [Project Structure](#project-structure)
- [Smart Contract Details](#smart-contract-details)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

- **Blockchain-Based Voting**: Transparent and immutable voting records on Ethereum
- **Multi-Factor Authentication**: Username/Password + MetaMask wallet verification
- **Role-Based Access Control**: Separate dashboards for Admin and Voters
- **Real-Time Results**: Live vote counting and leaderboard
- **Election Management**: Schedule elections with start/end times
- **Voter Authorization**: Admin can authorize registered voters
- **Candidate Management**: Add candidates with images, names, and party affiliations
- **Vote Tracking**: Detailed vote breakdown showing who voted for whom
- **Election Reset**: Reset election data for new voting periods
- **Responsive Design**: Modern, premium UI that works on all devices

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Ethers.js 6** - Ethereum library for blockchain interaction
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework

### Backend/Blockchain
- **Hardhat** - Ethereum development environment
- **Solidity 0.8.28** - Smart contract language
- **OpenZeppelin** - Secure smart contract library

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download](https://git-scm.com/)
- **MetaMask** browser extension - [Install](https://metamask.io/)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/voting-project2.git
cd voting-project2
```

### 2. Install Root Dependencies

```bash
npm install
```

### 3. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

## ⚙️ Configuration

### 1. MetaMask Network Setup

Add the Hardhat local network to MetaMask:

- **Network Name**: Hardhat Local
- **RPC URL**: `http://127.0.0.1:8545` (or `http://YOUR_IP:8545` for network access)
- **Chain ID**: `31337`
- **Currency Symbol**: ETH

### 2. Import Test Accounts to MetaMask

Use any of the private keys from the [Test Accounts](#test-accounts) section below. 

**Important**: Account #0 is the admin account and is automatically set as the contract owner.

### 3. Contract Address

The contract address is automatically updated in `frontend/src/constants.js` after deployment. Current address:

```
0x5FbDB2315678afecb367f032d93F642f64180aa3
```

## 🏃 Running the Application

### Step 1: Start Hardhat Node

Open a terminal and run:

```bash
npx hardhat node --hostname 0.0.0.0 --config hardhat.config.cjs
```

This starts a local Ethereum network accessible from your network. Keep this terminal running.

### Step 2: Deploy Smart Contract

Open a new terminal and deploy the contract:

```bash
npx hardhat run scripts/deploy.cjs --network localhost --config hardhat.config.cjs
```

The contract address will be displayed. It should match the one in `frontend/src/constants.js`.

### Step 3: Start Frontend Development Server

Open another terminal:

```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:5173`

### Step 4: Access from Other Devices (Optional)

To access from other devices on your network:

1. Find your IP address (shown when you ran the IP command, e.g., `192.168.1.7`)
2. Access the app at `http://YOUR_IP:5173`
3. Configure MetaMask RPC URL to `http://YOUR_IP:8545`

## 🔑 Test Accounts

All accounts are pre-funded with **10,000 ETH** on the local Hardhat network.

### Admin Account (Account #0)
```
Address:     0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
Role:        Contract Owner / Admin
```

### Voter Accounts

#### Account #1
```
Address:     0x70997970C51812dc3A010C7d01b50e0d17dc79C8
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
```

#### Account #2
```
Address:     0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
Private Key: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
```

#### Account #3
```
Address:     0x90F79bf6EB2c4f870365E785982E1f101E93b906
Private Key: 0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6
```

#### Account #4
```
Address:     0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
Private Key: 0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a
```

#### Account #5
```
Address:     0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
Private Key: 0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba
```

#### Account #6
```
Address:     0x976EA74026E726554dB657fA54763abd0C3a0aa9
Private Key: 0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e
```

#### Account #7
```
Address:     0x14dC79964da2C08b23698B3D3cc7Ca32193d9955
Private Key: 0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356
```

#### Account #8
```
Address:     0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f
Private Key: 0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97
```

#### Account #9
```
Address:     0xa0Ee7A142d267C1f36714E4a8F75612F20a79720
Private Key: 0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6
```

**Mnemonic (for reference):**
```
test test test test test test test test test test test junk
```

> ⚠️ **Warning**: These are test accounts for development only. NEVER use these accounts or private keys on mainnet or with real funds!

## 📁 Project Structure

```
voting-project2/
├── contracts/
│   └── Voting.sol              # Main voting smart contract
├── scripts/
│   ├── deploy.cjs              # Deployment script
│   ├── list-accounts.cjs       # List Hardhat accounts
│   └── list-private-keys.cjs   # Generate account details
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminPanel.jsx  # Admin dashboard
│   │   │   ├── VoterDashboard.jsx
│   │   │   ├── Leaderboard.jsx
│   │   │   ├── VoteDetails.jsx
│   │   │   └── ...
│   │   ├── constants.js        # Contract address & ABI
│   │   ├── App.jsx             # Main app component
│   │   └── main.jsx            # Entry point
│   ├── package.json
│   └── vite.config.js
├── hardhat.config.cjs          # Hardhat configuration
├── package.json
├── get-accounts.cjs            # Standalone account generator
└── README.md
```

## 📜 Smart Contract Details

### Contract: Voting.sol

**Key Functions:**

- `registerUser(string username)` - Register a new user
- `authorizeVoter(address voter)` - Admin authorizes a voter
- `addCandidate(string name, string party, string imageUrl)` - Add candidate
- `setElectionTimes(uint256 startTime, uint256 endTime)` - Schedule election
- `startElection()` - Start the election
- `vote(uint256 candidateId)` - Cast a vote
- `endElection()` - End the election
- `resetElection()` - Reset for new election
- `getCandidates()` - Get all candidates
- `getRegisteredUsers()` - Get all registered users

**Events:**

- `UserRegistered` - Emitted when a user registers
- `VoterAuthorized` - Emitted when voter is authorized
- `CandidateAdded` - Emitted when candidate is added
- `VoteCasted` - Emitted when a vote is cast
- `ElectionStateChanged` - Emitted when election state changes
- `ElectionTimesSet` - Emitted when election times are set

## 🌐 Deployment

### Local Network (Development)

Follow the [Running the Application](#running-the-application) steps above.

### Testnet Deployment (e.g., Sepolia)

1. Update `hardhat.config.cjs` with your testnet configuration:

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
    solidity: "0.8.28",
    networks: {
        sepolia: {
            url: process.env.SEPOLIA_RPC_URL,
            accounts: [process.env.PRIVATE_KEY]
        }
    }
};
```

2. Create a `.env` file:

```env
SEPOLIA_RPC_URL=your_alchemy_or_infura_url
PRIVATE_KEY=your_wallet_private_key
```

3. Deploy:

```bash
npx hardhat run scripts/deploy.cjs --network sepolia
```

4. Update `frontend/src/constants.js` with the new contract address

### Mainnet Deployment

> ⚠️ **Warning**: Ensure thorough testing and security audits before mainnet deployment!

Similar to testnet deployment, but use mainnet configuration and be extremely careful with private keys and funds.

## 🔧 Troubleshooting

### MetaMask Connection Issues

1. **Error: "Unexpected character at line 1 column 1"**
   - Restart the Hardhat node
   - Clear MetaMask activity data (Settings → Advanced → Clear activity tab data)
   - Reconnect MetaMask to the site

2. **Wrong Network**
   - Ensure MetaMask is connected to "Hardhat Local" network
   - Check Chain ID is `31337`

3. **Nonce Issues**
   - Reset MetaMask account (Settings → Advanced → Reset Account)

### Contract Deployment Issues

1. **Contract not found**
   - Ensure Hardhat node is running
   - Redeploy the contract
   - Check contract address in `constants.js`

2. **Gas Estimation Failed**
   - Check if the Hardhat node is running
   - Verify you're using the correct network in MetaMask

### Frontend Issues

1. **Blank Page**
   - Check browser console for errors
   - Ensure frontend dev server is running
   - Clear browser cache

2. **Transaction Failures**
   - Ensure you have enough ETH in your account
   - Check if you're authorized (for voters)
   - Verify election is in the correct state

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- OpenZeppelin for secure smart contract libraries
- Hardhat team for the excellent development environment
- Ethereum community for comprehensive documentation

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Contact: your.email@example.com

---

**Made with ❤️ using Blockchain Technology**
