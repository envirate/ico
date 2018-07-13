var OwnTokenCrowdsale = artifacts.require("OwnTokenCrowdsale");

contract('OwnTokenCrowdsale', function(accounts) {
  it("get the size of the contract", function() {
    return OwnTokenCrowdsale.deployed().then(function(instance) {
      var bytecode = instance.constructor._json.bytecode;
      var deployed = instance.constructor._json.deployedBytecode;
      var sizeOfB  = bytecode.length / 2;
      var sizeOfD  = deployed.length / 2;
      console.log("size of bytecode in bytes = ", sizeOfB);
      console.log("size of deployed in bytes = ", sizeOfD);
      console.log("initialisation and constructor code in bytes = ", sizeOfB - sizeOfD);
    });  
  });
});

var OwnTokenCrowdsale = artifacts.require("./OwnTokenCrowdsale.sol");

module.exports = function(deployer) {
  deployer.deploy(OwnTokenCrowdsale)

    // Option 2) Console log the address:
    .then(() => console.log(OwnTokenCrowdsale.address))

    // Option 3) Retrieve the contract instance and get the address from that:
    .then(() => OwnTokenCrowdsale.deployed())
    .then(_instance => console.log(_instance.address));
};