
export function AddAsset(props) {
    const { addAsset } = props;
    const handleSubmit = async (event) => {
        event.preventDefault();
        const assetType = event.target.assetType.value;
        const rentable = event.target.rentable.value;
        const address = event.target.address.value;

        // send to the contract
        addAsset(assetType, rentable, address);
    }
    return (<form onSubmit={handleSubmit}>
        <div className="form-group">
            <label>Asset Type: </label>
            <input type="text" name="assetType"></input>
        </div>
        <div className="form-group mt-2">
            <label>Rentable:</label>
            <select name="rentable">
                <option value="true">Yes</option>
                <option value="false">No</option>
            </select>
        </div>
        <div className="form-group mt-2">
            <label>Address: </label>
            <input type="text" name="address"></input>
        </div >
        <button className="btn btn-primary mt-2" type="submit">ADD!</button>
    </form>)
}

