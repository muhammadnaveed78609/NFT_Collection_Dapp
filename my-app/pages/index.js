import Head from "next/head";
import Image from "next/image";
import { Inter } from "@next/font/google";
import styles from "../styles/Home.module.css";
import { providers, utils, Contract } from "ethers";
import Web3Modal from "web3modal";
import { NFT_Contractadd, abi } from "../../constants/constant";
import { useEffect, useRef, useState } from "react";
import { walletconnect } from "web3modal/dist/providers/connectors";
const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [WalletConnect, setWalletConnect] = useState(false);
  const [PreSaleStart, setPreSaleStart] = useState(false);
  const [PreSaleEnd, setPreSaleEnd] = useState(false);
  const [Loading, setLoadig] = useState(false);
  const [TokenIdsMinted, setTokenIdsMinted] = useState("0");
  const [isOwner, setIsOwner] = useState(false);
  const web3modalref = useRef();
  /*
      connectWallet: Connects the MetaMask wallet
    */
  const connectWallet = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // When used for the first time, it prompts the user to connect their wallet
      await getProviderOrSigner();
      setWalletConnect(true);
    } catch (error) {
      console.error(error);
    }
  };
  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3modalref.current.connect();
    const web3provider = new providers.Web3Provider(provider);
    // // If user is not connected to the Goerli network, let them know and throw an error
    // const { chainId } = await web3Provider.getNetwork();
    // if (chainId !== 5) {
    //   window.alert("Change the network to Goerli");
    //   throw new Error("Change network to Goerli");
    // }
    if (needSigner) {
      const signer = await web3provider.getSigner();
      return signer;
    }
    return web3provider;
  };
  /**
   * getOwner: calls the contract to retrieve the owner
   */
  const getOwner = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftcontract = await provider.Contract(
        NFT_Contractadd,
        abi,
        provider
      );
      const _owner = await nftcontract.owner();
      const signer = await getProviderOrSigner(true);
      let address = await signer.getAddress();
      if (address.toLowerCase() === _owner.toLowerCase()) {
        setIsOwner(true);
      }
    } catch (error) {
      console.error(error);
    }
  };
  /**
   * getTokenMinted: calls the contract to retrieve the owner
   */
  const getTokenMinted = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftcontract = await provider.Contract(
        NFT_Contractadd,
        abi,
        provider
      );
      const _getTokenMinted = await nftcontract.tokenIds();
      //_tokenIds is a `Big Number`. We need to convert the Big Number to a string
      setTokenIdsMinted(_getTokenMinted.toString());
    } catch (error) {
      console.error(error);
    }
  };
  /**
   * checkIfPresaleEnded: checks if the presale has ended by quering the `presaleEnded`
   * variable in the contract
   */
  const checkIfPresaleEnded = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftcontract = await provider.Contract(
        NFT_Contractadd,
        abi,
        provider
      );
      const _checkIfPresaleEnded = nftcontract.presaleEnded();
      // _presaleEnded is a Big Number, so we are using the lt(less than function) instead of `<`
      // Date.now()/1000 returns the current time in seconds
      // We compare if the _presaleEnded timestamp is less than the current time
      // which means presale has ended
      let hasend = _checkIfPresaleEnded.It(Math.floor(Date.now() / 1000));
      if (hasend) {
        setPreSaleEnd(true);
      } else {
        setPreSaleEnd(false);
      }
      return hasend;
    } catch (error) {
      console.error(error);
    }
  };
  /**
   * checkIfPresaleStarted: checks if the presale has started by quering the `presaleStarted`
   * variable in the contract
   */
  const checkIfPresaleStarted = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftcontract = await provider.Contract(
        NFT_Contractadd,
        abi,
        provider
      );
      const _checkIfPresaleStarted = nftcontract.presaleStarted();
      if (!_checkIfPresaleStarted) {
        await getOwner();
      }
      setPreSaleStart(_checkIfPresaleStarted);
      return _checkIfPresaleStarted;
    } catch (error) {
      console.error(error);
    }
  };
  /**
   * startPresale: starts the presale for the NFT Collection
   */
  const StartPresale = async () => {
    try {
      const signer = await getProviderOrSigner();
      const nftcontract = await signer.Contract(NFT_Contractadd, abi, signer);
      const _StartPresale = await nftcontract.startPresale();
      setLoadig(true);
      await _StartPresale.wait();
      setLoadig(false);
      await checkIfPresaleStarted();
    } catch (error) {
      console.error(error);
    }
  };
  /**
   * publicMint: Mint an NFT after the presale
   */
  const PublicMint = async () => {
    try {
      const signer = await getProviderOrSigner();
      const nftcontract = await signer.Contract(NFT_Contractadd, abi, signer);
      const _PublicMint = await nftcontract.mint({
        value: utils.parseEther("0.01"),
      });
      setLoadig(true);
      // value signifies the cost of one crypto dev which is "0.01" eth.
      // We are parsing `0.01` string to ether using the utils library from ethers.js
      await _PublicMint.wait();
      setLoadig(false);
      window.alert("You successfully minted a Falcon Dev!");
    } catch (error) {
      console.error(error);
    }
  };
  /**
   * presaleMint: Mint an NFT during the presale
   */
  const PresaleMint = async () => {
    try {
      const signer = await getProviderOrSigner();
      const nftcontract = await signer.Contract(NFT_Contractadd, abi, signer);
      const _PresaleMint = await nftcontract.presaleMint({
        value: utils.parseEther("0.01"),
      });
      setLoadig(true);
      await _PresaleMint.wait();
      setLoadig(false);
      window.alert("You successfully minted a Falcon Dev!");
    } catch (error) {
      console.error(error);
    }
  };
  // useEffects are used to react to changes in state of the website
  // The array at the end of function call represents what state changes will trigger this effect
  // In this case, whenever the value of `walletConnected` changes - this effect will be called
  useEffect(async () => {
    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    if (!WalletConnect) {
      // Assign the Web3Modal class to the reference object by setting it's `current` value
      // The `current` value is persisted throughout as long as this page is open
      web3modalref.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
      // Check if presale has started and ended
      const _presaleifstarted = await checkIfPresaleStarted();
      if (_presaleifstarted) {
        checkIfPresaleEnded();
      }
      getTokenMinted();
      // Set an interval which gets called every 5 seconds to check presale has ended
      const PresaleInterval = setInterval(async () => {
        const _presaleifstarted = await checkIfPresaleStarted();
        if (_presaleifstarted) {
          const _Presaleneded = await checkIfPresaleEnded();
          if (_Presaleneded) {
            clearInterval(PresaleInterval);
          }
        }
      }, 5000);
      // set an interval to get the number of token Ids minted every 5 seconds
      setInterval(async function () {
        await getTokenMinted();
      }, 5000);
    }
  }, [WalletConnect]);
  /*
      renderButton: Returns a button based on the state of the dapp
    */
  const RendorButton = async () => {
    if (!walletconnect) {
      return (
        <button className={styles.button} onClick={connectWallet}>
          Connect Your Wallet
        </button>
      );
    }
    // If we are currently waiting for something, return a loading button
    if (Loading) {
      return <button className={styles.button}> Loading......</button>;
    }
    // If connected user is the owner, and presale hasnt started yet, allow them to start the presale
    if (isOwner && !PreSaleStart) {
      return (
        <button className={styles.button} onClick={startPresale}>
          Start Presale!
        </button>
      );
    }
    if (!PreSaleStart) {
      return (
        <div>
          <div className={styles.description}>Presale hasnt started!</div>
        </div>
      );
    }
    if (PreSaleStart && !PreSaleEnd) {
      return (
        <div>
          <div className={styles.description}>
            Presale has started!!! If your address is whitelisted, Mint a Crypto
            Dev 🥳
          </div>
          <button className={styles.button} onClick={PresaleMint}>
            Presale Mint 🚀
          </button>
        </div>
      );
    }

    // If presale started and has ended, its time for public minting
    if (PreSaleStart && PreSaleEnd) {
      return (
        <button className={styles.button} onClick={PublicMint}>
          Public Mint 🚀
        </button>
      );
    }
  };
  return (
    <>
      <div>
        <Head>
          <title>Crypto Devs</title>
          <meta name="description" content="Whitelist-Dapp" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className={styles.main}>
          <div>
            <h1 className={styles.title}>Welcome to Falcon Devs!</h1>
            <div className={styles.description}>
              Its an NFT collection for developers in Crypto.
            </div>
            <div className={styles.description}>
              {TokenIdsMinted}/20 have been minted
            </div>
            {RendorButton()}
          </div>
          <div>
            <img className={styles.image} src="cryptodevs/0.svg" />
          </div>
        </div>

        <footer className={styles.footer}>
          Made with &#10084; by Falcon Devs
        </footer>
      </div>{" "}
    </>
  );
}
