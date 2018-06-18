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

contract('RefundableCrowdsale', function ([origWallet, owner, wallet, investor, purchaser]) {
  const rate = new BigNumber(1);
  const value = ether(3);
  const hardcap = new BigNumber(ether(100));
  const softcap = new BigNumber(ether(10));
  const lessThanGoal = new BigNumber(ether(8));

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
	await this.crowdsale.addManyToWhitelist([ origWallet, owner, investor, purchaser ]);
	await this.crowdsale.transferOwnership(owner);
    await this.token.transfer(this.crowdsale.address, supply);
  });

  describe('creating a valid crowdsale', function () {
    it('should fail with zero softcap', async function () {
      await Crowdsale.new(wallet, this.token.address, hardcap, 0, this.openingTime, this.closingTime).should.be.rejectedWith(EVMRevert);
    });
  });

  it('should deny refunds before end', async function () {
    await this.crowdsale.claimRefund({ from: investor }).should.be.rejectedWith(EVMRevert);
    await increaseTimeTo(this.openingTime);
    await this.crowdsale.claimRefund({ from: investor }).should.be.rejectedWith(EVMRevert);
  });

  it('should deny refunds after end if softcap was reached', async function () {
    await increaseTimeTo(this.openingTime);
    await this.crowdsale.sendTransaction({ value: softcap, from: investor });
    await increaseTimeTo(this.afterClosingTime);
    await this.crowdsale.claimRefund({ from: investor }).should.be.rejectedWith(EVMRevert);
  });

  it('should allow refunds after end if softcap was not reached', async function () {
    await increaseTimeTo(this.openingTime);
    await this.crowdsale.sendTransaction({ value: lessThanGoal, from: investor });
    await increaseTimeTo(this.afterClosingTime);
    await this.crowdsale.finalize({ from: owner });
    const pre = web3.eth.getBalance(investor);
    await this.crowdsale.claimRefund({ from: investor, gasPrice: 0 })
      .should.be.fulfilled;
    const post = web3.eth.getBalance(investor);
    post.minus(pre).should.be.bignumber.equal(lessThanGoal);
  });

  it('should forward funds to wallet after end if softcap was reached', async function () {
    await increaseTimeTo(this.openingTime);
    await this.crowdsale.sendTransaction({ value: softcap, from: investor });
    await increaseTimeTo(this.afterClosingTime);
    const pre = web3.eth.getBalance(wallet);
    await this.crowdsale.finalize({ from: owner });
    const post = web3.eth.getBalance(wallet);
    post.minus(pre).should.be.bignumber.equal(softcap);
  });
});
