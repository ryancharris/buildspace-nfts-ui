import "./styles/App.css";
import twitterLogo from "./assets/twitter-logo.svg";
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import myEpicNft from "./utils/MyEpicNFT.json";

// Constants
const TWITTER_HANDLE = "ryan_c_harris";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = "https://testnets.opensea.io/assets";
// const TOTAL_MINT_COUNT = 50;
const CONTRACT_ADDRESS = "0xDB24bE6Fb6c5e4c6F3C165663203b02bBDA70B59";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [id, setId] = useState(null);

  useEffect(() => {
    checkIfWalletConnected();
    // eslint-disable-next-line
  }, []);

  const checkIfWalletConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Connect your MetaMask wallet!");
    } else {
      console.log("You are connected to MetaMask", ethereum);
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
      setupEventListener();
    } else {
      console.log("No authorized account found");
    }
  };

  const connectWallet = async () => {
    setConnecting(true);

    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      setupEventListener();
      setConnecting(false);
    } catch (err) {
      console.log(err);
      setConnecting(false);
    }
  };

  const askContractToMintNFT = async () => {
    try {
      setLoading(true);

      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );

        console.log("Going to pop wallet now to pay gas...");
        let nftTxn = await connectedContract.makeAnEpicNFT();

        console.log("Mining...please wait.");
        await nftTxn.wait();

        console.log(
          `Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
        );
        setLoading(false);
      } else {
        console.log("Ethereum object doesn't exist!");
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );

        // THIS IS THE MAGIC SAUCE.
        // This will essentially "capture" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber());

          setId(tokenId.toNumber());
        });

        console.log("Setup event listener!");
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const renderNotConnectedContainer = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={connectWallet}
    >
      Connect to Wallet
    </button>
  );

  const renderMintUi = () => {
    return (
      <button
        onClick={askContractToMintNFT}
        className="cta-button connect-wallet-button"
      >
        Mint NFT
      </button>
    );
  };

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">What Will Happen NFTs</p>
          <p className="sub-text">Tech predictions. General sillyness.</p>
          {!loading &&
            !connecting &&
            (currentAccount === ""
              ? renderNotConnectedContainer()
              : renderMintUi())}
          {!loading && connecting && (
            <p className="sub-text sub-text--small">Connecting...</p>
          )}
          {loading && !connecting && (
            <p className="sub-text sub-text--small">Loading...</p>
          )}
        </div>
        <div className="content-container">
          {id && (
            <div>
              <p className="sub-text">Last minted:</p>
              <div className="last-minted">
                <p className="sub-text sub-text--small">#{id}</p>
                <p className="sub-text sub-text--small">
                  <a
                    href={`${OPENSEA_LINK}/${CONTRACT_ADDRESS}/${id}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {`${CONTRACT_ADDRESS}/${id}`}
                  </a>
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
