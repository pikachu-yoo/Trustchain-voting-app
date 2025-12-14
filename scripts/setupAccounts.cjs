const hre = require("hardhat");

async function main() {
    const accounts = await hre.ethers.getSigners();

    console.log("\n🔑 Hardhat Test Accounts for MetaMask Import");
    console.log("=".repeat(80));
    console.log("\n⚠️  WARNING: These are PUBLIC test keys. NEVER use on mainnet!\n");

    const accountInfo = [
        { name: "Admin Account", role: "Contract Owner & Election Manager" },
        { name: "Voter 1", role: "Test Voter" },
        { name: "Voter 2", role: "Test Voter" },
        { name: "Voter 3", role: "Test Voter" },
        { name: "Voter 4", role: "Test Voter" },
        { name: "Voter 5", role: "Test Voter" },
        { name: "Voter 6", role: "Test Voter" },
        { name: "Voter 7", role: "Test Voter" },
        { name: "Voter 8", role: "Test Voter" },
        { name: "Voter 9", role: "Test Voter" },
    ];

    for (let i = 0; i < Math.min(accounts.length, accountInfo.length); i++) {
        const balance = await hre.ethers.provider.getBalance(accounts[i].address);

        console.log(`📌 ${accountInfo[i].name}`);
        console.log(`   Role: ${accountInfo[i].role}`);
        console.log(`   Address: ${accounts[i].address}`);
        console.log(`   Balance: ${hre.ethers.formatEther(balance)} ETH`);
        console.log("");
    }

    console.log("=".repeat(80));
    console.log("\n📋 To import to MetaMask:");
    console.log("1. Look at your Hardhat node terminal for private keys");
    console.log("2. MetaMask → Account Icon → Import Account");
    console.log("3. Paste the private key for the account you want");
    console.log("4. Rename account in MetaMask for easy identification");
    console.log("\n💡 Tip: Import at least Account #0 (Admin) and 3-5 voter accounts\n");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
