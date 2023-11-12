const { expect } = require("chai");
const { ethers } = require("hardhat");
const { describe } = require("node:test");



describe("AdvanceRental", () => {
    let Rental, rental, owner, addr1, addr2, addr3;
    beforeEach(async () => {
        Rental = await ethers.getContractFactory("AdvanceRental");
        rental = await Rental.deploy();
        [owner, addr1, addr2, addr3, _] = await ethers.getSigners()
    });

    describe("Deployment", () => {
        it("Should set the right owner", async () => {
            expect(await rental.owner()).to.equal(owner.address);
        })
    });


    describe("Add Assets", () => {
        it("Should add new asset", async () => {
            const tx = await rental.connect(addr1).addAsset("home", true, "Maltepe/Istanbul");
            const rc = await tx.wait();
            const event = rc.events.find(event => event.event === 'addedAsset');
            const [lessor, id] = event.args;
            expect(id).to.equal(0);
            expect(lessor).to.equal(addr1.address);
        });
    });

    describe("Rent the asset", () => {
        it("Should rent the asset", async () => {
            // adding a asset
            const tx = await rental.connect(addr1).addAsset("home", true, "Maltepe/Istanbul")
            const rc = await tx.wait()
            const event = rc.events.find(event => event.event == "addedAsset");
            const [lessor, assetID] = event.args;
            // renting the asset
            const blockNumBefore = await ethers.provider.getBlockNumber();
            const blockBefore = await ethers.provider.getBlock(blockNumBefore);
            const blockTime = blockBefore.timestamp;

            const txx = await rental.connect(addr2).rent(lessor, assetID, blockTime + 60, blockTime + 86400)
            const rcc = await txx.wait()
            const eventt = rcc.events.find(event => event.event === "addedRent");
            const [renter, leaseID] = eventt.args;
            // test the results
            expect(renter).to.equal(addr2.address);
            expect(leaseID).to.equal(0);
        })
    })

    describe("Canceling the Lease", () => {
        it("Should be cancel the lease", async () => {
            // adding a asset
            const tx = await rental.connect(addr1).addAsset("home", true, "Maltepe/Istanbul");
            const rc = await tx.wait();
            const event = rc.events.find(event => event.event == "addedAsset");
            const [lessor, assetID] = event.args;
            // renting the asset
            const blockNumBefore = await ethers.provider.getBlockNumber();
            const blockBefore = await ethers.provider.getBlock(blockNumBefore);
            const blockTime = blockBefore.timestamp;

            const txx = await rental.connect(addr2).rent(lessor, assetID, blockTime + 60, blockTime + 86400)
            const rcc = await txx.wait()
            const eventt = rcc.events.find(event => event.event === "addedRent");
            const [renter, leaseID] = eventt.args;
            // Cancel the lease
            const txxx = await rental.connect(addr2).breakLease(renter, lessor, leaseID);
            const rccc = await txxx.wait()
            const eventtt = rccc.events.find(event => event.event === "breakedLease");
            const [renterr, leaseIDD, status] = eventtt.args;

            // test the canceling
            expect(renterr).to.equal(renter);
            expect(leaseIDD).to.equal(leaseID);
            expect(status).to.equal(true);
        });
        it("Should not be cancel the lease", async () => {
            // adding a asset
            const tx = await rental.connect(addr1).addAsset("home", true, "Maltepe/Istanbul");
            const rc = await tx.wait();
            const event = rc.events.find(event => event.event == "addedAsset");
            const [lessor, assetID] = event.args;
            // renting the asset
            const blockNumBefore = await ethers.provider.getBlockNumber();
            const blockBefore = await ethers.provider.getBlock(blockNumBefore);
            const blockTime = blockBefore.timestamp;

            const txx = await rental.connect(addr2).rent(lessor, assetID, blockTime + 60, blockTime + 2692000)
            const rcc = await txx.wait()
            const eventt = rcc.events.find(event => event.event === "addedRent");
            const [renter, leaseID] = eventt.args;
            // can't cancel the lease
            const txxx = await rental.connect(addr2).breakLease(renter, lessor, leaseID);
            const rccc = await txxx.wait()
            const eventtt = rccc.events.find(event => event.event === "breakedLease");
            const [renterr, leaseIDD, status] = eventtt.args;
            const eventttt = rccc.events.find(event => event.event === "approvement")
            const [whom, approvementID, ended] = eventttt.args;

            // test the canceling
            expect(renterr).to.equal(renter);
            expect(leaseIDD).to.equal(leaseID);
            expect(status).to.equal(false);
            expect(whom).to.equal(addr1.address);
            expect(approvementID).to.equal(0);
            expect(ended).to.equal(false);
        });
    });

    describe("Calling the lease and Approvement stages", () => {
        it("Should approve the broken lease by renter", async () => {
            // adding a asset
            const tx = await rental.connect(addr1).addAsset("home", true, "Maltepe/Istanbul");
            const rc = await tx.wait();
            const event = rc.events.find(event => event.event == "addedAsset");
            const [lessor, assetID] = event.args;
            // renting the asset
            const blockNumBefore = await ethers.provider.getBlockNumber();
            const blockBefore = await ethers.provider.getBlock(blockNumBefore);
            const blockTime = blockBefore.timestamp;

            const txx = await rental.connect(addr2).rent(lessor, assetID, blockTime + 60, blockTime + 2692000)
            const rcc = await txx.wait()
            const eventt = rcc.events.find(event => event.event === "addedRent");
            const [renter, leaseID] = eventt.args;
            // can't cancel the lease
            const txxx = await rental.connect(addr2).breakLease(renter, lessor, leaseID);
            const rccc = await txxx.wait()
            const eventtt = rccc.events.find(event => event.event === "breakedLease");
            const [, , status] = eventtt.args;
            const eventttt = rccc.events.find(event => event.event === "approvement")
            const [whom, approvementID, ended] = eventttt.args;
            expect(status).to.equal(false);
            expect(ended).to.equal(false);

            // approve the broken lease by lesor
            const txxxx = await rental.connect(addr1).approve(approvementID, true);
            const rcccc = await txxxx.wait();
            const eventtttt = rcccc.events.find(event => event.event == "approvement");
            const [whomm, approvementIDD, endedd] = eventtttt.args;

            // test the results
            expect(whomm).to.equal(whom);
            expect(approvementID).to.equal(approvementIDD);
            expect(endedd).to.equal(true);
            // check the lease status
            const lease = await rental.leases(renter, leaseID);
            expect(lease.status).to.equal(false);
        });
    });

    describe("Complaints", () => {
        it("Should complain against the lessor by renter", async () => {
            // adding a asset
            const tx = await rental.connect(addr1).addAsset("home", true, "Maltepe/Istanbul");
            const rc = await tx.wait();
            const event = rc.events.find(event => event.event == "addedAsset");
            const [lessor, assetID] = event.args;
            // renting the asset
            const blockNumBefore = await ethers.provider.getBlockNumber();
            const blockBefore = await ethers.provider.getBlock(blockNumBefore);
            const blockTime = blockBefore.timestamp;

            const txx = await rental.connect(addr2).rent(lessor, assetID, blockTime + 60, blockTime + 2692000)
            const rcc = await txx.wait()
            const eventt = rcc.events.find(event => event.event === "addedRent");
            const [renter, leaseID] = eventt.args;

            // complain the lessor
            const txxx = await rental.connect(addr2).complain(lessor, lessor, renter, leaseID, "Lessor owner does not cover renovation costs");
            const rccc = await txxx.wait();
            const eventtt = rccc.events.find(event => event.event == "addedComplaint");
            const [complainedAbout, description, complaintIndex, ended] = eventtt.args;
            expect(complainedAbout).to.equal(lessor);
            expect(description).to.equal("Lessor owner does not cover renovation costs");
            expect(complaintIndex).to.equal(0);
            expect(ended).to.equal(false);

            // solve by owner(lessor will be banned)
            await rental.connect(owner).complaintSolver(complaintIndex, true);
            await expect(await rental.isblacklisted(lessor)).to.equal(true);

            // trying to add new asset
            await expect(rental.connect(addr1).addAsset("home", true, "Maltepe/Istanbul")).to.be.revertedWith('user is in blacklist');
        });
        it("Should complain against the renter by lessor", async () => {
            // adding a asset
            const tx = await rental.connect(addr1).addAsset("home", true, "Maltepe/Istanbul");
            const rc = await tx.wait();
            const event = rc.events.find(event => event.event == "addedAsset");
            const [lessor, assetID] = event.args;
            // renting the asset
            const blockNumBefore = await ethers.provider.getBlockNumber();
            const blockBefore = await ethers.provider.getBlock(blockNumBefore);
            const blockTime = blockBefore.timestamp;

            const txx = await rental.connect(addr2).rent(lessor, assetID, blockTime + 60, blockTime + 2692000)
            const rcc = await txx.wait()
            const eventt = rcc.events.find(event => event.event === "addedRent");
            const [renter, leaseID] = eventt.args;

            // complain the renter
            const txxx = await rental.connect(addr1).complain(renter, lessor, renter, leaseID, "Renter don't pay the rent");
            const rccc = await txxx.wait();
            const eventtt = rccc.events.find(event => event.event == "addedComplaint");
            const [complainedAbout, description, complaintIndex, ended] = eventtt.args;
            expect(complainedAbout).to.equal(renter);
            expect(description).to.equal("Renter don't pay the rent");
            expect(complaintIndex).to.equal(0);
            expect(ended).to.equal(false);

            // solve by owner(renter will be banned)
            await rental.connect(owner).complaintSolver(complaintIndex, true);
            await expect(await rental.isblacklisted(renter)).to.equal(true);

            // trying to add new asset
            await expect(rental.connect(addr2).rent(lessor, assetID, blockTime + 60, blockTime + 2692000)).to.be.revertedWith('user is in blacklist');
        })

    });
})