//const EnvTokenCrowdsale = artifacts.require('./EnvTokenCrowdsale.sol');
const EnvToken = artifacts.require('./EnvToken.sol');

module.exports = function(deployer, network, accounts) {
    const openingTime = web3.eth.getBlock('latest').timestamp + 2; // two secs in the future
    const closingTime = openingTime + 86400 * 20; // 20 days
    const rate = new web3.BigNumber(1000);
    const wallet = accounts[1];
	deployer.deploy(EnvToken, {gas: 4000000});
	
/*
    return deployer
        .then(() => {
            //return deployer.deploy(EnvToken, "name", "sym", 18, {gas: 4000000});
			return deployer.deploy(EnvToken, {gas: 4000000});
        })
        .then(() => {
            return deployer.deploy(
                EnvTokenCrowdsale,
                openingTime,
                closingTime,
                rate,
                wallet,
                EnvToken.address,
				{gas: 4700000}
            );
        });
		*/
};