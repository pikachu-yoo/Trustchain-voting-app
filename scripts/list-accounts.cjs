const hre = require("hardhat");

async function main() {
    const accounts = await hre.ethers.getSigners();

    console.log("Available Test Accounts:");
    console.log("========================");
    for (const account of accounts) {
        console.log(account.address);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
