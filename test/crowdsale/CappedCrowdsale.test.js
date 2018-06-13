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

const CappedCrowdsale = artifacts.require('CappedCrowdsaleImpl');
const OwnTokenMock = artifacts.require('OwnTokenMock');

contract('CappedCrowdsale', function ([origWallet, owner]) {
  const rate = new BigNumber(1);
  const goal = new BigNumber(100);
  const cap = ether(5);
  const lessThanCap = ether(3);

  before(async function () {
    // Advance to the next block to correctly read time in the solidity "now" function interpreted by ganache
    await advanceBlock();
  });
  
  beforeEach(async function () {
    this.token = await OwnTokenMock.new();
	const supply = await this.token.INITIAL_SUPPLY();
	this.openingTime = latestTime() + duration.weeks(1);
    this.closingTime = this.openingTime + duration.weeks(1);

    this.crowdsale = await CappedCrowdsale.new(rate, owner, this.token.address, cap, this.openingTime, this.closingTime, goal);
	await this.crowdsale.addManyToWhitelist([ origWallet, owner ]);
	await this.crowdsale.transferOwnership(owner);
    await this.token.transfer(this.crowdsale.address, supply);
  });

  describe('creating a valid crowdsale', function () {
    it('should fail with zero cap', async function () {
      await CappedCrowdsale.new(rate, owner, 0, this.token.address, this.openingTime, this.closingTime, goal).should.be.rejectedWith(EVMRevert);
    });
  });

  describe('accepting payments', function () {
    it('should accept payments within cap', async function () {
	  await increaseTimeTo(this.openingTime);
      await this.crowdsale.sendTransaction({ value: cap.minus(lessThanCap)}).should.be.fulfilled;
      //await this.crowdsale.send(lessThanCap).should.be.fulfilled;
    });

    it('should reject payments outside cap', async function () {
		await increaseTimeTo(this.openingTime);
      await this.crowdsale.send(cap);
      await this.crowdsale.send(1).should.be.rejectedWith(EVMRevert);
    });

    it('should reject payments that exceed cap', async function () {
		await increaseTimeTo(this.openingTime);
      await this.crowdsale.send(cap.plus(1)).should.be.rejectedWith(EVMRevert);
    });
  });

  describe('ending', function () {
    it('should not reach cap if sent under cap', async function () {
		await increaseTimeTo(this.openingTime);
      let capReached = await this.crowdsale.capReached();
      capReached.should.equal(false);
      await this.crowdsale.send(lessThanCap);
      capReached = await this.crowdsale.capReached();
      capReached.should.equal(false);
    });

    it('should not reach cap if sent just under cap', async function () {
		await increaseTimeTo(this.openingTime);
      await this.crowdsale.send(cap.minus(1));
      let capReached = await this.crowdsale.capReached();
      capReached.should.equal(false);
    });

    it('should reach cap if cap sent', async function () {
		await increaseTimeTo(this.openingTime);
      await this.crowdsale.send(cap);
      let capReached = await this.crowdsale.capReached();
      capReached.should.equal(true);
    });
  });
});
