pragma solidity ^0.4.24;

import "../token/ERC20/OwnToken.sol";
import "../crowdsale/validation/CappedCrowdsale.sol";


contract CappedCrowdsaleImpl is CappedCrowdsale {

  constructor (
    uint256 _rate,
    address _wallet,
    OwnToken _token,
    uint256 _cap,
	uint256 _openingTime, 
	uint256 _closingTime,
	uint256 _goal
  )
    public
    Crowdsale(_rate, _wallet, _token)		
	TimedCrowdsale(_openingTime, _closingTime)
	RefundableCrowdsale(_goal)
    CappedCrowdsale(_cap)
  {
  }

}
