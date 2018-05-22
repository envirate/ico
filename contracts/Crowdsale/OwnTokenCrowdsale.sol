pragma solidity 0.4.23;

import '../OwnToken.sol';
import './RefundableCrowdsale.sol';
import './TimedCrowdsale.sol';
//import '../Ownable.sol';


contract OwnTokenCrowdsale is RefundableCrowdsale 
{

    constructor
        (
            uint256 _openingTime,
            uint256 _closingTime,
			uint256 _goal,
			uint256 _rate,
            address _wallet,
            OwnToken _token
        )
		public
		Crowdsale(_rate, _wallet, _token)
		TimedCrowdsale(_openingTime, _closingTime)
		RefundableCrowdsale(_goal)
		
 
         {

        }
}