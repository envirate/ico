pragma solidity 0.4.23;

import '../token/ERC20/OwnToken.sol';
import './distribution/RefundableCrowdsale.sol';
import './validation/TimedCrowdsale.sol';
import './validation/CappedCrowdsale.sol';

contract OwnTokenCrowdsale is CappedCrowdsale 
{
	using SafeMath for uint256;
	
	mapping(address => uint256) public toBeReceivedTokenAmounts;
	
    constructor
        (
            uint256 _openingTime,
            uint256 _closingTime,
			uint256 _softCap,
			uint256 _rate,
            address _wallet,
			uint256 _hardCap,
            OwnToken _token
        )
		public
		Crowdsale(_rate, 0x01, _token)		
		TimedCrowdsale(_openingTime, _closingTime)
		RefundableCrowdsale(_softCap)
		CappedCrowdsale(_hardCap)
 
         {

        }
		
		/**
	   * @dev Executed when a purchase has been validated and is ready to be executed. Not necessarily emits/sends tokens.
	   * @param _beneficiary Address receiving the tokens
	   * @param _tokenAmount Number of tokens to be purchased
	   */
	  function _processPurchase(address _beneficiary, uint256 _tokenAmount) internal {
		toBeReceivedTokenAmounts[_beneficiary] = toBeReceivedTokenAmounts[_beneficiary].add(_tokenAmount);
	  }
		
	
}