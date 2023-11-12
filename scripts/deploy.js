async function main() {
  const AdvanceRental = await ethers.getContractFactory("AdvanceRental");
  const advance_rental = await AdvanceRental.deploy();
  console.log("Contract Deployed to Address:", advance_rental.address);
}
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
