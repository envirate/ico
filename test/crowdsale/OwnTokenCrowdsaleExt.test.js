import ether from '../helpers/ether';
import { advanceBlock } from '../helpers/advanceToBlock';
import { increaseTimeTo, duration } from '../helpers/increaseTime';
import latestTime from '../helpers/latestTime';
import EVMRevert from '../helpers/EVMRevert';

const BigNumber = web3.BigNumber;

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const CrowdsaleExt = artifacts.require('OwnTokenCrowdsaleExtension');
const OwnToken = artifacts.require('OwnTokenMock');

contract('OwnTokenCrowdsaleExtension', function ([origWallet, investor, wallet, purchaser]) {
  const rate = new BigNumber(2);
  const value = new BigNumber(ether(3));
  const expectedTokenAmount = rate.mul(value);
  const hardcap = new BigNumber(ether(15));
  const softcap = new BigNumber(ether(9));
  
  const interval = new BigNumber(2);
  const minInvestment = ether(1) / 10;
  const softCapRate = new BigNumber(100);
  
  function getTokenAmount(perRate, origTokens) {
	  return (origTokens * perRate);
  }
  
  before(async function () {
    // Advance to the next block to correctly read time in the solidity "now" function interpreted by ganache
    await advanceBlock();
  });
  
  beforeEach(async function () {
    this.token = await OwnToken.new();
	const supply = await this.token.INITIAL_SUPPLY();
	this.openingTime = latestTime() + duration.weeks(1);
    this.closingTime = this.openingTime + duration.weeks(20);
    this.afterClosingTime = this.closingTime + duration.seconds(1);
    this.crowdsale = await CrowdsaleExt.new(wallet, this.token.address, hardcap, softcap, this.openingTime, this.closingTime, minInvestment, softCapRate);

	await this.crowdsale.addManyToWhitelist([ origWallet, investor, wallet, purchaser ]);
    await this.token.transfer(this.crowdsale.address, supply);
	
	// start from the beginning of sales phases
	await increaseTimeTo(this.openingTime);
  });
 
  describe('buing tokens', function () {
	
	it('should have the right soft cap rate', async function () {
      const foundRate = await this.crowdsale.softCapRate();
	  
      foundRate.should.be.bignumber.equal(softCapRate);
    });
	
    it('should send tokens correctly when soft cap not met', async function () {
      await this.crowdsale.sendTransaction({ value: value, from: investor });
      let balance = await this.token.balanceOf(investor);
	  
      balance.should.be.bignumber.equal(getTokenAmount(softCapRate, value));
    });
	
	it('should send tokens correctly when soft cap is met', async function () {
	  const foundRate = await this.crowdsale.defaultRate();
	  await this.crowdsale.sendTransaction({ value: softcap, from: purchaser });
      await this.crowdsale.sendTransaction({ value: value, from: investor });
      let balance = await this.token.balanceOf(investor);
	  
      balance.should.be.bignumber.equal(getTokenAmount(foundRate, value));
    });

  });
  
 
  
});
