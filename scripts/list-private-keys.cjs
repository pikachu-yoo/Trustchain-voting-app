const hre = require("hardhat");

async function main() {
    // This works for the default hardhat network which exposes private keys in the provider for testing
    // However, getting private keys programmatically from the signer object isn't directly supported for security in some versions.
    // But for the default 'hardhat' network or 'localhost' started with 'npx hardhat node', we know the mnemonic.
    // The mnemonic is: test test test test test test test test test test test junk

    const mnemonic = "test test test test test test test test test test test junk";
    const wallet = hre.ethers.Wallet.fromPhrase(mnemonic);

    console.log("Default Hardhat Mnemonic:", mnemonic);
    console.log("\nGenerated Accounts & Private Keys:");
    console.log("===================================");

    for (let i = 0; i < 10; i++) {
        const path = `m/44'/60'/0'/0/${i}`;
        // Actually, let's just use the constructor that takes the path if possible or just standard derivation
        // Ethers v6:
        const hdNode = hre.ethers.HDNodeWallet.fromPhrase(mnemonic, "", path);
        console.log(`Account #${i}:`);
        console.log(`  Address: ${hdNode.address}`);
        console.log(`  Private Key: ${hdNode.privateKey}`);
        console.log("-----------------------------------");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
