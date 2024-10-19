import { Container } from "react-bootstrap";
import { ethers } from "ethers";

// Components
import Navigation from "./Navigation";
import Info from "./Info";
// import { EDIT_DISTANCE_THRESHOLD } from "hardhat/internal/constants";
import { useEffect, useState } from "react";



// Will use React functional components and hooks to build the front end of the dapp.
function App() {

  // React hook to manage the state of the account variable. Returns a state variable and a function to update it with a null default value.
  const [account, setAccount] = useState(null);

  // account -> variable to store the current account address
  // setAccount() -> function to update the account variable
  // null -> initial value of the account variable

  const loadBlockchainData = async () => {
    // window.ethereum is the Ethereum object injected into the browser from MetaMask.
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    console.log(provider);

    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    // format properly (checksum format)
    const account = ethers.utils.getAddress(accounts[0]);
    // Add to state
    setAccount(account);
  }
  
  // Hook used in functional components to run code after the component has been rendered.
  useEffect(() => {
    loadBlockchainData();
  });

  return (
    <Container>
      <Navigation />
        <hr />
        {account && (
          <Info account={account} />
        )}
        
    </Container>
  );
}

export default App;