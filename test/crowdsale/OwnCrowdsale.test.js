import ether from '../helpers/ether';

const BigNumber = web3.BigNumber;

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const Crowdsale = artifacts.require('Crowdsale');
const OwnToken = artifacts.require('OwnTokenMock');

contract('Crowdsale', function ([_, investor, wallet, purchaser]) {
  const rate = new BigNumber(2);
  const value = ether(4);
  const expectedTokenAmount = rate.mul(value);

  
});
