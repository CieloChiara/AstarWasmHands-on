import { useEffect, useState } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { ContractPromise } from '@polkadot/api-contract';
import Header from './Header';
import Footer from './Footer';
import SampleContractsList from './SampleContractsList';
import { web3FromSource } from '@polkadot/extension-dapp';
import type { WeightV2 } from '@polkadot/types/interfaces';
import type { InjectedAccountWithMeta, InjectedExtension } from '@polkadot/extension-inject/types'

// Specify the metadata of the contract.
import abi from '../metadata/metadata.json';

const proofSize = 131072
const refTime = 6219235328
const storageDepositLimit = null

const IndexCanvas = () => {
  
  const blockchains = [
    {
      name: 'Shiden', 
      url: 'wss://shiden.api.onfinality.io/public-ws',
      subscan_url: 'https://shiden.subscan.io/account/',
    },
    {
      name: 'Shibuya',
      url: 'wss://rpc.shibuya.astar.network',
      subscan_url: 'https://shibuya.subscan.io/account/',
    },
    {
      name: 'Local',
      url: 'ws://127.0.0.1:9944',
    },
    {
      name: 'Custom',
      url: '',
      //url: 'wss://astar-collator.cielo.works:11443',
    },
  ];

  const [block, setBlock] = useState(0);
  const [blockchainUrl, setBlockchainUrl] = useState('');
  const [blockchainName, setBlockchainName] = useState('');
  const [actingChainName, setActingChainName] = useState('');
  const [actingChainUrl, setActingChainUrl] = useState('');
  const [customUrl, setCustomUrl] = useState('');

  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [actingAddress, setActingAddress] = useState('');
  const [api, setApi] = useState<any>();
  
  const [contractAddress, setContractAddress] = useState('');

  const [flipResult, setFlipResult] = useState('');
  const [incrementResult, setIncrementResult] = useState('');
  const [gasConsumed, setGasConsumed] = useState("");
  const [incrementGasConsumed, setIncrementGasConsumed] = useState("");
  
  const [flipValue, setFlipValue] = useState(false);
  const [incrementNumber, setIncrementNumber] = useState('');

  useEffect(() => {
    const url:any = localStorage.getItem('customUrl');
    setCustomUrl(url);
  },[]);

  const extensionSetup = async () => {
    if (!blockchainUrl) {
      alert("Please select Blockchain and click 'Set Blockchain' button.");
      return;
    }
    const { web3Accounts, web3Enable } = await import(
      "@polkadot/extension-dapp"
    );
    const extensions = await web3Enable("Showcase PSP34 Mint Sample");
    if (extensions.length === 0) {
      return;
    }
    const account = await web3Accounts();
    setAccounts(account);
    if (!actingAddress) {
      setActingAddress(account[0].address);
    }
  };

  async function flip() {
    if (!blockchainUrl || accounts.length == 0) {
      alert("Please select Blockchain and click 'Set Blockchain' button and click 'Set Account' button.");
      return;
    }
    const gasLimit = 30000 * 1000000;

    const contract = new ContractPromise(api, abi, contractAddress);
    const account = accounts.filter(data => data.address === actingAddress);
    
    const flipExtrinsic =
      await contract.tx.flip({
        gasLimit: api.registry.createType('WeightV2', {
          refTime,
          proofSize,
        }) as WeightV2,
        storageDepositLimit});

    let injector: any;
    if (accounts.length == 1) {
      injector = await web3FromSource(accounts[0].meta.source);
    } else if (accounts.length > 1) {
      injector = await web3FromSource(account[0].meta.source);
    } else {
      return;
    }

    flipExtrinsic.signAndSend(actingAddress, { signer: injector.signer }, ({ status }) => {
      if (status.isInBlock) {
        console.log(`Completed at block hash #${status.asInBlock.toString()}`);
        setGasConsumed("Completed at block hash #" + status.asInBlock.toString());
        if (actingChainName === 'Local') {
          window.setTimeout(function(){
            get();
          }, 2000);
        }
      } else if (status.isFinalized) {
        console.log('finalized');
        setGasConsumed("finalized");
        if (actingChainName !== 'Local') {
          get();
        }
      } else {
        console.log(`Current status: ${status.type}`);
        setGasConsumed("Current status: " + status.type.toString());
      }
    }).catch((error: any) => {
      console.log(':( transaction failed', error);
      setGasConsumed(":( transaction failed: " + error.toString());
    });

  };

  async function get() {
    if (!blockchainUrl) {
      alert('Please select Blockchain and click "Set Blockchain" button.');
      return;
    }

    setFlipValue(false);

    const contract = new ContractPromise(api, abi, contractAddress);
    const {result, output} = 
      await contract.query.get(
        contractAddress,
        {
          gasLimit: api.registry.createType('WeightV2', {
            refTime,
            proofSize,
          }) as WeightV2,
          storageDepositLimit,
        }
      )

    setFlipResult(JSON.stringify(result.toHuman()));

    // The actual result from RPC as `ContractExecResult`
    console.log(result.toHuman());

    // check if the call was successful
    if (result.isOk) {
      // output the return value
      console.log('Success', output?.toHuman());
      const outputData: any = output;
      setFlipValue(outputData.toString());

    } else {
      setFlipValue(false);
    }
  };

  async function increment() {
    if (!blockchainUrl || accounts.length == 0) {
      alert("Please select Blockchain and click 'Set Blockchain' button and click 'Set Account' button.");
      return;
    }
    const gasLimit = 30000 * 1000000;

    const contract = new ContractPromise(api, abi, contractAddress);
    const account = accounts.filter(data => data.address === actingAddress);
    
    const flipExtrinsic =
      await contract.tx.increment({
        gasLimit: api.registry.createType('WeightV2', {
          refTime,
          proofSize,
        }) as WeightV2,
        storageDepositLimit});

    let injector: any;
    if (accounts.length == 1) {
      injector = await web3FromSource(accounts[0].meta.source);
    } else if (accounts.length > 1) {
      injector = await web3FromSource(account[0].meta.source);
    } else {
      return;
    }

    flipExtrinsic.signAndSend(actingAddress, { signer: injector.signer }, ({ status }) => {
      if (status.isInBlock) {
        console.log(`Completed at block hash #${status.asInBlock.toString()}`);
        setIncrementGasConsumed("Completed at block hash #" + status.asInBlock.toString());
        if (actingChainName === 'Local') {
          window.setTimeout(function(){
            getNumber();
          }, 2000);
        }
      } else if (status.isFinalized) {
        console.log('finalized');
        setIncrementGasConsumed("finalized");
        if (actingChainName !== 'Local') {
          getNumber();
        }
      } else {
        console.log(`Current status: ${status.type}`);
        setIncrementGasConsumed("Current status: " + status.type.toString());
      }
    }).catch((error: any) => {
      console.log(':( transaction failed', error);
      setIncrementGasConsumed(":( transaction failed: " + error.toString());
    });

  };

  async function getNumber() {
    if (!blockchainUrl) {
      alert('Please select Blockchain and click "Set Blockchain" button.');
      return;
    }

    setIncrementNumber('');

    const contract = new ContractPromise(api, abi, contractAddress);
    const {result, output} = 
      await contract.query.getNumber(
        contractAddress,
        {
          gasLimit: api.registry.createType('WeightV2', {
            refTime,
            proofSize,
          }) as WeightV2,
          storageDepositLimit,
        }
      )

    setIncrementResult(JSON.stringify(result.toHuman()));

    // The actual result from RPC as `ContractExecResult`
    console.log(result.toHuman());

    // check if the call was successful
    if (result.isOk) {
      // output the return value
      console.log('Success', output?.toHuman());
      const outputData: any = output;
      setIncrementNumber(outputData.toString());

    } else {
      setIncrementNumber('');
    }
  };

  const setup = async () => {
 
    const newDataset = blockchains.filter(data => data.name === blockchainName);

    let chainUrl = '';
    if (blockchainName === 'Custom') {
      chainUrl = customUrl;
    } else {
      chainUrl = newDataset[0]?.url;
    }
    setBlockchainUrl(chainUrl);

    if (!chainUrl) {
      return;
    }

    setActingChainName('');
    setBlock(0);
    setActingChainUrl('');

    const wsProvider = new WsProvider(chainUrl);
    const api = await ApiPromise.create({provider: wsProvider});
    const unsubscribe = await api.rpc.chain.subscribeNewHeads((lastHeader) => {
      setApi(api);
      setActingChainName(blockchainName);
      setBlock(lastHeader.number.toNumber());
      setActingChainUrl(chainUrl);
      unsubscribe();
    });
  };

  const saveCustomURL = (url: string) => {
    setCustomUrl(url);
    localStorage.setItem('customUrl', url);
  };


  return (
    <div className="text-center">
      <Header />
      <div className="p-3 mt-2 m-auto max-w-6xl w-11/12 border-[#d8d2c5] dark:border-[#323943] bg-[#f4efe2] dark:bg-[#121923] border border-1 rounded">
        <div className="mb-5 text-xl">Select blockchain</div>
        <button
          className="mb-2 bg-[#184e9b] hover:bg-[#2974df] hover:duration-500 text-white rounded px-4 py-2"
          onClick={setup}
        >Set Blockchain</button>
        <select
          className="p-3 m-3 mt-0 mb-2 bg-[#dcd6c8] dark:bg-[#020913] border-2 border-[#95928b] dark:border-gray-500 rounded"
          onChange={(event) => {
            setBlockchainName((event.target.value));
          }}
        >
            <option value="None">-- select --</option>
            <option value="Shiden">Shiden</option>
            <option value="Shibuya">Shibuya</option>
            <option value="Local">Local</option>
            <option value="Custom">Custom</option>
        </select>
        {blockchainName === 'Custom' ?
        <input
            className="p-2 m-2 bg-[#dcd6c8] dark:bg-[#020913] border-2 border-[#95928b] dark:border-gray-500 rounded"
            onChange={(event) => saveCustomURL(event.target.value)}
            placeholder="Custom URL"
            value={customUrl}
          />
        : <></> }
        <div className="m-2">Current BlockchainName: {actingChainName? actingChainName : "---"}</div>
        <div className="m-2">URL: {actingChainUrl? actingChainUrl : "---"}</div>
      </div>

      <div className="text-left p-2 pt-0 mt-5 m-auto max-w-6xl w-11/12 border-[#d8d2c5] dark:border-[#323943] bg-[#f4efe2] dark:bg-[#121923] border border-1 rounded">
        <div className="text-center mt-4">
          <div className="mb-2 text-xl">Connect wallet</div>
          <button
              className="bg-[#184e9b] hover:bg-[#2974df] hover:duration-500 disabled:bg-[#a4a095] dark:disabled:bg-stone-700 text-white rounded px-4 py-2"
              onClick={extensionSetup}
            >
              Set Account
          </button>
          <select
          className="p-3 m-3 mt-0 bg-[#dcd6c8] dark:bg-[#020913] border-2 border-[#95928b] dark:border-gray-500 rounded"
            onChange={(event) => {
              console.log(event);
              setActingAddress(event.target.value);
            }}
          >
            {accounts.map((a) => (
              <option key={a.address} value={a.address}>
                [{a.meta.name}]
              </option>
            ))}
          </select>
          <p className="p-1 m-1 break-all">actingAddress: {actingAddress}</p>
        </div>
      </div>

      <div className="text-left p-2 pt-0 mt-5 m-auto max-w-6xl w-11/12 border-[#d8d2c5] dark:border-[#323943] bg-[#f4efe2] dark:bg-[#121923] border border-1 rounded">
        <div className="text-center mt-4">
          <div className="mb-3 text-xl">Set contract address</div>
          <input
            className="p-2 m-2 bg-[#dcd6c8] dark:bg-[#020913] border-2 border-[#95928b] dark:border-gray-500 rounded w-[80%] max-w-500px]"
            onChange={(event) => setContractAddress(event.target.value.trim())}
            placeholder="ContractAddress"
          />
        </div>
        <div className="text-center">
          <div>
            <p className={contractAddress ? "m-1 break-all" : "hidden"}></p>
          </div>
        </div>
      </div>

      <div className="text-left p-2 pt-0 mt-5 m-auto max-w-6xl w-11/12 border-[#d8d2c5] dark:border-[#323943] bg-[#f4efe2] dark:bg-[#121923] border border-1 rounded">
        <div className="text-center mt-4">
          <div className="mb-3 text-xl">Flip Value</div>
          {flipValue ? <p className="w-[100px] bg-[#dcd6c8] dark:bg-[#020913] rounded p-2 mt-2 mb-4 ml-auto mr-auto text-xl">{flipValue}</p> : '' }
          <button disabled={!contractAddress}
            className="bg-[#184e9b] hover:bg-[#2974df] hover:duration-500 disabled:bg-[#a4a095] dark:disabled:bg-stone-700 text-white rounded px-4 py-2"
            onClick={get}
          >{contractAddress ? 'Get Flip Value' : 'Get Flip Value'}</button>
          <button disabled={!contractAddress}
            className="ml-4 bg-[#184e9b] hover:bg-[#2974df] hover:duration-500 disabled:bg-[#a4a095] dark:disabled:bg-stone-700 text-white rounded px-4 py-2"
            onClick={flip}
          >{contractAddress ? 'Exec Flip' : 'Exec Flip'}</button>
        </div>

        <div className="text-center">
          <div>
            <p className={contractAddress ? "m-1 break-all" : "hidden"}></p>
          </div>
        </div>

        <div className="m-2 mt-4 p-2 bg-[#dcd6c8] dark:bg-[#020913] rounded">
          <p className="p-1 m-1 break-all">Status: {gasConsumed}</p>
          <p className="p-1 m-1 break-all">Result: {flipResult}</p>
        </div>
      </div>

      <div className="text-left p-2 pt-0 mt-5 m-auto max-w-6xl w-11/12 border-[#d8d2c5] dark:border-[#323943] bg-[#f4efe2] dark:bg-[#121923] border border-1 rounded">
        <div className="text-center mt-4">
          <div className="mb-3 text-xl">Increment Number</div>
          {incrementNumber? <p className="w-[100px] bg-[#dcd6c8] dark:bg-[#020913] rounded p-2 mt-2 mb-4 ml-auto mr-auto text-xl">{incrementNumber}</p> : ''}
          <button disabled={!contractAddress}
            className="bg-[#184e9b] hover:bg-[#2974df] hover:duration-500 disabled:bg-[#a4a095] dark:disabled:bg-stone-700 text-white rounded px-4 py-2"
            onClick={getNumber}
          >{contractAddress ? 'Get Number' : 'Get Number'}</button>
          <button disabled={!contractAddress}
            className="ml-4 bg-[#184e9b] hover:bg-[#2974df] hover:duration-500 disabled:bg-[#a4a095] dark:disabled:bg-stone-700 text-white rounded px-4 py-2"
            onClick={increment}
          >{contractAddress ? 'Exec Increment' : 'Exec Increment'}</button>
        </div>

        <div className="text-center">
          <div>
            <p className={contractAddress ? "m-1 break-all" : "hidden"}></p>
          </div>
        </div>

        <div className="m-2 mt-4 p-2 bg-[#dcd6c8] dark:bg-[#020913] rounded">
          <p className="p-1 m-1 break-all">Status: {incrementGasConsumed}</p>
          <p className="p-1 m-1 break-all">Result: {incrementResult}</p>
        </div>
      </div>

      <SampleContractsList />
      <Footer />
    </div>
  );
};

export default IndexCanvas;