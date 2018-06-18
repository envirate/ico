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
    /*Crowdsale(1, _wallet, _token)		
	TimedCrowdsale(_openingTime, _closingTime)
	RefundableCrowdsale(_softcap)
    CappedCrowdsale(_hardcap)*/
	OwnTokenCrowdsale(_wallet, _token, _hardcap, _softcap, _openingTime, _closingTime, 1000, 1, 1001, 1, 1)
  {
  }

}
