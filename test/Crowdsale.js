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
		crowdsale = await Crowdsale.deploy(token.address, ether(1), tokens(1000000));

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

		it('returns the max number of tokens', async () => {
			expect(await crowdsale.maxTokens()).to.equal(tokens(1000000));
		})

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

			it('updates tokensSold', async () => {
				expect(await crowdsale.tokensSold()).to.equal(amount)
			});

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
			// it('fails if purchase is for more tokens than available', async () => {
			// 	await expect(crowdsale.connect(user1).buyTokens(tokens(10000000), { value: ether(10000000) * 1e18})).to.be.reverted;
			// });
		});
	});

	// Test for allowing user to send ETH directly to the smart contract (instead via the web UI)
	describe('Sending ETH', () => {
		let transaction, result;
		let amount = tokens(10);

		describe('Success', () => {

			beforeEach(async () => {
				transaction = await user1.sendTransaction({ to: crowdsale.address, value: amount });
				result = await transaction.wait();
			});

			it('updates contract ether balance', async () => {
				// QUESTION: Do we use amount in both places because it's 1:1 tokens:ether in this example?
				expect(await ethers.provider.getBalance(crowdsale.address)).to.equal(amount);	
			});

			it('updates user token balance', async () => {
				expect(await token.balanceOf(user1.address)).to.equal(amount);
			});
		});
	})

	describe('Update Price', () => {
		let transaction, price;
		let newPrice = ether(2);

		describe('Success', () => {
			beforeEach(async () => {
				transaction = await crowdsale.connect(deployer).setPrice(newPrice);
				price = await crowdsale.price();
			});

			it('updates price', async () => {
				expect(price).to.equal(newPrice);
			});
		});

		describe('Failure', () => {
			it('rejects update if not owner', async () => {
				await expect(crowdsale.connect(user1).setPrice(newPrice)).to.be.reverted;
			});
		});

	});
	describe('Finalizing Sale', () => {
		let transaction, result;
		let amount = tokens(10);
		let value = ether(10);

		describe('Success', ()=> {
			beforeEach(async () => {
				transaction = await crowdsale.connect(user1).buyTokens(amount, {value: value });
				result = await transaction.wait();

				transaction = await crowdsale.connect(deployer).finalize();
				result = await transaction.wait();
			});

			it('transfers remianing tokens to deployer', async () => {
				expect(await token.balanceOf(deployer.address)).to.equal(tokens(999990));
				expect(await token.balanceOf(crowdsale.address)).to.equal(tokens(0));
			});

			it('transfers eth balance to owner', async () => {
				expect(await ethers.provider.getBalance(crowdsale.address)).to.equal(0);
			});

			it('emits Finalize event', async () => {
				await expect(transaction).to.emit(crowdsale, 'Finalize');
			});

		});

		describe('Failure', () => {
			it('rejects if not owner', async () => {
				await expect(crowdsale.connect(user1).finalize()).to.be.reverted;
			});
		});
	})
});