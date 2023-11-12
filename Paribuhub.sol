// SPDX-License-Identifier: MIT

// i simplfy the contract and delete unnecessary part for the task. 
// we also can use the index variable but length method is the enough to achive the task
pragma solidity >=0.8.2 <0.9.0;

contract ParibuHub {
    address public owner;
    struct Account {
        string name;
        string surname;
        uint256 balance;
    }

    Account account;
    Account[] public admins;
    uint private index;

    constructor(){
        owner = msg.sender;    
        }

    function getAccount() public view returns(Account memory){
        Account memory _account = account;
        return _account;
    }

    function addAdmin(Account memory admin) public {
        admins.push(admin);
    }

    function getAllAdmins() view public returns(Account[] memory) {
        Account[] memory _admins = new Account[](admins.length);
        for(uint i=0; i < admins.length; i++){
            _admins[i] = admins[i];
        }
        return _admins;
    }

}
