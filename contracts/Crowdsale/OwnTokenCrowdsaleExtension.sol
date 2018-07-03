pragma solidity 0.4.24;

import '../token/ERC20/OwnToken.sol';
import './OwnTokenCrowdsale.sol';

/**
* @dev Extension to our default crowdsale. Works the same way except rate (bonus) is calculated differently
*/
contract OwnTokenCrowdsaleExtension is OwnTokenCrowdsale
{
	using SafeMath for uint256;
	
	uint256 public softCapRate;
	
    constructor
        (
            address _wallet,
			OwnToken _token,
			uint256 _hardCap,
			uint256 _softCap,
            uint256 _openingTime,
            uint256 _closingTime,
			uint256 _minInvestment,
			uint256 _softCapRate
        )
		public
		// phase1 and phase2 are not used with this contract, so just make them the same length as the entire sale period
		OwnTokenCrowdsale(_wallet, _token, _hardCap, _softCap, _openingTime, _closingTime, _minInvestment, _closingTime, defaultRate, _closingTime, defaultRate)
 
         {
			require(_softCapRate > 0, "Soft Cap rate rate should be positive");
			
			softCapRate = _softCapRate;
        }
		 
	  /**
	   * @dev Sets the current rate (bonus) with which to calculate the amount of received tokens. Default is defaultRate.
	   */
	  function _setRate() internal {
	    if (weiRaised < goal) {
			rate = softCapRate;
		}
		else {
			// default
			rate = defaultRate;
		}
	  }
}