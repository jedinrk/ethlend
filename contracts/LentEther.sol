pragma solidity ^0.4.19;

contract LentEther {
  address[] public lendMap;

  // Mapping invester to lend request
  function lend(uint lendId) public returns (uint) {
    //require(lendId >= 0 && lendId <= 15);

    lendMap.push(msg.sender);

    return lendId;
  }

  // Retrieving the LendMapping
  function getLendMap() public view returns (address[]) {
    return lendMap;
  }

  /* Send coins */
  function transfer(address _to, uint256 _value) returns (bool success) {
      // mitigates the ERC20 short address attack
      if(msg.data.length < (2 * 32) + 4) { throw; }

      if (_value == 0) { return false; }

      uint256 fromBalance = balances[msg.sender];

      bool sufficientFunds = fromBalance >= _value;
      bool overflowed = balances[_to] + _value < balances[_to];

      if (sufficientFunds && !overflowed) {
          balances[msg.sender] -= _value;
          balances[_to] += _value;

          Transfer(msg.sender, _to, _value);
          return true;
      } else { return false; }
  }


}
