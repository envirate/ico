pragma solidity 0.4.23;

import './BurnableToken.sol';
//import 'contracts/EIP20/EIP20.sol';


// maybe: CanReclaimToken, burnable

contract OwnToken is BurnableToken
{
	constructor(uint256 initialAmount, string _name, uint8 _decimals, string _symbol) 
	EIP20(initialAmount, _name, _decimals, _symbol) 
	public
	{
	
	}
}

