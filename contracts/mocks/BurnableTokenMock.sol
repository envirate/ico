pragma solidity ^0.4.24;

import "../token/ERC20/BurnableToken.sol";
import "../token/ERC20/EIP20.sol";


contract BurnableTokenMock is BurnableToken {

  constructor(address initialAccount, uint initialBalance) 
  EIP20(1000, "name", 18, "sym")
  public {
    balances[initialAccount] = initialBalance;
    totalSupply = initialBalance;
  }

}
