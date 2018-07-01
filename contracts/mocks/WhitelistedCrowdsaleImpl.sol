pragma solidity ^0.4.24;

import "../token/ERC20/OwnToken.sol";
import "../crowdsale/validation/WhitelistedCrowdsale.sol";


contract WhitelistedCrowdsaleImpl is WhitelistedCrowdsale {

  constructor (
    uint256 _rate,
    address _wallet,
    OwnToken _token
  )
    public
    Crowdsale(_rate, _wallet, _token)
  {
  }

}
