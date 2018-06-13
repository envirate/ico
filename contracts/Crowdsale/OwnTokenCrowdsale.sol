pragma solidity 0.4.23;

import '../token/ERC20/OwnToken.sol';
import './distribution/RefundableCrowdsale.sol';
import './validation/TimedCrowdsale.sol';
import './validation/CappedCrowdsale.sol';
import '../lifecycle/Pausable.sol';

contract OwnTokenCrowdsale is CappedCrowdsale, Pausable // PostDeliveryCrowdsale?
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
	  
	    /**
	   * @dev Validation of an incoming purchase. Use require statements to revert state when conditions are not met. Use super to concatenate validations.
	   * @param _beneficiary Address performing the token purchase
	   * @param _weiAmount Value in wei involved in the purchase
	   */
	  function _preValidatePurchase(address _beneficiary, uint256 _weiAmount) whenNotPaused internal {
		super._preValidatePurchase(_beneficiary, _weiAmount);
	  }
		
	
}