import { useState, useEffect } from "react";
import Head from "next/head";
import Web3 from "web3";
import lotteryContract from "../blockchain/lottery";
import styles from "../styles/Home.module.css";
import "bulma/css/bulma.css";

export default function Home() {
  // lets create a state variable for web3.
  const [web3, setweb3] = useState();
  const [address, setAddress] = useState();
  // state variabl for the localcontract.
  const [lcContract, setLcContract] = useState();
  // state variabl for the pot only.
  const [lotteryPot, setLotteryPot] = useState();
  // state variable for no of players
  const [lotteryPlayers, setPlayers] = useState([]);
  // here the state varibale is there to hold the history information.
  const [lotteryHistory, setLotteryHistory] = useState([]);
  // state variable for lottery id
  const [lotteryId, setLotteryId] = useState();
  // state variable for errors.
  const [error, setError] = useState("");
  // state variable for picking winner
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    // if (
    //   typeof window !== "undefined" &&
    //   typeof window.ethereum !== "undefined"
    // ) {    
          // window.ethereum.on('accountsChanges', async() => {
          // const accounts = await web3.eth.getAccounts()
          // setAddress(accounts[0])
          // })
      //  }
    
    updateState();
  }, [lcContract]);

  const updateState = () => {
    if (lcContract) getPot();
    if (lcContract) getPlayers();
    if (lcContract) getLotteryId();
  }
  
  
  // once the react component are loaded, we will use the useEffect.
  // useEffect(() => {
  //   // we need to check if the local instance of the contract is availabe or not.
  //   if (lcContract) getPot(); // checking if the local instace of the contrac is availabe.
  //   if (lcContract) getPlayers();
  //   if (lcContract) getLotteryId();
  // }),
  //   [lcContract]; // these are the parameters of the useEffect.

  // creating a handler to get the value of the total value.
  const getPot = async () => {
    //console.log("hello i am getting called")
    // pot is a variable.
    // the method will hold the methods of all the methods in our abi file.
    // here we are reading the balance.
    const pot = await lcContract.methods.getBalance().call(); // this if for the read only.
    //here the pote value is coming from our deployed smart contract.
    setLotteryPot(web3.utils.fromWei(pot, "ether"));
  };

  //creating the players
  const getPlayers = async () => {
    //console.log("hello i am getting called")
    const players = await lcContract.methods.getPlayers().call(); // this if for the read only.
    //here the pote value is coming from our deployed smart contract.
    setPlayers(players);
  };

  // function to get the history of the contracts.
  const getHistory = async (id) => {
    setLotteryHistory([]);
    for (let i = parseInt(id); i > 0; i--) {
      const winnerAddress = await lcContract.methods.lotteryHistory(i).call();
      const historyObj = {};
      historyObj.id = i;
      historyObj.address = winnerAddress;
      setLotteryHistory((lotteryHistory) => [...lotteryHistory, historyObj]);
    }
  };

  // const getlotteryId = async () => {
  //   const lotteryId = await lcContract.methods.lotteryId().call(); // we are here just reading from the blockchain
  //   //console.log(lotteryId);
  //    setLotteryId(lotteryId);
  //   await getHistory(lotteryId);

  // };
  const getLotteryId = async () => {
    const lotteryId = await lcContract.methods.lotteryId().call();
    setLotteryId(lotteryId);
    await getHistory(lotteryId);
    // console.log(JSON.stringify(lotteryHistory));
  };

  // now lets link the button.
  const enterLotteryHandler = async () => {
    try {
      await lcContract.methods.enter().send({
        from: address,
        value: "15000000000000000",
        gas: 300000,
        gasPrice: null,
      }); // this is a send transcation to the blockchain.
    } catch (err) {
      setError(err.message);
    }
  };
  // here we are going to create a winnerahndler function.

  const pickWinnerHandler = async () => {
    setError('')
    console.log(`addressfrom pic winner:: ${address}`)
    try {
      await lcContract.methods.payWinner().send({
        from: address,
        gas: 300000,
        gasPrice: null,
      }); // this is a send transcation to the blockchain.
      const winnerAddress = await lcContract.methods.lotteryHistory(lotteryId).call();
      setSuccessMsg(`the winner is ${winnerAddress}`);
    } catch (err) {
      setError(err.message);
    }
  };

  // here we are trying to put a function to call the metamask.
  // check if are also in the browser environment.
  const connnectWalletHandler = async () => {
    setError(""); //this will make the error message set to empty string
    // lets check if metamask is connected or not. metamask ethereum object is inject under the browser object.
    if (
      typeof window !== "undefined" &&
      typeof window.ethereum !== "undefined"
    ) {
      try {
        // we are requsting a wallet connection.
        // since it a asynce function we need to use the await.
        await window.ethereum.request({ method: "eth_requestAccounts" }); // calling the request to the etherum wallet provider.
        //lets create web3 instance. & set this to state.
        const web3 = new Web3(window.ethereum);
        // save web3 instance in react state.
        setweb3(web3);
        // gets list of accounts
        const accounts = await web3.eth.getAccounts();
        setAddress(accounts[0]); // this going to be array of accounts.

        // creating local contract copy
        const lc = lotteryContract(web3);
        setLcContract(lc); // this will set the contrat in react state, and now we can use to anywhere we want.
        // so now we can use lcContract as contract instance and use it. as we have used it in useEffect.
        
        window.ethereum.on('accountsChanges', async() => {
          const accounts = await web3.eth.getAccounts()
          setAddress(accounts[0])
          }) 
     
     
     
      } catch (err) {
        setError(err.message);
      }
    } else {
      // Metamask is not installed.
      console.log("Please install metamask");
    }
  };

  return (
    <div>
      <Head>
        <title>Create Ethereum lottery</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <nav className="navbar mt-4 mb-4">
          <div className="container">
            <div className="navbar-brand">
              <h1> Ether Lottery</h1>
            </div>
            <div className="navbar-end">
              <button
                onClick={connnectWalletHandler}
                className="button is-link">
                {" "}
                Connect Metsmask wallet
              </button>
            </div>
          </div>
        </nav>

        <div className="container">
          <section className="mt-5">
            <div className="columns">
              <div className="column is-two-third">
                <section className="mt-5">
                  <p> Enter the lottery by sending 0.01 Ether</p>
                  <button
                    onClick={enterLotteryHandler}
                    className="button is-link is-large is-light mt-3">
                    Play Now
                  </button>
                </section>
                <section className="mt-6">
                  <p>
                    {" "}
                    <b> Admin Only :</b> Pick Winner
                  </p>
                  <button
                    onClick={pickWinnerHandler}
                    className="button is-primary is-large is-light mt-3">
                    Pick Winner
                  </button>
                </section>

                <section>
                  <div className="container has-text-danger mt-6">
                    <p>{error}</p>
                  </div>
                </section>
                <section>
                  <div className="container has-text-success mt-6">
                    <p>{successMsg} </p>
                  </div>
                </section>
              </div>
              <div className={`${styles.lotteryinfo}column is-one-thirds`}>
                <section className="mt-5">
                  <div className="card">
                    <div className="card-content">
                      <div className="content">
                        <h3>Lottery History</h3>
                        {
                        (lotteryHistory &&
                          lotteryHistory.length > 0) &&
                          lotteryHistory.map(item => {
                            if(lotteryId != item.id){return (
                              <div className="history-entry mt-4" key={item.id}>
                                <div> Lottery #{item.id} winner :</div>
                                <div>
                                  <a
                                    href={`https://etherscan.io/address/${item.address}`} target="_blank">
                                    {item.address}
                                  </a>
                                </div>
                              </div>
                            );
                            }
                          })}
                      </div>
                    </div>
                  </div>
                </section>
                <section className="mt-5">
                  <div className="card">
                    <div className="card-content">
                      <div className="content">
                        <h2>Players({lotteryPlayers.length})</h2>
                        <ul className="ml-0">
                          {lotteryPlayers &&
                            lotteryPlayers.length > 0 &&
                            lotteryPlayers.map((player, index) => {
                              return (
                                <li key={`${player}-${index}`}>
                                  <a
                                    href={`https://etherscan.io/address/${player}`}
                                    target="_blank">
                                    {player}
                                  </a>
                                </li>
                              );
                            })}
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>
                <section className="mt-5">
                  <div className="card">
                    <div className="card-content">
                      <div className="content">
                        <h3>POT</h3>
                        <p>{lotteryPot} Ether</p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>&copy; 2022 Vandy the Block Explorer</p>
      </footer>
    </div>
  );
}
