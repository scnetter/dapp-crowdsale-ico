const hre = require("hardhat");

async function main() {
    const NAME = 'LIMA Token';
    const SYMBOL = 'LIMA';
    const MAX_SUPPLY = '1000000';
    const Crowdsale = await hre.ethers.getContractFactory("Crowdsale");
    const Token = await hre.ethers.getContractFactory("Token");
    
    // Configure Accounts
    const accounts = await hre.ethers.getSigners();
    const deployer = accounts[0];
    const user1 = accounts[1];
    
    // Deploy Tokens
    const token = await Token.deploy(NAME, SYMBOL, MAX_SUPPLY);
    await token.deployed();
    console.log(`Token deployed to: ${token.address}\n`);
    
    // Could this be used to interact with an existing token just using the
    // a valid token address on the chain?
    // Associate Deployed token with Crowdsale
    const crowdsale = await Crowdsale.deploy(token.address, hre.ethers.utils.parseUnits('1', 'ether'), hre.ethers.utils.parseUnits(MAX_SUPPLY, 'ether'));
    await crowdsale.deployed();
    console.log(`Crowdsale deployed to: ${crowdsale.address}\n`);


    // Send tokens to crowdsale
    const transaction = await token.connect(deployer).transfer(crowdsale.address, hre.ethers.utils.parseUnits(MAX_SUPPLY, 'ether'));
    await transaction.wait();
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});