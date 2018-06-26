pragma solidity ^0.4.23;

import "../token/ERC20/OwnToken.sol";
import "../crowdsale/OwnTokenCrowdsale.sol";


contract OwnTokenCrowdsaleImpl is OwnTokenCrowdsale {

  constructor (
    address _wallet,
    OwnToken _token,
    uint256 _hardcap,
	uint256 _softcap,
	uint256 _openingTime, 
	uint256 _closingTime	
  )
    public
	OwnTokenCrowdsale(_wallet, _token, _hardcap, _softcap, _openingTime, _closingTime, (1 ether) / 10, 1000, 100, 1001, 100)
  {
  }

}
