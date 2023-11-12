    function transfer(address to, uint256 amount) external {
        // Check if the transaction sender has enough tokens.
        // If `require`'s first argument evaluates to `false` then the
        // transaction will revert.
        require(balances[msg.sender] >= amount, "Not enough tokens");

        // Transfer the amount.
        balances[msg.sender] -= amount;
        balances[to] += amount;

        // Notify off-chain applications of the transfer.
        emit Transfer(msg.sender, to, amount);
    }

// there can be reentrancy vulnerablity in the method
// It seems protected against reentrancy attack
// Because it first update the sender balance before the increase 'to' address balance
// If first sender increase 'to' balance,
// then transfer method can be recalled several times before the updating sender balance

// we should keep follow these order to protect against reentrancy attack
// checkbalance()
// updatebalance()
// sendfunds() 

// if we change the orders of the update and send 
// (order : checkbalance() -> sendfunds() -> updatebalance()),
// attacker can recall the sendfunds method several times before updatebalance 

contract ReEntrancyGuard {
    bool internal locked;

    modifier noReentrant() {
        require(!locked, "No re-entrancy");
        locked = true;
        _;
        locked = false;
    }
}

// Also we can use modifier like this. We lock the method until completely finished.
// So attacker can't recall method several times. 
