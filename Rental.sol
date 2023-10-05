// SPDX-License-Identifier: MIT

pragma solidity >=0.8.2 <0.9.0;

contract Rental{
    struct Asset {
        address lessor;
        string assetAddress;
    }

    struct Lease {
        uint assetID;
        address lenter;
        uint startTime;
        uint endTime;
    }

    Asset[] public assets;
    Lease[] public leases;

    uint public assetIndex;
    uint public leaseIndex;

    modifier checkAssetExist(uint _assetIndex){
        require(_assetIndex < assetIndex, "No Such a Asset");
        _;
    }

    modifier checkLeaseExist(uint _leaseIndex){
        require(_leaseIndex < leaseIndex, "No Such a Lease");
        _;
    }

    modifier checkTimestamp(uint _startTime, uint _endTime){
        require(_startTime < _endTime && _startTime > block.timestamp && _endTime > block.timestamp,
                                                                                "Timestamp Error");
        _;
    }

    function addAsset(address _lessor, string memory _assetAddress) public returns(uint){
        Asset memory _asset;
        _asset.lessor = _lessor;
        _asset.assetAddress = _assetAddress;
        assets.push(_asset);
        return assetIndex++;
    }

    function rent(uint _assetID, address _lenter, uint _startTime, uint _endTime)
            checkAssetExist(_assetID) checkTimestamp(_startTime, _endTime) public returns (uint){
        Lease memory _lease;
        _lease.assetID = _assetID;
        _lease.lenter = _lenter;
        _lease.startTime = _startTime;
        _lease.endTime = _endTime;
        leases.push(_lease);
        return leaseIndex++;
    }

    function breakLease(uint _leaseIndex) checkLeaseExist(_leaseIndex) public returns(uint){
        delete leases[_leaseIndex];
        return _leaseIndex;
    }
}