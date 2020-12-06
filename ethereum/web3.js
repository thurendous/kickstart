import Web3 from "web3";

// const web3 = new Web3(window.web3.currentProvider);
let web3;

if (typeof window !== "undefined" && typeof window.web3 !== "undefined") {
  // if we are in the browser and metamask is running
  web3 = new Web3(window.web3.currentProvider);
} else {
  // if we are on server *OR* the user is not runnning metamask
  const provider = new Web3.providers.HttpProvider(
    "https://rinkeby.infura.io/v3/f9df25172177433482878d4332669fff"
  );
  web3 = new Web3(provider);
}

export default web3;
