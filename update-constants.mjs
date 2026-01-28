import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the compiled contract artifact
const artifactPath = path.join(__dirname, 'artifacts/contracts/Voting.sol/Voting.json');
const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

// New contract address from deployment
const contractAddress = "0x4826533B4897376654Bb4d4AD88B7faFD0C98528";

// Create the constants file content
const constantsContent = `export const contractAddress = "${contractAddress}";
export const contractABI = ${JSON.stringify(artifact.abi, null, 4)};
`;

// Write to constants.js
const constantsPath = path.join(__dirname, 'frontend/src/constants.js');
fs.writeFileSync(constantsPath, constantsContent);

console.log('Constants file updated successfully!');
console.log(`Contract Address: ${contractAddress}`);
