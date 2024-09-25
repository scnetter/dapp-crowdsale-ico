const {expect} = require('chai');
const {ethers} = require('hardhat');

const tokens = (n) => ethers.utils.parseUnits(n.toString(), 'ether');
const ether = tokens;

describe('Crowdsale', () => {

	let crowdsale, token, accounts, deployer, user1;

	beforeEach(async () => {
		// Load contracts
		const Crowdsale = await ethers.getContractFactory('Crowdsale');
		const Token = await ethers.getContractFactory('Token');

		// Configure Accounts
		accounts = await ethers.getSigners();
		deployer = accounts[0];
		user1 = accounts[1];

		// Deploy Tokens
		token = await Token.deploy('Lima Token', 'LIMA', '1000000');

		// Could this be used to interact with an existing token just using the
		// a valid token address on the chain?
		// Associate Deployed token with Crowdsale
		crowdsale = await Crowdsale.deploy(token.address, ether(1));

		// Send tokens to crowdsale
		let transaction = await token.connect(deployer).transfer(crowdsale.address, tokens(1000000));
		await transaction.wait();
	});

	describe('Deployment', () => {
		/**
		 * Test to ensure that tokens are sent to the crowdsale contract.
		 */
		it('sends tokens to the crowdsale contract', async () => {
			expect(await token.balanceOf(crowdsale.address)).to.equal(tokens(1000000));
		});
		
		/**
		* Test case to verify that the crowdsale contract returns the correct token address.
		*/
		it('returns token address', async () => {
			expect(await crowdsale.token()).to.equal(token.address);
		});

	});

	describe('Buying Tokens', () => {
		let transaction, result;
		let amount = tokens(10);

		describe('Success', () => {

			beforeEach(async () => {
				transaction = await crowdsale.connect(user1).buyTokens(amount, { value:ether(10)});
				result = await transaction.wait();
			})
			it('transfers tokens', async () => {
				expect(await token.balanceOf(crowdsale.address)).to.equal(tokens(999990));
				expect(await token.balanceOf(user1.address)).to.equal(amount);
			});

			it('updates contract ether balance', async () => {
				expect(await ethers.provider.getBalance(crowdsale.address)).to.equal(amount);	
			})

			it('emits a buy event', async () => {
				await expect(transaction).to.emit(crowdsale, 'Buy').withArgs(amount, user1.address);
			});
		});

		it('returns token address', async () => {
			expect(await crowdsale.token()).to.equal(token.address);
		});

		describe('Failure', () => {
			it('rejects insufficient ETH', async () => {
				await expect(crowdsale.connect(user1).buyTokens(tokens(10),{ value: 0})).to.be.reverted;
			});

			// Write test to confirm failure on purchase of more tokens than are available.

		});
	});

});