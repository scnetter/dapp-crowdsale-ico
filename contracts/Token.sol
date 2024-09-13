//SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.4;

// Allows us to do console logging on the contracts under dev
import "hardhat/console.sol";

contract Token {
	string public name;
	string public symbol;
	uint256 public decimals = 18;
	uint256 public totalSupply;

	// Track balances
	mapping(address => uint256) public balanceOf;
	// Nested mapping. Owner address is key1, spender address is key2
	mapping(address => mapping(address => uint256)) public allowance;

	event Transfer(
		address indexed _from, 
		address indexed _to, 
		uint256 _value
	);

	constructor(string memory _name,
				string memory _symbol,
				uint256 _totalSupply) 
	{
		name = _name;
		symbol = _symbol;
		totalSupply = _totalSupply * (10**decimals);
		balanceOf[msg.sender] = totalSupply;
	}

	function _transfer(address _from, address _to, uint256 _value)
		internal
	{
		require(_to != address(0), "ERC20: transfer to the zero address");
		balanceOf[_to] += _value;
		balanceOf[_from] -= _value;

		emit Transfer(_from, _to, _value);
	}

	function transfer(address _to, uint256 _value) 
		public 
		returns (bool success)
	{
		require(balanceOf[msg.sender] >= _value, "ERC20: transfer amount exceeds balance");
		_transfer(msg.sender, _to, _value);
		return true;
	}	

	event Approval(
		address indexed _owner,
		address indexed _spender,
		uint256 _value
	);

	function approve(address _spender, uint256 _value) 
		public returns (bool success) 
	{
		require(_spender != address(0), "ERC20: approve to the zero address");
		allowance[msg.sender][_spender] = _value;

		emit Approval(msg.sender, _spender, _value);
		return true;
	}

	function transferFrom(address _from, address _to, uint256 _value) 
		public 
		returns (bool success) 
	{
		require(balanceOf[_from] >= _value, "ERC20: transfer amount exceeds balance");
		require(allowance[_from][msg.sender] >= _value, "ERC20: insufficient allowance");
		
		_transfer(_from, _to, _value);	

		// Decrement Allowance
		allowance[_from][msg.sender] -= _value;

		return true;
	}	
}
