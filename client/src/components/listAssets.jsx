import { useState } from "react";

export function ListAssets(props) {
    let { events, getAsset, selectedAddress, rent, provider } = props;
    events = events.filter((e) => e.event === "addedAsset");
    let [assets, setAssets] = useState([])

    const gettingAsset = async () => {
        if (events.length === assets.length) {
            return;
        }
        const tempAssets = []
        for (let i = 0; i < events.length; i++) {
            const lessor = events[i].args.lessor;
            const assetID = events[i].args.assetID.toNumber();
            await getAsset(lessor, assetID).then(async (a) => {
                const asset = {
                    "type": a[0],
                    "status": a[1],
                    "address": a[2],
                    "lessor": lessor,
                    "assetID": assetID,
                }
                tempAssets.push(asset)
            })
        }
        if (tempAssets.length !== assets.length) {
            setAssets([...tempAssets])
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        const days = event.target.days.value;
        const lessor = event.target.submit.getAttribute("lessor");
        const assetID = event.target.submit.getAttribute("assetid");
        const currentBlock = await provider.getBlockNumber();
        const blockTimestamp = (await provider.getBlock(currentBlock)).timestamp
        const startTime = blockTimestamp + 60
        const endTime = blockTimestamp + 60 + days * 24 * 60 * 60
        await rent(lessor, assetID, startTime, endTime)
    }

    gettingAsset();
    return (<div className="text-center">
        <h4 className="badge bg-warning">Lessor and Renter can not be same!</h4>
        <p>Renting will be started in 1 min after payment. </p>
        <ul className="list-group">
            {assets.map((asset) => {
                return (
                    <div className="row mt-2">
                        <div className="col-8">
                            <li key={asset.lessor + asset.assetID}>
                                <ul className="list-group justify-content-center">
                                    <li className="list-group item">
                                        Lessor : {asset.lessor}, AssetID : {asset.assetID}
                                    </li>
                                    <li className="list-group item">
                                        Type: {asset.type}
                                    </li>
                                    <li className="list-group item">
                                        Rentable: {asset.status ? "Yes" : "No"}
                                    </li>
                                    <li className="list-group item">
                                        Location : {asset.address}
                                    </li>
                                </ul>
                            </li>
                        </div>
                        <div className="col-4">
                            <form className="form-group" onSubmit={handleSubmit}>
                                <input className="form-control" name="days" type="number" min="1" placeholder="days"></input>
                                <button name="submit" lessor={asset.lessor} assetid={asset.assetID} className={asset.lessor.toLowerCase() === selectedAddress.toLowerCase() || asset.status === false ? "btn btn-secondary disabled mt-2" : "btn btn-success mt-2"} type="submit">Rent</button>
                            </form>
                        </div>
                    </div>
                )
            })}
        </ul>
    </div>
    )
}