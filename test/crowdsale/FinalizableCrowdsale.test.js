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

const Crowdsale = artifacts.require('OwnTokenCrowdsaleImpl');
const OwnToken = artifacts.require('OwnTokenMock');

contract('FinalizableCrowdsale', function ([origWallet, owner, wallet, thirdparty]) {
  //const rate = new BigNumber(1);
  const value = ether(3);
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
	await this.crowdsale.addManyToWhitelist([ origWallet, owner, thirdparty ]);
	await this.crowdsale.transferOwnership(owner);
	await increaseTimeTo(this.openingTime);
  });

  it('cannot be finalized before ending', async function () {
    await this.crowdsale.finalize({ from: owner }).should.be.rejectedWith(EVMRevert);
  });

  it('cannot be finalized by third party after ending', async function () {
    await increaseTimeTo(this.afterClosingTime);
    await this.crowdsale.finalize({ from: thirdparty }).should.be.rejectedWith(EVMRevert);
  });

  it('can be finalized by owner after ending', async function () {
    await increaseTimeTo(this.afterClosingTime);
    await this.crowdsale.finalize({ from: owner }).should.be.fulfilled;
  });

  it('cannot be finalized twice', async function () {
    await increaseTimeTo(this.afterClosingTime);
    await this.crowdsale.finalize({ from: owner });
    await this.crowdsale.finalize({ from: owner }).should.be.rejectedWith(EVMRevert);
  });

  it('logs finalized', async function () {
    await increaseTimeTo(this.afterClosingTime);
    const { logs } = await this.crowdsale.finalize({ from: owner });
    const event = logs.find(e => e.event === 'Finalized');
    should.exist(event);
  });
});
