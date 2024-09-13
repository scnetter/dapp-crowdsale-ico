const { ethers } = require('hardhat');
const { expect } = require('chai');

// Helper function to convert tokens to value x 10^ether_decimals (18)
const tokens = (n) => {
	return ethers.utils.parseUnits(n.toString(), 'ether');
}

const totalSupply = tokens(1000000);

describe('Token', () => {
	let token, accounts, deployerAddress, deployer, receiver, exchange;

	beforeEach( async () => {
		// Test setup - deploy and fetch token
		const Token = await ethers.getContractFactory('Token');
		token = await Token.deploy("Lima Coin", "LIMA", 1000000);
		accounts = await ethers.getSigners();
		deployer = accounts[0];
		receiver = accounts[1];
		exchange = accounts[2];
		deployerAddress = deployer.address;
		receiverAddress = receiver.address;
		exchangeAddress = exchange.address;
	});

	describe('Deployment', () => {

		const name = 'Lima Coin';
		const symbol = 'LIMA';
		const decimals = 18;
		// Deployment Tests go here
		it('has correct name', async () => {
			// Check name is correct
			expect(await token.name()).to.equal(name);
		});

		it('has correct symbol', async () => {
			// Check symbol is correct
			expect(await token.symbol()).to.equal(symbol);
		});
		it('has correct decimals', async () => {
			// Check symbol is correct
			expect(await token.decimals()).to.equal(decimals);
		});
		it('has correct totalSupply', async () => {
		// Check symbol is correct
			
			expect(await token.totalSupply()).to.equal(totalSupply);
		});
		it('assigns total supply to deployer', async () => {
			expect(await token.totalSupply()).to.equal(await token.balanceOf(deployerAddress));
			
		});
	});

	describe('Sending Tokens', () => {
		let amount, transaction, result;

		describe('Success', () => {
			beforeEach( async () => {
				amount = tokens(100);
				transaction = await token.connect(deployer).transfer(receiverAddress, amount);
				result = await transaction.wait();
			});

			it('transfers tokens between accounts', async () => {
				expect(await token.balanceOf(deployerAddress)).to.equal(tokens(999900));
				expect(await token.balanceOf(receiverAddress)).to.equal(amount);
			});

			it('emits a Transfer event', async () => {

			    const event = result.events[0];
			    expect(event.event).to.equal('Transfer');

			    const argss = event.args;
			    expect(argss._from).to.equal(deployerAddress);
			    expect(argss._to).to.equal(receiverAddress);
			    expect(argss._value).to.equal(amount);
			});
		});

		describe('Failure', async () => {
			it('fails if sender does not have enough tokens', async () => {
				const invalidAmount = tokens(totalSupply + 1);
				await expect(token.connect(deployer).transfer(receiverAddress, invalidAmount)).to.be.reverted;
			});
			it('fails if the recipient does not exist', async () => {
				await expect(token.connect(deployer).transfer(ethers.constants.AddressZero, amount)).to.be.reverted;
			});
		});

	});

	describe('Approving Tokens', () => {
		let amount, transaction, result;

		beforeEach(async () => {
			amount = tokens(100);
			transaction = await token.connect(deployer).approve(exchangeAddress, amount);
			result = await transaction.wait();
			
		});

		describe('Success', () => {
			it('allocates an allowace for delegated token spending', async () => {
				expect(await token.allowance(deployerAddress, exchangeAddress)).to.equal(amount);
			});

			it('emits an Approval event', async () => {

			    const event = result.events[0];
			    expect(event.event).to.equal('Approval');

			    const argss = event.args;
			    expect(argss._owner).to.equal(deployerAddress);
			    expect(argss._spender).to.equal(exchangeAddress);
			    expect(argss._value).to.equal(amount);
			});
		});

		describe('Failure', () => {
			it('rejects invalid spenders', async () => {
				await expect(token.connect(deployer).approve(ethers.constants.AddressZero, amount)).to.be.reverted;
			});
		});
	});

	describe('Delegated Token Transfer', () => {

		let amount, transaction, result;

		beforeEach(async () => {
			amount = tokens(100);
			transaction = await token.connect(deployer).approve(exchangeAddress, amount);
			result = await transaction.wait();
			
		});

		describe('Success', () => {
			beforeEach(async () => {
				transaction = await token.connect(exchange).transferFrom(deployerAddress, receiverAddress, amount);
				result = await transaction.wait();
			});

			it('transfers token balances', async () => {
				expect(await token.balanceOf(deployerAddress)).to.equal(ethers.utils.parseUnits('999900', 'ether'));
				expect(await token.balanceOf(receiverAddress)).to.equal(amount);
				
			});

			it('resets the allowance', async () => {
				expect(await token.allowance(deployerAddress, exchangeAddress)).to.equal(0);
				
			});

			it('emits a Transfer event', async () => {
			    const event = result.events[0];
			    expect(event.event).to.equal('Transfer');

			    const argss = event.args;
			    expect(argss._from).to.equal(deployerAddress);
			    expect(argss._to).to.equal(receiverAddress);
			    expect(argss._value).to.equal(amount);
		    });

		});

		describe('Failure', () => {
			it('rejects insufficient balances', async () => {
				const invalidAmount = tokens(100000001);
				await expect(token.connect(exchange).transferFrom(deployerAddress, receiverAddress, invalidAmount)).to.be.reverted;
			});
		});
	});
});

