// SPDX-License-Identifier: MIT

pragma solidity >=0.8.2 <0.9.0;

contract AdvanceRental {
    struct Asset {
        string kind;
        bool status; // true(rentable)
        string assetAddress;
    }

    struct Lease {
        address lessor;
        uint assetID;
        bool status; // true(active) false(passive)
        uint startTime;
        uint endTime;
    }

    struct Approvement {
        address lessor;
        address renter;
        uint leaseID;
        string description;
        bool approve;
        bool ended;
    }

    struct Complaint {
        address complainedAbout;
        address lessor;
        address renter;
        uint leaseID;
        string description;
        bool result;
        bool ended;
    }

    address public owner;
    mapping(address => bool) public isblacklisted;
    mapping(address => Asset[]) public assets; // address : owner key
    mapping(address => Lease[]) public leases; // address : lenter key
    mapping(address => Approvement[]) public approvements;
    Complaint[] complaints;
    uint complaintIndex;

    // Events
    event addedAsset(address lessor, uint assetID);

    constructor() {
        owner = msg.sender;
    }

    modifier blacklistFilter(address _user) {
        require(isblacklisted[_user] == false, "user is in blacklist");
        _;
    }

    modifier checkTimestamp(uint _startTime, uint _endTime) {
        require(
            _startTime < _endTime &&
                _startTime > block.timestamp &&
                _endTime > block.timestamp,
            "Timestamp Error"
        );
        _;
    }

    modifier renterAndLessor(address _renter, address _lessor) {
        require(_renter != _lessor, "renter and lessor can not be same!");
        _;
    }

    modifier renterOrLessor(address _renter, address _lessor) {
        require(
            (msg.sender != _renter) || (msg.sender != _lessor),
            "Auth Error!"
        );
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only Owner can do!");
        _;
    }

    function addAsset(
        string memory _kind,
        bool _status,
        string memory _assetAddress
    ) public blacklistFilter(msg.sender) returns (uint) {
        Asset memory _asset;
        _asset.kind = _kind;
        _asset.status = _status;
        _asset.assetAddress = _assetAddress;
        assets[msg.sender].push(_asset);
        emit addedAsset(msg.sender, assets[msg.sender].length - 1);
        return assets[msg.sender].length - 1;
    }

    function rent(
        address _lessor,
        uint _assetID,
        uint _startTime,
        uint _endTime
    )
        public
        blacklistFilter(msg.sender)
        blacklistFilter(_lessor)
        renterAndLessor(msg.sender, _lessor)
        checkTimestamp(_startTime, _endTime)
        returns (uint)
    {
        Lease memory _lease;
        _lease.lessor = _lessor;
        _lease.assetID = _assetID;
        _lease.status = true;
        _lease.startTime = _startTime;
        _lease.endTime = _endTime;
        leases[msg.sender].push(_lease);
        return leases[msg.sender].length - 1;
    }

    function breakLease(
        address _renter,
        address _lessor,
        uint _leaseID
    ) public renterOrLessor(_renter, _lessor) returns (bool) {
        Lease memory _lease = leases[_renter][_leaseID];
        require(_lease.status == true, "Lease passive!");
        int stampDifference = int(block.timestamp) - int(_lease.endTime);
        stampDifference = stampDifference >= 0
            ? stampDifference
            : -stampDifference;
        // if 15 days early or late, lease going to be passive
        if (stampDifference > 1296000) {
            _lease.status = false;
            leases[_renter][_leaseID] = _lease;
            return true;
        }

        // If too early ask to other person
        Approvement memory _approvement;
        _approvement.lessor = _lessor;
        _approvement.renter = _renter;
        _approvement.leaseID = _leaseID;
        _approvement.approve = false;
        _approvement.ended = false;
        if (msg.sender == _renter) {
            _approvement.description = "Renter wanna end the lease";
            approvements[_renter].push(_approvement);
        } else if (msg.sender == _lessor) {
            _approvement.description = "Lessor wanna end the lease";
            approvements[_lessor].push(_approvement);
        }
        return false;
    }

    function approve(uint approvementID, bool result) public {
        Approvement memory _approvement = approvements[msg.sender][
            approvementID
        ];
        _approvement.approve = result;
        if (result) {
            leases[_approvement.renter][_approvement.leaseID].status = false;
            approvements[msg.sender][approvementID].ended = true;
        } else {
            approvements[msg.sender][approvementID].ended = false;
        }
    }

    function complain(
        address _complainAbout,
        address _lessor,
        address _renter,
        uint _leaseID,
        string memory _description
    ) public renterOrLessor(_renter, _lessor) {
        Complaint memory _complaint;
        _complaint.complainedAbout = _complainAbout;
        _complaint.lessor = _lessor;
        _complaint.renter = _renter;
        _complaint.leaseID = _leaseID;
        _complaint.description = _description;
        _complaint.ended = false;
        complaints.push(_complaint);
        ++complaintIndex;
    }

    function complaintSolver(
        uint _complaintIndex,
        bool result
    ) public onlyOwner {
        Complaint memory _complaint = complaints[_complaintIndex];
        _complaint.result = result;
        if (result) {
            isblacklisted[_complaint.complainedAbout] = true;
        }
        _complaint.ended = true;
        complaints[_complaintIndex] = _complaint;
    }

    // // Asset[] public assets;
    // // Lease[] public leases;

    // // uint public assetIndex;
    // // uint public leaseIndex;

    // modifier checkAssetExist(uint _assetIndex){
    //     require(_assetIndex < assetIndex, "No Such a Asset");
    //     _;
    // }

    // modifier checkLeaseExist(uint _leaseIndex){
    //     require(_leaseIndex < leaseIndex, "No Such a Lease");
    //     _;
    // }

    // modifier checkTimestamp(uint _startTime, uint _endTime){
    //     require(_startTime < _endTime && _startTime > block.timestamp && _endTime > block.timestamp,
    //                                                                             "Timestamp Error");
    //     _;
    // }

    // function addAsset(address _lessor, string memory _assetAddress) public returns(uint){
    //     Asset memory _asset;
    //     _asset.lessor = _lessor;
    //     _asset.assetAddress = _assetAddress;
    //     assets.push(_asset);
    //     return assetIndex++;
    // }

    // function rent(uint _assetID, address _lenter, uint _startTime, uint _endTime)
    //         checkAssetExist(_assetID) checkTimestamp(_startTime, _endTime) public returns (uint){
    //     Lease memory _lease;
    //     _lease.assetID = _assetID;
    //     _lease.lenter = _lenter;
    //     _lease.startTime = _startTime;
    //     _lease.endTime = _endTime;
    //     leases.push(_lease);
    //     return leaseIndex++;
    // }

    // function breakLease(uint _leaseIndex) checkLeaseExist(_leaseIndex) public returns(uint){
    //     delete leases[_leaseIndex];
    //     return _leaseIndex;
    // }
}
