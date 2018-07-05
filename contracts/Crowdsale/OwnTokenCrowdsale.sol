pragma solidity 0.4.24;

import '../token/ERC20/OwnToken.sol';
import './distribution/RefundableCrowdsale.sol';
import './validation/TimedCrowdsale.sol';
import './validation/CappedCrowdsale.sol';
import '../lifecycle/Pausable.sol';

/**
 * @dev Crowdsale with custom overriding logic.
 */
contract OwnTokenCrowdsale is CappedCrowdsale, Pausable
{
	using SafeMath for uint256;
	
	// Information which address should receive how many tokens
	mapping(address => uint256) public toBeReceivedTokenAmounts;
	
	// Minimum investment for this sale period, in weis
	uint256 public minInvestment;
	
	// Timestamp when phase 1 ends
	uint256 public phase1End;
	// Rate for token purchases for phase 1
	uint256 public phase1Rate;
	// Timestamp when phase 2 ends
	uint256 public phase2End;
	// Rate for token purchases for phase 2
	uint256 public phase2Rate;
	
	// Default rate for token purchases. Used if no other logic is in effect. 1 Eth equals to this many tokens if decimals = 18.
	uint256 public defaultRate = 100000;
	
	/**
     * @dev Initializes the crowdsale contract
     * @param _wallet Address for the wallet where the Ether is eventually sent
     * @param _token The token to be used in the crowdsale
	 * @param _hardCap Hard cap for the sale period. Period does not accept Ethers anymore if hard cap is reached.
	 * @param _softCap Soft cap for the sale period. Period is successful iif soft cap is reached.
	 * @param _openingTime When does the sale period start
	 * @param _closingTime When does the sale period end
	 * @param _minInvestment Minimum investment (in weis) for this period
	 * @param _p1End End time for the first phase within the sale period
	 * @param _p1Rate Rate for the first phase within the sale period
	 * @param _p2End End time for the second phase within the sale period
	 * @param _p2Rate Rate for the second phase within the sale period
     */
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
			
			require(_p1End <= _p2End, "Phase 1 should be before phase 2");
			
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
	  
	  /**
	   * @dev Sets the current rate (bonus) with which to calculate the amount of received tokens. Default is defaultRate.
	   */
	  function _setRate() internal {
	    if (now < phase1End) {
			rate = phase1Rate;
		}
		else if (now < phase2End) {
			rate = phase2Rate;
		}
		else {
			rate = defaultRate;
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