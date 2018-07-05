# Ethereum ICO contracts for Envirate

This repository contains codes to conduct an Initial Coin Offering for Envirate (http://www.envirate.net).

The solution uses the following building blocks:
- Ethereum Solidity for writing the crowdsale (ICO) smart contracts
- Truffle for unit tests and deployment
- OpenZeppelin smart contracts for basis of functionality

## Installation
Windows installation instructions. Tested for:
* Truffle v4.1.13 (core: 4.1.13)
* Solidity v0.4.24 (solc-js)

Instructions:
1. Install Geth
1. Install Node
1. Install Git
1. install npm:
	1. npm install
1. Install ganache-cli and truffle with Node:
	1. npm install -g ganache-cli
	1. npm install -g truffle
1. Setup git:
	1. git config --global user.name "Firstname Lastname"
	1. git config --global user.email "your_email@youremail.com"
1. Clone Git repository: git clone https://github.com/envirate/ico.git

To run tests:
1. Run in a separate cmd window: ganache-cli
1. Run in the 'ico' folder: truffle.cmd test

## Terminology
* ICO = Initial Coin Offering
* Bonus / rate = Depending on when you participate in the crowdsale, you may be entitled to certain bonuses. Typically such bonus is certain percentage more tokens for your purchase.
* Sale period = A period of time in the crowdsale. Different sale period have typically different bonuses and different participation rules
* Sale phase = A period of time within a sale period. A sale period may contain multiple sale phases which have different bonuses

## Implemented functionality
The following functionality is implemented with these contracts (also noted with which contract this is implemented):

### Functionality for tokens:
* Token is ERC20 compatible (contract EIP20Interface which is implemented in contract EIP20)
* Token is burnable. If you own tokens you can burn them. Burning reduces them from your balance and from the total token amount. (contract BurnableToken)

### Functionality for crowdsale:
* Crowdsale is owned by its creator. The creator is the only one with access to certain administrative functionality (contract Ownable)
* Crowdsale has default crowdsale functionality (contract Crowdsale)
* Only whitelisted accounts can participate in the crowdsale (contract WhitelistedCrowdsale)
* Crowdsale is active only within a certain time frame and nobody can participate outside the active time (contract TimedCrowdsale)
* If the crowdsale's sale period's soft cap is not met, all Ether accumulated withing the sale period is available for refund for the original participants. The refund has to be then excplicitly requested from the contract. (contracts RefundVault, RefundableCrowdsale, FinalizableCrowdsale)
* Crowdsale does not allow purchases of tokens if the sale period's hard cap is exceeded (contract CappedCrowdsale)
* It is possible for the contract owner to pause (and unpause) the crowdsale (contract Pausable)
* Purchased tokens are not immediately delivered to the purchaser but the amount is stored internally. Tokens are then delivered later in batches to the purchasers. Also it is possible to use different rates (bonuses) per different sale phase within the sale period. (contract OwnTokenCrowdsale)
* It is possible to define a rate (bonus) for the crowdsale sale period based on soft cap: the bonus is in effect only until soft cap is met. (contract OwnTokenCrowdsaleExtension)

## Smart contract inheritance architecture
The smart contracts are layered with inheritance to add functionality. Inheritance of different smart contracts is implemented in the following order.

### Token contracts
* EIP20Interface
	* EIP20
		* BurnableToken
			* OwnToken
### Crowdsale contracts
* Ownable
	* Crowdsale
		* WhitelistedCrowdsale
			* TimedCrowdsale
				* FinalizableCrowdsale
					* RefundableCrowdsale
						* CappedCrowdsale
							* Pausable
							* OwnTokenCrowdsale
								* OwnTokenCrowdsaleExtension

								
## Implementation
Most of the smart contracts are taken from OpenZeppelin's GitHub (https://github.com/OpenZeppelin/openzeppelin-solidity) because they are battle-tested and well documented.
The OpenZeppelin contracts are not modified with the following exceptions:
- Changed inheritance order to simplify overrides
- Disabled some functionality which is implemented differently in sub-contracts:
--  The 'rate' functionality in Crowdsale.sol
- Upgraded Solidity compiler version number

Contracts *OwnTokenCrowdsale*, *OwnTokenCrowdsaleExtension* and *OwnToken* are the only contracts which are not from OpenZeppelin but are ours.

## Unit testing
OpenZeppelin contracts include sufficient unit tests. These unit tests are included as-is with the following exceptions:
- Tests are changed to use our own basic crowdsale *OwnTokenCrowdsale* so that the inheritance integration is tested as well as individual functionalities.
- Fixed tests to work with the new inherited functionalities (for example remembering to add the tests' wallets to whitelist so they have the right to make purchases)
- Rewritten tests which use changed functionality (for example tokens are no longer delivered directly to the customer but are stored in a storage array in *OwnTokenCrowdsale*)

## Disclaimer
Use at your own risk. No support is promised but it can be requested.


