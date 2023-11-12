import { useState } from "react";

export function ListComplaints(props) {
    let { getComplaints, solveComp, owner } = props;
    let index = -1;
    let isOwner = false;

    let [complaints, setComplaints] = useState([])

    const gettingComplaints = async () => {
        const tempComplaints = await getComplaints();
        if (tempComplaints.length !== complaints.length) {
            setComplaints([...tempComplaints])
        }
        console.log(tempComplaints)
        isOwner = owner();
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (event.target.approve) {
            const id = event.target.approve.getAttribute("complaintid");
            await solveComp(id, true)
            alert("Approved!")
        }
        else if (event.target.deny) {
            const id = event.target.deny.getAttribute("complaintid")
            await solveComp(id, true)
            alert("Denied!")
        }
    }

    gettingComplaints();
    return <div>{complaints.map((complaint) => {
        { index++; }
        return <div className="row text-center border-bottom border-warning">
            <div className="col">
                <ul className="list-group">
                    <li className="list-group item">
                        Complaint About: {complaint.complainedAbout}, Result: {complaint.result ? "Yes" : "No"}, Ended: {complaint.ended ? "Yes" : "No"}
                    </li>
                    <li className="list-group item">
                        Descriptin: {complaint.description}
                    </li>
                    <li className="list-group item">
                        Lessor: {complaint.Lessor}, Renter: {complaint.renter}, LeaseID: {complaint.leaseID.toNumber()}
                    </li>
                </ul>
            </div>
            <div className="col-2 my-3">
                <form onSubmit={handleSubmit} >
                    <button name="approve" complaintid={index} className={complaint.ended || !isOwner ? "btn btn-success disabled" : "btn btn-success"}>
                        Approve
                    </button>
                </form>

            </div>
            <div className="col-2 my-3">
                <form onSubmit={handleSubmit}>
                    <button name="deny" complaintid={index} className={complaint.ended || !isOwner ? "btn btn-danger disabled" : "btn btn-danger"}>
                        Deny
                    </button>
                </form>

            </div>
        </div>
    })}</div>
}