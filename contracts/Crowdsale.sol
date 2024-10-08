// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./Token.sol";

contract Crowdsale {
	address public owner;
	Token public token;
	uint256 public price;
	uint256 public maxTokens;
	uint256 public tokensSold;

	event Buy(uint256 amount, address buyer);
	event Finalize(uint256 tokensSold, uint256 ethCollected);
	
	constructor(Token _token, uint256 _price, uint256 _maxTokens){
		owner = msg.sender;
		token = _token;
		price = _price;
		maxTokens = _maxTokens;
	}

	modifier onlyOwner() {
		require(msg.sender == owner, 'caller must be the owner');
		_;
	}
	receive() external payable {
		uint256 amount = msg.value / price;
		buyTokens(amount * 1e18);
	}

	function buyTokens(uint256 _amount) public payable {
		// msg.value 1 ether is 100000000000000000 Wei
		require(msg.value == (_amount / 1e18) * price);
		require(token.balanceOf(address(this)) >= _amount);
		require(token.transfer(msg.sender, _amount));

		tokensSold += _amount;

		emit Buy(_amount, msg.sender);
	}

	function setPrice(uint256 _price) public onlyOwner {
		price = _price;
	}

	function finalize() public onlyOwner{
		// send remaining tokens to crowdsale creator
		require(token.transfer(owner, token.balanceOf(address(this))));

		// send eth collected to crowdsale creator
		(bool sent, ) = owner.call{value: address(this).balance}("");
		require(sent);

		emit Finalize(tokensSold, address(this).balance);
	}
}
