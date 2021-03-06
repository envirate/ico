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

//const Crowdsale = artifacts.require('OwnTokenCrowdsaleImpl');
const CrowdsaleReal = artifacts.require('OwnTokenCrowdsale');
const OwnToken = artifacts.require('OwnTokenMock');
const RefundVault = artifacts.require('RefundVault');

contract('OwnTokenCrowdsale', function ([origWallet, investor, wallet, purchaser]) {
  const rate = new BigNumber(2);
  const value = new BigNumber(ether(2));
  const hardcap = new BigNumber(ether(15));
  const softcap = new BigNumber(ether(4));
  
  const interval = new BigNumber(2);
  const minInvestment = ether(1) / 10;
  const phase1Length = duration.weeks(interval * 1);
  const phase1Rate = new BigNumber(130000);
  const phase2Length = duration.weeks(interval * 2);
  const phase2Rate = new BigNumber(125000);
  
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
    this.crowdsale = await CrowdsaleReal.new(wallet, this.token.address, hardcap, softcap, this.openingTime, this.closingTime, minInvestment,
		this.openingTime + phase1Length, phase1Rate,
		this.openingTime + phase2Length, phase2Rate);

	await this.crowdsale.addManyToWhitelist([ origWallet, investor, wallet, purchaser ]);
    await this.token.transfer(this.crowdsale.address, supply);
	
	// start from the beginning of sales phases
	await increaseTimeTo(this.openingTime);
  });
  
  describe('Finalization', function () {
	
	it('should burn leftover tokens correctly', async function () {
	  let secondBal = getTokenAmount(phase1Rate, softcap);
	  const supply = await this.token.INITIAL_SUPPLY();

	  await this.crowdsale.sendTransaction({ value: softcap, from: investor });

	  await increaseTimeTo(this.closingTime + duration.seconds(1));
	  
	  let balancePreFinalization = await this.token.balanceOf(this.crowdsale.address);

	  balancePreFinalization.should.be.bignumber.equal(supply.minus(secondBal));
	  
	  await this.crowdsale.finalize();
	  
	  let balanceAfterFinalization = await this.token.balanceOf(this.crowdsale.address);
	  balanceAfterFinalization.should.be.bignumber.equal(0);
    });
	
  });
 
 
  describe('buying tokens', function () {
	it('should send tokens to sender correctly for multiple purchases for multiple phases', async function () {
	  let newBuy = value.sub(ether(1));
	  let firstBal = getTokenAmount(phase1Rate, value);
	  let secondBal = getTokenAmount(phase2Rate, newBuy);

      await this.crowdsale.sendTransaction({ value: value, from: investor });
	  await increaseTimeTo(this.openingTime + phase1Length);
	  await this.crowdsale.sendTransaction({ value: newBuy, from: investor });

	  let balance = await this.token.balanceOf(investor);
      balance.should.be.bignumber.equal(firstBal + secondBal);
    });
	
	it('should allow refund if soft cap not met', async function () {
	  
	  const prePurcBal1 = web3.eth.getBalance(investor);
	  const prePurcBal2 = web3.eth.getBalance(purchaser);
	  
	  let newBuy = value.sub(ether(1));
      await this.crowdsale.sendTransaction({ value: value, from: investor, gasPrice: 0 });
	  await this.crowdsale.sendTransaction({ value: newBuy, from: purchaser, gasPrice: 0 });
	  
	  await increaseTimeTo(this.closingTime + duration.seconds(1));

	  await this.crowdsale.finalize();
	  
	  const preBal1 = web3.eth.getBalance(investor);
	  const preBal2 = web3.eth.getBalance(purchaser);

	  await this.crowdsale.claimRefund({ from: investor, gasPrice: 0 }).should.be.fulfilled;    
	  await this.crowdsale.claimRefund({ from: purchaser, gasPrice: 0 }).should.be.fulfilled;
	  
	  const postBal1 = web3.eth.getBalance(investor);
	  const postBal2 = web3.eth.getBalance(purchaser);

      postBal1.minus(preBal1).should.be.bignumber.equal(value);
	  postBal2.minus(preBal2).should.be.bignumber.equal(newBuy);
	  
	  prePurcBal1.should.be.bignumber.equal(postBal1);
	  prePurcBal2.should.be.bignumber.equal(postBal2);
    });
  });
 
  describe('when paused', function () {
    it('should not accept payments', async function () {
	  await this.crowdsale.pause();
      await this.crowdsale.sendTransaction({ value: value }).should.be.rejectedWith(EVMRevert);
    });
  });

  
  describe('with minimum investment', function () {
    it('should require minimum purchase amount', async function () {
	  const minInv = await this.crowdsale.minInvestment();
	  const lessThanMin = minInv.minus(1);
      await this.crowdsale.sendTransaction({ value: lessThanMin, from: investor }).should.be.rejectedWith(EVMRevert);
    });
	
	it('should allow with minimum purchase amount', async function () {
	  const minInv = await this.crowdsale.minInvestment();
      await this.crowdsale.sendTransaction({ value: minInv, from: investor }).should.be.fulfilled;
    });
	
	it('should allow with new minimum purchase amount', async function () {
	  const oldMinInv = await this.crowdsale.minInvestment();
	  const moreThanMin = oldMinInv.add(5);
	  
	  // recreate crowdsale to reset minimum investment
	  this.token = await OwnToken.new();
	  const supply = await this.token.INITIAL_SUPPLY();
	  this.openingTime = latestTime() + duration.weeks(1);
	  this.crowdsale = await CrowdsaleReal.new(wallet, this.token.address, hardcap, softcap, this.openingTime, this.closingTime, moreThanMin,
		this.openingTime + phase1Length, phase1Rate,
		this.openingTime + phase2Length, phase2Rate);
		
	  await this.crowdsale.addManyToWhitelist([ origWallet, investor, wallet, purchaser ]);
      await this.token.transfer(this.crowdsale.address, supply);
	
	  // start from the beginning of sales phases
	  await increaseTimeTo(this.openingTime);
	  
	  // end of recreation
	  
      await this.crowdsale.sendTransaction({ value: oldMinInv, from: investor }).should.be.rejectedWith(EVMRevert);
	  await this.crowdsale.sendTransaction({ value: moreThanMin, from: investor }).should.be.fulfilled;
	  
	  const newMinInv = await this.crowdsale.minInvestment();
	  newMinInv.should.be.bignumber.equal(moreThanMin);
    });
  });
  
  
  describe('with irregular phase variables', function () {
	it('should not work with phase 2 before phase 1', async function () {
	  await CrowdsaleReal.new(wallet, this.token.address, hardcap, softcap, this.openingTime, this.closingTime, minInvestment,
		this.openingTime + duration.weeks(interval * 2), phase1Rate,
		this.openingTime + duration.weeks(interval * 1), phase2Rate).should.be.rejectedWith(EVMRevert);
    });
	it('should not work with phases before opening time', async function () {
	  await CrowdsaleReal.new(wallet, this.token.address, hardcap, softcap, this.openingTime, this.closingTime, minInvestment,
		this.openingTime - duration.weeks(interval * 1), phase1Rate,
		this.openingTime + duration.weeks(interval * 2), phase2Rate).should.be.rejectedWith(EVMRevert);
    });
	it('should not work with phases after closing time', async function () {
	  await CrowdsaleReal.new(wallet, this.token.address, hardcap, softcap, this.openingTime, this.closingTime, minInvestment,
		this.openingTime + duration.weeks(interval * 1), phase1Rate,
		this.closingTime + duration.weeks(interval * 2), phase2Rate).should.be.rejectedWith(EVMRevert);
    });
  });
  
  describe('handling rates', function () {
	
	it('correctly', async function () {
      (await this.crowdsale.phase1End()).should.be.bignumber.equal(this.openingTime + phase1Length);
	  (await this.crowdsale.phase2End()).should.be.bignumber.equal(this.openingTime + phase2Length);
	  
	  (await this.crowdsale.phase1Rate()).should.be.bignumber.equal(phase1Rate);
	  (await this.crowdsale.phase2Rate()).should.be.bignumber.equal(phase2Rate);
    });
  });
  
  
});
