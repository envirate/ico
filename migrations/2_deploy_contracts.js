const OwnTokenCrowdsale = artifacts.require('./OwnTokenCrowdsale.sol');
const OwnToken = artifacts.require('./OwnToken.sol');

module.exports = function(deployer, network, accounts) {
    const openingTime = web3.eth.getBlock('latest').timestamp + 20; // two secs in the future
    const closingTime = openingTime + 86400 * 20; // 20 days
    const rate = new web3.BigNumber(10000000000000 * 1.3);
    const wallet = accounts[1];
	// 1000000000000000000 = 1 Eth
	// 10000000000000 = 1 Eth / 100 000
	const softGap = new web3.BigNumber(6000000000000000000000); // 6k Eth
	const hardCap = new web3.BigNumber(53000000000000000000000); // 53k Eth
	

    return deployer
        .then(() => {
            return deployer.deploy(OwnToken, hardCap, "name", 18, "sym");
        })
        .then(() => {
            return deployer.deploy(
                OwnTokenCrowdsale,
                openingTime,
                closingTime,
				softGap,
                rate,
                wallet,
				hardCap,
                OwnToken.address
            );
        });
;
		
};