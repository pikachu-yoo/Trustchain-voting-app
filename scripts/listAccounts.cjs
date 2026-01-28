const hre = require("hardhat");

async function main() {
    const accounts = await hre.ethers.getSigners();

    console.log("\n📊 All Available Hardhat Accounts");
    console.log("=".repeat(80));
    console.log(`Total Accounts: ${accounts.length}\n`);

    for (let i = 0; i < accounts.length; i++) {
        const balance = await hre.ethers.provider.getBalance(accounts[i].address);

        console.log(`Account #${i}`);
        console.log(`  Address: ${accounts[i].address}`);
        console.log(`  Balance: ${hre.ethers.formatEther(balance)} ETH`);
        console.log("");
    }

    console.log("=".repeat(80));
    console.log("\n💡 Note: Private keys are shown when you run 'npx hardhat node'\n");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
