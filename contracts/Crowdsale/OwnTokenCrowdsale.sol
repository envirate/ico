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
			uint256 _rate,
            address _wallet,
			OwnToken _token,
			uint256 _hardCap,
			uint256 _softCap,
            uint256 _openingTime,
            uint256 _closingTime
        )
		public
		Crowdsale(_rate, _wallet, _token)		
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
		
		//uint256 usedRate = 1;
		if (now < period1End) {
			rate = period1Rate;
		}
		else if (now < period2End) {
			rate = period2Rate;
		}
		else if (now < period3End) {
			rate = period3Rate;
		}
		else if (now < period4End) {
			rate = period4Rate;
		}
		else if (now < period5End) {
			rate = period5Rate;
		}
		else {
			rate = 1;
		}
	  }
	  
	  
	  
	  
	  bool public ratesSet = false;
	  
	  uint256 public period1End;
	  uint256 public period1Rate;
	  uint256 public period2End;
	  uint256 public period2Rate;
	  uint256 public period3End;
	  uint256 public period3Rate;
	  uint256 public period4End;
	  uint256 public period4Rate;
	  uint256 public period5End;
	  uint256 public period5Rate;
	  
	  /**
	   * @dev Set used rates for different sale periods. Multiply by 100, so 25% bonus is given here as 125.
	   */
	  function setRates(
		  uint256 p1End, uint256 p1Rate,
		  uint256 p2End, uint256 p2Rate,
		  uint256 p3End, uint256 p3Rate,
		  uint256 p4End, uint256 p4Rate,
		  uint256 p5End, uint256 p5Rate
	  ) public {
		require(!ratesSet, "The rates have already been set");
		
		period1End = p1End;
		period1Rate = p1Rate;
		period2End = p2End;
		period2Rate = p2Rate;
		period3End = p3End;
		period3Rate = p3Rate;
		period4End = p4End;
		period4Rate = p4Rate;
		period5End = p5End;
		period5Rate = p5Rate;
		
		ratesSet = true;
	  }
	  
	  /**
	   * @dev Override to extend the way in which ether is converted to tokens.
	   * @param _weiAmount Value in wei to be converted into tokens
	   * @return Number of tokens that can be purchased with the specified _weiAmount
	   */
	  function _getTokenAmount(uint256 _weiAmount) internal view returns (uint256) {
		//return _weiAmount.mul(rate);
		
		return _weiAmount.mul(rate).div(100);
	  }
	
}