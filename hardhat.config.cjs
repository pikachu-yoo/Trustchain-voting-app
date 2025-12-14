require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.28",
    networks: {
        localhost: {
            url: "http://127.0.0.1:8545",
            gas: 100000000,
            blockGasLimit: 100000000
        },
        hardhat: {
            gas: 100000000,
            blockGasLimit: 100000000
        }
    }
};
