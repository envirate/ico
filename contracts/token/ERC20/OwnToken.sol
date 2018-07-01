pragma solidity 0.4.24;

import './BurnableToken.sol';


// maybe: CanReclaimToken, ownable (transerownership)

contract OwnToken is BurnableToken
{
	constructor(uint256 initialAmount, string _name, uint8 _decimals, string _symbol) 
	EIP20(initialAmount, _name, _decimals, _symbol) 
	public
	{
	
	}
}

