pragma solidity 0.4.23;

import './EnvToken.sol';
import 'zeppelin-solidity/contracts/crowdsale/distribution/RefundableCrowdsale.sol';
import 'zeppelin-solidity/contracts/crowdsale/validation/TimedCrowdsale.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';


contract EnvTokenCrowdsale is TimedCrowdsale, RefundableCrowdsale {

    constructor
        (
            uint256 _openingTime,
            uint256 _closingTime,
			uint256 _goal,
			uint256 _rate,
            address _wallet,
            DetailedERC20 _token
        )
		public
		Crowdsale(_rate, _wallet, _token)
		TimedCrowdsale(_openingTime, _closingTime)
		RefundableCrowdsale(_goal)
		
 
         {

        }
}