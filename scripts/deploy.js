const { ethers } = require("hardhat");
require("dotenv").config();
// const { QUICKNODE_HTTP_URL, PRIVATE_KEY } = require("../constants");
const DeployContract = async () => {
  // Address of the whitelist contract that you deployed in the previous module
  const whitelistContract = "0xACaB74241dc229C1EfE5dbc867c62f2a6641656c";
  // URL from where we can extract the metadata for a Crypto Dev NFT

  /*
  A ContractFactory in ethers.js is an abstraction used to deploy new smart contracts,
  so cryptoDevsContract here is a factory for instances of our CryptoDevs contract.
  */
  let NFtcontract = await ethers.getContractFactory("FalconDevs");
  let NFT_Contract_deploy = await NFtcontract.deploy(whitelistContract);
  await NFT_Contract_deploy.deployed();
  console.log("Contract address is here : ", NFT_Contract_deploy.address);
};

DeployContract()
  .then(() => process.exit(1))
  .catch((error) => {
    console.error(error);
    process.exit(0);
  });
//0x531058150EF6D95D78fd970F5cd3787725e657C3
