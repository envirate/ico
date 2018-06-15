import ether from '../helpers/ether';
import { advanceBlock } from '../helpers/advanceToBlock';
import { increaseTimeTo, duration } from '../helpers/increaseTime';
import latestTime from '../helpers/latestTime';
import EVMRevert from '../helpers/EVMRevert';

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const Crowdsale = artifacts.require('OwnTokenCrowdsale');
const OwnToken = artifacts.require('OwnTokenMock');

contract('CappedCrowdsale', function ([origWallet, wallet]) {
  const rate = new BigNumber(2);
  const value = ether(3);
  const expectedTokenAmount = rate.mul(value);
  const hardcap = new BigNumber(ether(5));
  const softcap = new BigNumber(ether(3));
  const lessThanCap = ether(3);

  before(async function () {
    // Advance to the next block to correctly read time in the solidity "now" function interpreted by ganache
    await advanceBlock();
  });
  
  
  beforeEach(async function () {
    this.token = await OwnToken.new();
	const supply = await this.token.INITIAL_SUPPLY();
	this.openingTime = latestTime() + duration.weeks(1);
    this.closingTime = this.openingTime + duration.weeks(1);
    this.afterClosingTime = this.closingTime + duration.seconds(1);
    this.crowdsale = await Crowdsale.new(rate, wallet, this.token.address, hardcap, softcap, this.openingTime, this.closingTime);
	await this.crowdsale.addManyToWhitelist([ origWallet, wallet ]);
	await this.crowdsale.transferOwnership(wallet);
    await this.token.transfer(this.crowdsale.address, supply);
	await increaseTimeTo(this.openingTime);
  });
  
  /*
  beforeEach(async function () {
    this.token = await OwnTokenMock.new();
	const supply = await this.token.INITIAL_SUPPLY();
	this.openingTime = latestTime() + duration.weeks(1);
    this.closingTime = this.openingTime + duration.weeks(1);

    this.crowdsale = await Crowdsale.new(rate, owner, this.token.address, cap, this.openingTime, this.closingTime, goal);
	await this.crowdsale.addManyToWhitelist([ origWallet, owner ]);
	await this.crowdsale.transferOwnership(owner);
    await this.token.transfer(this.crowdsale.address, supply);
  });
  */

  describe('creating a valid crowdsale', function () {
    it('should fail with zero hardcap', async function () {
      await Crowdsale.new(rate, wallet, this.token.address, 0, softcap, this.openingTime, this.closingTime).should.be.rejectedWith(EVMRevert);
    });
  });

  describe('accepting payments', function () {
    it('should accept payments within hardcap', async function () {
      await this.crowdsale.sendTransaction({ value: hardcap.minus(lessThanCap)}).should.be.fulfilled;
      await this.crowdsale.send(lessThanCap).should.be.fulfilled;
    });

    it('should reject payments outside hardcap', async function () {
      await this.crowdsale.send(hardcap);
      await this.crowdsale.send(1).should.be.rejectedWith(EVMRevert);
    });

    it('should reject payments that exceed hardcap', async function () {
      await this.crowdsale.send(hardcap.plus(1)).should.be.rejectedWith(EVMRevert);
    });
  });

  describe('ending', function () {
    it('should not reach hardcap if sent under hardcap', async function () {
      let capReached = await this.crowdsale.capReached();
      capReached.should.equal(false);
      await this.crowdsale.send(lessThanCap);
      capReached = await this.crowdsale.capReached();
      capReached.should.equal(false);
    });

    it('should not reach hardcap if sent just under hardcap', async function () {
      await this.crowdsale.send(hardcap.minus(1));
      let capReached = await this.crowdsale.capReached();
      capReached.should.equal(false);
    });

    it('should reach hardcap if hardcap sent', async function () {
      await this.crowdsale.send(hardcap);
      let capReached = await this.crowdsale.capReached();
      capReached.should.equal(true);
    });
  });
});
