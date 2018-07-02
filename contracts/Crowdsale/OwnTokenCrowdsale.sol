pragma solidity 0.4.24;

import '../token/ERC20/OwnToken.sol';
import './distribution/RefundableCrowdsale.sol';
import './validation/TimedCrowdsale.sol';
import './validation/CappedCrowdsale.sol';
import '../lifecycle/Pausable.sol';

contract OwnTokenCrowdsale is CappedCrowdsale, Pausable // PostDeliveryCrowdsale?
{
	using SafeMath for uint256;
	
	mapping(address => uint256) public toBeReceivedTokenAmounts;
	uint256 public minInvestment;
	
	uint256 public phase1End;
	uint256 public phase1Rate;
	uint256 public phase2End;
	uint256 public phase2Rate;
	
    constructor
        (
            address _wallet,
			OwnToken _token,
			uint256 _hardCap,
			uint256 _softCap,
            uint256 _openingTime,
            uint256 _closingTime,
			uint256 _minInvestment,
			uint256 _p1End, uint256 _p1Rate,
		    uint256 _p2End, uint256 _p2Rate
        )
		public
		Crowdsale(1, _wallet, _token)		
		TimedCrowdsale(_openingTime, _closingTime)
		RefundableCrowdsale(_softCap)
		CappedCrowdsale(_hardCap)
 
         {
			require(_p1End > _openingTime, "Phase 1 should be after opening time");
			require(_p2End > _openingTime, "Phase 2 should be after opening time");
			require(_p1End <= _closingTime, "Phase 1 should be before closing time");
			require(_p2End <= _closingTime, "Phase 2 should be before closing time");
			
			require(_p1End < _p2End, "Phase 1 should be before phase 2");
			
			require(_p1Rate > 0, "Phase 1 rate should be positive");
			require(_p2Rate > 0, "Phase 2 rate should be positive");
			
			phase1End = _p1End;
			phase1Rate = _p1Rate;
			phase2End = _p2End;
			phase2Rate = _p2Rate;
			
			minInvestment = _minInvestment;
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
		require(weiRaised.add(_weiAmount) <= cap, "Sorry, the crowdsale has reached its hard cap");
		require(msg.value >= minInvestment, "Sorry, you have to meet the minimum amount");
		
		
		_setRate();
		
		
	  }
	  
	  function _setRate() private {
	    if (now < phase1End) {
			rate = phase1Rate;
		}
		else if (now < phase2End) {
			rate = phase2Rate;
		}
		else {
			rate = 100;
		}
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