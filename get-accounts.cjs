const { ethers } = require("ethers");

async function main() {
    const mnemonic = "test test test test test test test test test test test junk";

    console.log("Default Hardhat Mnemonic:", mnemonic);
    console.log("\nGenerated Test Accounts & Private Keys:");
    console.log("==========================================\n");

    for (let i = 0; i < 10; i++) {
        const path = `m/44'/60'/0'/0/${i}`;
        const wallet = ethers.HDNodeWallet.fromPhrase(mnemonic, "", path);

        console.log(`Account #${i}:`);
        console.log(`  Address:     ${wallet.address}`);
        console.log(`  Private Key: ${wallet.privateKey}`);
        console.log(`  Balance:     10000 ETH (on local network)`);
        console.log("-------------------------------------------\n");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
