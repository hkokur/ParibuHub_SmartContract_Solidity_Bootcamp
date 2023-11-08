const { expect } = require("chai");
const { ethers } = require("hardhat");



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
        // it("Should add new asset", async () => {
        //     let tx = await rental.connect(addr1).to.Rental.addAsset();
        //     const rc = await tx.wait();
        //     const event = rc.events.find(event => event.event === "addAsset");
        //     const [lessor, id] = event.args;
        //     console.log(lessor, id);


        //     // const txData = rentel.interface.encodeFunctionData("addAsset")
        //     // const txResult = provider.call("home", true, "Maltepe/Istanbul")
        //     // console.log(Rental.connect(addr1).callStatic.addAsset("home", true, "Maltepe/Istanbul"))
        //     // expect(rental.connect(addr1).addAsset("home", true, "Maltepe/Istanbul")).to.equal(Number(0));
        // })
        it("Should add new asset", async () => {
            const tx = await rental.connect(addr1).addAsset("home", true, "Maltepe/Istanbul");
            console.log("");
            const rc = await tx.wait();
            console.log(rc.events)

            const event = rc.events.find(event => event.event === 'addedAsset');
            const [lessor, id] = event.args;
            console.log(lessor, id);
        });
    });






})