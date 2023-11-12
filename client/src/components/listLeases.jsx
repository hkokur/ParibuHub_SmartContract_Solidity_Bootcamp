import { useState } from "react";

export function ListLeases(props) {
    let { getLease, events, selectedAddress, breakLease, createComplaint } = props;
    events = events.filter((e) => e.event === "addedRent")

    let [leases, setleases] = useState([])

    const gettingLeases = async () => {
        if (events.length === leases.length) {
            return;
        }
        const templeases = []
        for (let i = 0; i < events.length; i++) {
            const renter = events[i].args.renter;
            const leaseID = events[i].args.leaseID.toNumber();
            await getLease(renter, leaseID).then(async (l) => {
                const lease = {
                    "lessor": l[0],
                    "assetID": l[1].toNumber(),
                    "status": l[2],
                    "startTime": l[3].toNumber(),
                    "endTime": l[4].toNumber(),
                    "renter": renter,
                    "leaseID": leaseID,
                }
                templeases.push(lease)
            })
        }
        if (templeases.length !== leases.length) {
            setleases([...templeases])
        }
    }
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (event.target.breakLease !== undefined) {
            const renter = event.target.breakLease.getAttribute("renter");
            const lessor = event.target.breakLease.getAttribute("lessor");
            const leaseid = event.target.breakLease.getAttribute("leaseid");
            await breakLease(renter, lessor, leaseid)
            alert("Rent cancellation has been processed!")
        }
        else if (event.target.createComplaint !== undefined) {
            const renter = event.target.createComplaint.getAttribute("renter");
            const lessor = event.target.createComplaint.getAttribute("lessor");
            const leaseid = event.target.createComplaint.getAttribute("leaseid");
            const description = event.target.description.value;
            if (renter.toLowerCase() === selectedAddress.toLowerCase()) {
                await createComplaint(lessor, lessor, renter, leaseid, description)
            }
            else if (lessor.toLowerCase() === selectedAddress.toLowerCase()) {
                await createComplaint(renter, lessor, renter, leaseid, description)
            }
            alert("Your complaint successfully be added!")
        }
    }

    gettingLeases();
    return (<div>
        <ul className="list-group">
            {leases.map((lease) => {
                return (
                    <div className="row text-center border-bottom border-warning">
                        <div className="col">
                            <li className="list-group item">
                                Lessor : {lease.lessor}, AssetID : {lease.assetID}
                            </li>
                            <li className="list-group item badge bg-success">
                                Renter : {lease.renter.toLowerCase() === selectedAddress.toLowerCase() ? "you" : selectedAddress.toLowerCase()}, LeaseID : {lease.leaseID}
                            </li>
                            <li className="list-group item">
                                Status: {lease.status === true ? "active" : "passive"}, Start Time: {lease.startTime}, End Time: {lease.endTime}
                            </li>
                        </div>
                        <div className="col-2 my-3">
                            <form className="form-group" onSubmit={handleSubmit} >
                                <button name="breakLease" renter={lease.renter} lessor={lease.lessor} leaseid={lease.leaseID} className={lease.status && (selectedAddress.toLowerCase() === lease.renter.toLowerCase() || selectedAddress.toLowerCase() === lease.lessor.toLowerCase()) ? "btn btn-danger" : "btn btn-secondary disabled"}  >Break Lease</button>
                            </form>
                        </div>
                        <div className="col-2 my-3">
                            <form className="form-group" onSubmit={handleSubmit}>
                                <input type="text" name="description" placeholder="complain about..."></input>
                                <button name="createComplaint" renter={lease.renter} lessor={lease.lessor} leaseid={lease.leaseID} className={lease.status && (selectedAddress.toLowerCase() === lease.renter.toLowerCase() || selectedAddress.toLowerCase() === lease.lessor.toLowerCase()) ? "btn btn-warning mt-2" : "btn btn-secondary disabled mt-2"}>Create Complaint</button>
                            </form>
                        </div>
                    </div>

                )
            })}
        </ul>
    </div>)
}