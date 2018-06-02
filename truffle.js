require('dotenv').config();
require('babel-register');
require('babel-polyfill');
module.exports = {
    networks: {
        development: {
            host: "localhost",
            port: 8545,
			gas: 5600000,
			gasPrice: 10000000000,
            network_id: "*" // Match any network id
        },
		ropsten:  {
		 network_id: 3,
		 host: "localhost",
		 port:  8545,
		 gas: 3500000,
		gasPrice: 10000000000
		}
		
    }
};
