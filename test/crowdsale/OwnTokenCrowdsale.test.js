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

const Crowdsale = artifacts.require('OwnTokenCrowdsale');
const OwnToken = artifacts.require('OwnTokenMock');

contract('OwnTokenCrowdsale', function ([origWallet, investor, wallet, purchaser]) {
  const rate = new BigNumber(2);
  const value = ether(3);
  const expectedTokenAmount = rate.mul(value);
  const hardcap = new BigNumber(ether(15));
  const softcap = new BigNumber(ether(3));
  
  const interval = new BigNumber(2);

  const period1Length = duration.weeks(interval * 1);
  const period1Rate = new BigNumber(130);
  const period2Length = duration.weeks(interval * 2);
  const period2Rate = new BigNumber(125);
  const period3Length = duration.weeks(interval * 3);
  const period3Rate = new BigNumber(120);
  const period4Length = duration.weeks(interval * 4);
  const period4Rate = new BigNumber(115);
  const period5Length = duration.weeks(interval * 5);
  const period5Rate = new BigNumber(110);
  
  function getTokenAmount(perRate, origTokens) {
	  return (origTokens * perRate) / 100;
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
    this.crowdsale = await Crowdsale.new(rate, wallet, this.token.address, hardcap, softcap, this.openingTime, this.closingTime);
	
	await this.crowdsale.setRates(	    
		this.openingTime + period1Length, period1Rate,
		this.openingTime + period2Length, period2Rate,
		this.openingTime + period3Length, period3Rate,
		this.openingTime + period4Length, period4Rate,
		this.openingTime + period5Length, period5Rate
		);
	
	
	await this.crowdsale.addManyToWhitelist([ origWallet, investor, wallet, purchaser ]);
	//await this.crowdsale.transferOwnership(investor);
    await this.token.transfer(this.crowdsale.address, supply);
	
	// start from the beginning of sales periods
	await increaseTimeTo(this.openingTime);
  });
  
  describe('buing tokens', function () {
	  
	it('should start from zero', async function () {
      let balance = await this.crowdsale.toBeReceivedTokenAmounts(investor);
      balance.should.be.bignumber.equal(0);
    });
	
    it('should assign tokens to sender internally correctly for one purchase', async function () {
      await this.crowdsale.sendTransaction({ value: value, from: investor });
      let balance = await this.crowdsale.toBeReceivedTokenAmounts(investor);
	  
      balance.should.be.bignumber.equal(getTokenAmount(period1Rate, value));
    });
	
	it('should assign tokens to sender internally correctly for multiple purchases', async function () {
	  let newBuy = value.add(ether(1));
      await this.crowdsale.sendTransaction({ value: value, from: investor });
      await this.crowdsale.sendTransaction({ value: newBuy, from: investor });

	  let firstBal = getTokenAmount(period1Rate, value);
	  let secondBal = getTokenAmount(period1Rate, newBuy);

	  let balance = await this.crowdsale.toBeReceivedTokenAmounts(investor);
      balance.should.be.bignumber.equal(firstBal + secondBal);
    });
	
	it('should assign tokens to sender internally correctly for multiple purchases for multiple periods', async function () {
	  let newBuy = value.sub(ether(1));
      await this.crowdsale.sendTransaction({ value: value, from: investor });
	  await increaseTimeTo(this.openingTime + period1Length);
	  await this.crowdsale.sendTransaction({ value: newBuy, from: investor });

	  let firstBal = getTokenAmount(period1Rate, value);
	  let secondBal = getTokenAmount(period2Rate, newBuy);

	  let balance = await this.crowdsale.toBeReceivedTokenAmounts(investor);
      balance.should.be.bignumber.equal(firstBal + secondBal);
    });

  });
  
  describe('when paused', function () {
    it('should not accept payments', async function () {
	  await this.crowdsale.pause();
      await this.crowdsale.sendTransaction({ value: value }).should.be.rejectedWith(EVMRevert);
    });
  });
  
  
  describe('setting rates', function () {
    it('twice should revert', async function () {
      await this.crowdsale.setRates(
		1, 2,
		3, 4,
		5, 6,
		7, 8,
		9, 10
		).should.be.rejectedWith(EVMRevert);
    });
	
	it('correctly', async function () {
      (await this.crowdsale.period1End()).should.be.bignumber.equal(this.openingTime + period1Length);
	  (await this.crowdsale.period2End()).should.be.bignumber.equal(this.openingTime + period2Length);
	  (await this.crowdsale.period3End()).should.be.bignumber.equal(this.openingTime + period3Length);
	  (await this.crowdsale.period4End()).should.be.bignumber.equal(this.openingTime + period4Length);
	  (await this.crowdsale.period5End()).should.be.bignumber.equal(this.openingTime + period5Length);
	  
	  (await this.crowdsale.period1Rate()).should.be.bignumber.equal(period1Rate);
	  (await this.crowdsale.period2Rate()).should.be.bignumber.equal(period2Rate);
	  (await this.crowdsale.period3Rate()).should.be.bignumber.equal(period3Rate);
	  (await this.crowdsale.period4Rate()).should.be.bignumber.equal(period4Rate);
	  (await this.crowdsale.period5Rate()).should.be.bignumber.equal(period5Rate);
    });
  });
  

  
  
  
});
