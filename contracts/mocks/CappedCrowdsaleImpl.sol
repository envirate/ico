pragma solidity ^0.4.23;

import "../token/ERC20/OwnToken.sol";
import "../crowdsale/validation/CappedCrowdsale.sol";


contract CappedCrowdsaleImpl is CappedCrowdsale {

  constructor (
    uint256 _rate,
    address _wallet,
    OwnToken _token,
    uint256 _cap
  )
    public
    Crowdsale(_rate, _wallet, _token)
    CappedCrowdsale(_cap)
  {
  }

}