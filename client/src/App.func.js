export default function App() {
    const contractAddress = "0x3497C5C65D21D208888Ecf7BA83eF8FadF3a820C";
    const abi = RentalABI.abi;
    const [provider, setProvider] = useState(null);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [signer, setSigner] = useState(null);

    async function connectToMetamask() {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const accounts = await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        setProvider(provider);
        setSelectedAddress(accounts[0]);
        setSigner(signer);
    }


    function connect() {
        if (!selectedAddress) {
            return (
                <button className="btn btn-primary" onClick={() => connectToMetamask()}>Connect to Metamask</button>
            )
        } else {
            // this.connectToRentalContract();
            return (
                < p className="text-success bg-light rounded" > Welcome: {selectedAddress}</p>
            );
        }
    }

    return (<div className="container m-5">
        <div className="row">
            <div className="col">
                {connect()}
            </div>
        </div>
        <div className="row mt-2">
            <h4>Add New Asset</h4>
            {/* <AddAsset
        addAsset={this.addAsset}
      /> */}
        </div>
        <div className="row mt-2">
            <h4>Assets</h4>
            <div>
                {/* {this.getAssetEvents()} */}
            </div>

        </div>

    </div >)



}