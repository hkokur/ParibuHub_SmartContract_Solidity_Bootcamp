import React, { Component } from "react";
// import { useState } from "react";
import { ethers } from "ethers";
import RentalABI from "./AdvanceRental.json";

import { AddAsset } from "./components/addAsset";
import { ListAssets } from "./components/listAssets";
import { ListLeases } from "./components/listLeases";
import { ListApprovements } from "./components/listApprovements";
import { ListComplaints } from "./components/listComplaints";



export default class App extends Component {
  state = {
    contractAddress: "0x02bc5679361c6f73891cfaF845a521AC6aA61089",
    abi: RentalABI.abi,
    events: [],
  }

  componentDidUpdate() {
    if (this.state.provider) {
      this.getEvents().then(
        events => {
          if (events && events.length > this.state.events.length) {
            this.setState({ events: events })
          }
        }
      );
    }
  }

  async connectToMetamask() {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const accounts = await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    this.setState({ selectedAddress: accounts[0], provider, signer, update: this.state.update + 1 })
  }

  async connectToRentalContract() {
    const { contractAddress, signer, provider, abi } = this.state;
    let rentalContract = new ethers.Contract(contractAddress, abi, provider);
    rentalContract = rentalContract.connect(signer);
    return rentalContract;
  }

  getEvents = async () => {
    const contract = await this.connectToRentalContract();
    const events = await contract.queryFilter("*");
    return events
  }

  getAsset = async (lessor, assetID) => {
    const contract = await this.connectToRentalContract();
    const asset = await contract.assets(lessor, assetID)
    return asset
  }

  addAsset = async (kind, status, assetAddress) => {
    const rentalContract = await this.connectToRentalContract();
    const assetID = await rentalContract.addAsset(kind, status, assetAddress);
    return assetID;
  }

  rent = async (lessor, assetID, startTime, endTime) => {
    const rentalContract = await this.connectToRentalContract();
    const leaseID = await rentalContract.rent(lessor, assetID, startTime, endTime);
    return leaseID;
  }

  getLease = async (renter, leaseID) => {
    const contract = await this.connectToRentalContract();
    const lease = await contract.leases(renter, leaseID);
    return lease;
  }

  breakLease = async (renter, lessor, leaseID) => {
    const rentalContract = await this.connectToRentalContract();
    const result = await rentalContract.breakLease(renter, lessor, leaseID);
    return result
  }

  createComplaint = async (complainAbout, lessor, renter, leaseID, description) => {
    const rentalContract = await this.connectToRentalContract();
    await rentalContract.complain(complainAbout, lessor, renter, leaseID, description);
  }

  getApprovements = async () => {
    const rentalContract = await this.connectToRentalContract();
    let approvements = []
    let index = 0
    while (true) {
      try {
        let approve = await rentalContract.approvements(this.state.selectedAddress, index);
        approvements.push(approve)
        index++;
      }
      catch (e) {
        break;
      }

    }
    return approvements
  }

  approve = async (approveid, result) => {
    const rentalContract = await this.connectToRentalContract();
    await rentalContract.approve(approveid, result);
  }

  getComplaints = async () => {
    const rentalContract = await this.connectToRentalContract();
    let complaints = []
    let index = 0
    while (true) {
      try {
        let complaint = await rentalContract.complaints(index);
        complaints.push(complaint)
        index++;
      }
      catch (e) {
        break;
      }

    }
    return complaints
  }

  solveComp = async (complaintIndex, result) => {
    const rentalContract = await this.connectToRentalContract();
    await rentalContract.complaintSolver(complaintIndex, result);
  }

  connect() {
    if (!this.state.selectedAddress) {
      return (
        <button className="btn btn-primary" onClick={() => this.connectToMetamask()}>Connect to Metamask</button>
      )
    } else {
      return (
        < p className="text-success bg-light rounded" > Welcome: {this.state.selectedAddress}</p>
      );
    }
  }

  owner = async () => {
    const rentalContract = await this.connectToRentalContract();
    let signer = this.state.signer;
    let isOwner = false;
    if (signer) {
      isOwner = (await rentalContract.owner()).toLowerCase() === this.state.selectedAddress.toLowerCase() ? true : false;

    }
    return isOwner
  }

  render() {
    return (<div className="container m-5">
      <div className="row">
        <p>Manually refresh the page to see state changes</p>
      </div>
      <div className="row">
        <div className="col">
          {/* <h4>
            You are : {this.state.selectedAddress ? this.state.selectedAddress : "None"}
          </h4> */}
        </div>
        {this.connect()}
      </div>
      <div className="row mt-2 ">
        <h4 className="">Add New Asset</h4>
        <AddAsset
          addAsset={this.addAsset}
        />
      </div>
      <div className="row mt-2">
        <h4 className="text-center">Rentable Assets</h4>
        <div>
          <ListAssets
            events={this.state.events}
            getAsset={this.getAsset}
            rent={this.rent}
            selectedAddress={this.state.selectedAddress}
            provider={this.state.provider}
          />
        </div>
      </div>
      <div className="row mt-2">
        <h4 className="text-center">
          Active Leases
        </h4>
        <ListLeases
          events={this.state.events}
          getLease={this.getLease}
          selectedAddress={this.state.selectedAddress}
          breakLease={this.breakLease}
          createComplaint={this.createComplaint}
        />
      </div>
      <div className="row mt-2">
        <h4 className="text-center">
          Approvements
        </h4>
        <ListApprovements
          getApprovements={this.getApprovements}
          approve={this.approve}
        />
      </div>
      <div className="row mt-2">
        <h4 className="text-center">
          Complaints
        </h4>
        <ListComplaints
          getComplaints={this.getComplaints}
          solveComp={this.solveComp}
          owner={this.owner}
        />
      </div>

    </div >)
  }
}