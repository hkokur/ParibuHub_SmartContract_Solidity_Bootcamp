import { useState } from "react";

export function ListApprovements(props) {
    let { getApprovements, approve } = props;
    let index = -1;

    let [approvements, setApprovements] = useState([])

    const gettingApprovements = async () => {
        const tempApprovements = await getApprovements();
        if (tempApprovements.length !== approvements.length) {
            setApprovements([...tempApprovements])
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (event.target.approve) {
            const id = event.target.approve.getAttribute("approveid");
            await approve(id, true)
            alert("Approved!")
        }
        else if (event.target.deny) {
            const id = event.target.deny.getAttribute("approveid")
            await approve(id, false)
            alert("Denied!")
        }
    }

    gettingApprovements();
    return (<div>{approvements.map((app) => {
        { index++; }
        return <div className="row text-center border-bottom border-warning">
            <div className="col">
                <ul className="list-group">
                    <li className="list-group item">
                        Lessor: {app.lessor}, Renter: {app.renter}, LeaseID: {app.leaseID.toNumber()}
                    </li>
                    <li className="list-group item">
                        Descriptin: {app.description}
                    </li>
                    <li className="list-group item">
                        Approved: {app.approve ? "Yes" : "No"}, Ended: {app.ended ? "Yes" : "No"}
                    </li>
                </ul>
            </div>
            <div className="col-2 my-3">
                <form onSubmit={handleSubmit} >
                    <button name="approve" approveid={index} className={app.ended ? "btn btn-success disabled" : "btn btn-success"}>
                        Approve {app.index}
                    </button>
                </form>

            </div>
            <div className="col-2 my-3">
                <form onSubmit={handleSubmit}>
                    <button name="deny" approveid={index} className={app.ended ? "btn btn-danger disabled" : "btn btn-danger"}>
                        Deny
                    </button>
                </form>

            </div>
        </div>
    })}
    </div>)
}