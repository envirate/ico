pragma solidity ^0.4.23;


import "../crowdsale/distribution/FinalizableCrowdsale.sol";
import "../token/ERC20/OwnToken.sol";

contract FinalizableCrowdsaleImpl is FinalizableCrowdsale {

  constructor (
    uint256 _openingTime,
    uint256 _closingTime,
    uint256 _rate,
    address _wallet,
    OwnToken _token
  )
    public
    Crowdsale(_rate, _wallet, _token)
    TimedCrowdsale(_openingTime, _closingTime)
  {
  }

}
