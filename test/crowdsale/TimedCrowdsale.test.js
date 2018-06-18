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

const Crowdsale = artifacts.require('OwnTokenCrowdsaleImpl');
const OwnToken = artifacts.require('OwnTokenMock');

contract('TimedCrowdsale', function ([origWallet, investor, wallet, purchaser]) {
  const rate = new BigNumber(1);
  const value = ether(3);
  const expectedTokenAmount = rate.mul(value);
  const hardcap = new BigNumber(ether(100));
  const softcap = new BigNumber(ether(10));

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
    this.crowdsale = await Crowdsale.new(wallet, this.token.address, hardcap, softcap, this.openingTime, this.closingTime);
	await this.crowdsale.addManyToWhitelist([ origWallet, investor, purchaser ]);
    await this.token.transfer(this.crowdsale.address, supply);
  });

  it('should be ended only after end', async function () {
    let ended = await this.crowdsale.hasClosed();
    ended.should.equal(false);
    await increaseTimeTo(this.afterClosingTime);
    ended = await this.crowdsale.hasClosed();
    ended.should.equal(true);
  });

  describe('accepting payments', function () {
    it('should reject payments before start', async function () {
      await this.crowdsale.send(value).should.be.rejectedWith(EVMRevert);
      await this.crowdsale.buyTokens(investor, { from: purchaser, value: value }).should.be.rejectedWith(EVMRevert);
    });

    it('should accept payments after start', async function () {
      await increaseTimeTo(this.openingTime);
      await this.crowdsale.send(value).should.be.fulfilled;
      await this.crowdsale.buyTokens(investor, { value: value, from: purchaser }).should.be.fulfilled;
    });

    it('should reject payments after end', async function () {
      await increaseTimeTo(this.afterClosingTime);
      await this.crowdsale.send(value).should.be.rejectedWith(EVMRevert);
      await this.crowdsale.buyTokens(investor, { value: value, from: purchaser }).should.be.rejectedWith(EVMRevert);
    });
  });
});
