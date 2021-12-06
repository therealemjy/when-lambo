/* Autogenerated file. Do not edit manually. */

/* tslint:disable */

/* eslint-disable */
import type { Transactor, TransactorInterface } from "../Transactor";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_wethAddress",
        type: "address",
      },
      {
        internalType: "address",
        name: "_dydxSoloMargin",
        type: "address",
      },
      {
        internalType: "address",
        name: "_uniswapV2Router",
        type: "address",
      },
      {
        internalType: "address",
        name: "_sushiswapRouter",
        type: "address",
      },
      {
        internalType: "address",
        name: "_cryptoComRouter",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "tradedTokenAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "borrowedWethAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "enum Exchange",
        name: "sellingExchangeIndex",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "tradedTokenAmountOut",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "enum Exchange",
        name: "buyingExchangeIndex",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "wethAmountOut",
        type: "uint256",
      },
    ],
    name: "SuccessfulTrade",
    type: "event",
  },
  {
    stateMutability: "payable",
    type: "fallback",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        components: [
          {
            internalType: "address",
            name: "owner",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "number",
            type: "uint256",
          },
        ],
        internalType: "struct Account.Info",
        name: "accountInfo",
        type: "tuple",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "callFunction",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address payable",
        name: "_to",
        type: "address",
      },
    ],
    name: "destruct",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "enum Exchange",
        name: "exchangeIndex",
        type: "uint8",
      },
    ],
    name: "getExchange",
    outputs: [
      {
        internalType: "contract IUniswapV2Router",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_newOwner",
        type: "address",
      },
    ],
    name: "setOwner",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "expectedBlockNumber",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_wethAmountToBorrow",
        type: "uint256",
      },
      {
        internalType: "enum Exchange",
        name: "_sellingExchangeIndex",
        type: "uint8",
      },
      {
        internalType: "address",
        name: "_tradedToken",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_tradedTokenAmountOutMin",
        type: "uint256",
      },
      {
        internalType: "enum Exchange",
        name: "_buyingExchangeIndex",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "_wethAmountOutMin",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_deadline",
        type: "uint256",
      },
    ],
    name: "trade",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_to",
        type: "address",
      },
    ],
    name: "transferERC20",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
      {
        internalType: "address payable",
        name: "_to",
        type: "address",
      },
    ],
    name: "transferETH",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
];

const _bytecode =
  "0x60806040523480156200001157600080fd5b5060405162001669380380620016698339810160408190526200003491620000be565b60008054336001600160a01b0319918216179091556001805482166001600160a01b0397881617905560028054821695871695909517909455600380548516938616939093179092556004805484169185169190911790556005805490921692169190911790556200012d565b80516001600160a01b0381168114620000b957600080fd5b919050565b600080600080600060a08688031215620000d6578081fd5b620000e186620000a1565b9450620000f160208701620000a1565b93506200010160408701620000a1565b92506200011160608701620000a1565b91506200012160808701620000a1565b90509295509295909350565b61152c806200013d6000396000f3fe6080604052600436106100795760003560e01c80638b4187131161004b5780638b4187131461011e5780638da5cb5b1461013e57806397e10a791461015e5780639a2ba5571461017e57005b806313af4035146100825780631beb2615146100a25780636e07c470146100c25780637911f082146100e257005b3661008057005b005b34801561008e57600080fd5b5061008061009d366004610d92565b61019e565b3480156100ae57600080fd5b506100806100bd366004610d92565b6101f3565b3480156100ce57600080fd5b506100806100dd366004611069565b61032e565b3480156100ee57600080fd5b506101026100fd366004610f9b565b6103f2565b6040516001600160a01b03909116815260200160405180910390f35b34801561012a57600080fd5b50610080610139366004610db5565b610477565b34801561014a57600080fd5b50600054610102906001600160a01b031681565b34801561016a57600080fd5b50610080610179366004610e92565b61057b565b34801561018a57600080fd5b50610080610199366004611098565b61062d565b6000546001600160a01b031633146101d15760405162461bcd60e51b81526004016101c89061131f565b60405180910390fd5b600080546001600160a01b0319166001600160a01b0392909216919091179055565b6000546001600160a01b0316331461021d5760405162461bcd60e51b81526004016101c89061131f565b6001546040516370a0823160e01b81523060048201526000916001600160a01b0316906370a082319060240160206040518083038186803b15801561026157600080fd5b505afa158015610275573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102999190611051565b60015460405163a9059cbb60e01b81526001600160a01b0385811660048301526024820184905292935091169063a9059cbb90604401602060405180830381600087803b1580156102e957600080fd5b505af11580156102fd573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103219190610f7b565b50816001600160a01b0316ff5b6000546001600160a01b031633146103585760405162461bcd60e51b81526004016101c89061131f565b6000816001600160a01b03168360405160006040518083038185875af1925050503d80600081146103a5576040519150601f19603f3d011682016040523d82523d6000602084013e6103aa565b606091505b50509050806103ed5760405162461bcd60e51b815260206004820152600f60248201526e151c985b9cd9995c8819985a5b1959608a1b60448201526064016101c8565b505050565b6003546000906001600160a01b0316600183600281111561042357634e487b7160e01b600052602160045260246000fd5b141561043b57506004546001600160a01b0316610471565b600283600281111561045d57634e487b7160e01b600052602160045260246000fd5b141561047157506005546001600160a01b03165b92915050565b6002546001600160a01b0316331461049f57634e487b7160e01b600052600160045260246000fd5b6000818060200190518101906104b59190610fb7565b600154815160808301516020840151604085015160c08601519596506000956104eb956001600160a01b03169493929190610b1f565b905060006105228360200151838560a00151600160009054906101000a90046001600160a01b031687606001518860c00151610b1f565b60208401518451608086015160a08701516040519495507f029b2750f12d6200ac7db7c47846edfb550cfc503b88373482cb821c1b3a90d49461056b94939291889188906111a7565b60405180910390a1505050505050565b6000546001600160a01b031633146105a55760405162461bcd60e51b81526004016101c89061131f565b60405163a9059cbb60e01b81526001600160a01b0382811660048301526024820184905284169063a9059cbb90604401602060405180830381600087803b1580156105ef57600080fd5b505af1158015610603573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906106279190610f7b565b50505050565b6000546001600160a01b031633146106575760405162461bcd60e51b81526004016101c89061131f565b4388146106965760405162461bcd60e51b815260206004820152600d60248201526c151c98591948195e1c1a5c9959609a1b60448201526064016101c8565b60006106a3886002611471565b60015460025460405163095ea7b360e01b81526001600160a01b03918216600482015260248101849052929350169063095ea7b390604401602060405180830381600087803b1580156106f557600080fd5b505af1158015610709573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061072d9190610f7b565b5060408051600380825260808201909252600091816020015b61074e610d0c565b815260200190600190039081610746575050604080516101008101825260018152600060208083018290528351608081018552828152949550919392840192918201908152602001600081526020018c81525081526020016000815260200160008152602001306001600160a01b031681526020016000815260200160405180602001604052806000815250815250816000815181106107fe57634e487b7160e01b600052603260045260246000fd5b602090810291909101015260408051610100810190915280600881526020016000815260200160405180608001604052806000151581526020016000600181111561085957634e487b7160e01b600052602160045260246000fd5b815260200160008152602001600081525081526020016000815260200160008152602001306001600160a01b03168152602001600081526020016040518060e001604052808c81526020018a6001600160a01b031681526020018981526020018781526020018b60028111156108df57634e487b7160e01b600052602160045260246000fd5b815260200188600281111561090457634e487b7160e01b600052602160045260246000fd5b81526020018681525060405160200161091d9190611343565b6040516020818303038152906040528152508160018151811061095057634e487b7160e01b600052603260045260246000fd5b60209081029190910101526040805161010081019091528060008152602001600081526020016040518060800160405280600115158152602001600060018111156109ab57634e487b7160e01b600052602160045260246000fd5b8152602001600081526020018581525081526020016000815260200160008152602001306001600160a01b03168152602001600081526020016040518060200160405280600081525081525081600281518110610a1857634e487b7160e01b600052603260045260246000fd5b6020908102919091010152604080516001808252818301909252600091816020015b6040805180820190915260008082526020820152815260200190600190039081610a3a5790505090506040518060400160405280306001600160a01b03168152602001600181525081600081518110610aa357634e487b7160e01b600052603260045260246000fd5b602090810291909101015260025460405163a67a6a4560e01b81526001600160a01b039091169063a67a6a4590610ae090849086906004016111ef565b600060405180830381600087803b158015610afa57600080fd5b505af1158015610b0e573d6000803e3d6000fd5b505050505050505050505050505050565b600080610b2b866103f2565b60405163095ea7b360e01b81526001600160a01b038083166004830152602482018a90529192509089169063095ea7b390604401602060405180830381600087803b158015610b7957600080fd5b505af1158015610b8d573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610bb19190610f7b565b506040805160028082526060820183526000926020830190803683370190505090508881600081518110610bf557634e487b7160e01b600052603260045260246000fd5b60200260200101906001600160a01b031690816001600160a01b0316815250508581600181518110610c3757634e487b7160e01b600052603260045260246000fd5b6001600160a01b0392831660209182029290920101526040516338ed173960e01b81526000918416906338ed173990610c7c908c908a90879030908c906004016113a7565b600060405180830381600087803b158015610c9657600080fd5b505af1158015610caa573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f19168201604052610cd29190810190610ed3565b600181518110610cf257634e487b7160e01b600052603260045260246000fd5b602002602001015190508093505050509695505050505050565b604080516101008101825260008082526020820152908101610d50604080516080810190915260008082526020820190815260200160008152602001600081525090565b8152602001600081526020016000815260200160006001600160a01b0316815260200160008152602001606081525090565b8051610d8d816114e9565b919050565b600060208284031215610da3578081fd5b8135610dae816114d4565b9392505050565b60008060008385036080811215610dca578283fd5b8435610dd5816114d4565b93506020601f1960408382011215610deb578485fd5b610df3611417565b925081870135610e02816114d4565b835260408701358284015291935060608601359167ffffffffffffffff80841115610e2b578485fd5b838801935088601f850112610e3e578485fd5b833581811115610e5057610e506114ab565b610e608484601f84011601611440565b92508083528984828701011115610e75578586fd5b808486018585013782019092019390935250929591945092509050565b600080600060608486031215610ea6578283fd5b8335610eb1816114d4565b9250602084013591506040840135610ec8816114d4565b809150509250925092565b60006020808385031215610ee5578182fd5b825167ffffffffffffffff80821115610efc578384fd5b818501915085601f830112610f0f578384fd5b815181811115610f2157610f216114ab565b8060051b9150610f32848301611440565b8181528481019084860184860187018a1015610f4c578788fd5b8795505b83861015610f6e578051835260019590950194918601918601610f50565b5098975050505050505050565b600060208284031215610f8c578081fd5b81518015158114610dae578182fd5b600060208284031215610fac578081fd5b8135610dae816114e9565b600060e08284031215610fc8578081fd5b60405160e0810181811067ffffffffffffffff82111715610feb57610feb6114ab565b604052825181526020830151611000816114d4565b80602083015250604083015160408201526060830151606082015261102760808401610d82565b608082015261103860a08401610d82565b60a082015260c083015160c08201528091505092915050565b600060208284031215611062578081fd5b5051919050565b6000806040838503121561107b578182fd5b82359150602083013561108d816114d4565b809150509250929050565b600080600080600080600080610100898b0312156110b4578586fd5b883597506020890135965060408901356110cd816114e9565b955060608901356110dd816114d4565b94506080890135935060a08901356110f4816114e9565b979a969950949793969295929450505060c08201359160e0013590565b60008151808452815b818110156111365760208185018101518683018201520161111a565b818111156111475782602083870101525b50601f01601f19169290920160200192915050565b6003811061116c5761116c611495565b9052565b8051151582526020810151611184816114c1565b60208301526040810151611197816114c1565b6040830152606090810151910152565b6001600160a01b03871681526020810186905260c081016111cb604083018761115c565b8460608301526111de608083018561115c565b8260a0830152979650505050505050565b6040808252835182820181905260009190606090818501906020808901865b8381101561123c57815180516001600160a01b0316865283015183860152938601939082019060010161120e565b50508683038188015287518084528184019250600581901b84018201898301885b8381101561130e57601f19878403018652815161016081516009811061128557611285611495565b855281870151878601528a82015161129f8c870182611170565b508982015160c081818801526080840151915060e0828189015260a085015192506112d66101008901846001600160a01b03169052565b9084015161012088015290920151610140860182905291506112fa81860183611111565b97870197945050509084019060010161125d565b50909b9a5050505050505050505050565b6020808252600a90820152694f776e6572206f6e6c7960b01b604082015260600190565b815181526020808301516001600160a01b031690820152604080830151908201526060808301519082015260808083015160e08301916113859084018261115c565b5060a083015161139860a084018261115c565b5060c092830151919092015290565b600060a082018783526020878185015260a0604085015281875180845260c0860191508289019350845b818110156113f65784516001600160a01b0316835293830193918301916001016113d1565b50506001600160a01b03969096166060850152505050608001529392505050565b6040805190810167ffffffffffffffff8111828210171561143a5761143a6114ab565b60405290565b604051601f8201601f1916810167ffffffffffffffff81118282101715611469576114696114ab565b604052919050565b6000821982111561149057634e487b7160e01b81526011600452602481fd5b500190565b634e487b7160e01b600052602160045260246000fd5b634e487b7160e01b600052604160045260246000fd5b600281106114d1576114d1611495565b50565b6001600160a01b03811681146114d157600080fd5b600381106114d157600080fdfea2646970667358221220b0df84d935d701fbb91abe32f981b4b89b6fe97b3183e97061ca2e70dddcc33564736f6c63430008040033";

export class Transactor__factory extends ContractFactory {
  constructor(
    ...args: [signer: Signer] | ConstructorParameters<typeof ContractFactory>
  ) {
    if (args.length === 1) {
      super(_abi, _bytecode, args[0]);
    } else {
      super(...args);
    }
  }

  deploy(
    _wethAddress: string,
    _dydxSoloMargin: string,
    _uniswapV2Router: string,
    _sushiswapRouter: string,
    _cryptoComRouter: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<Transactor> {
    return super.deploy(
      _wethAddress,
      _dydxSoloMargin,
      _uniswapV2Router,
      _sushiswapRouter,
      _cryptoComRouter,
      overrides || {}
    ) as Promise<Transactor>;
  }
  getDeployTransaction(
    _wethAddress: string,
    _dydxSoloMargin: string,
    _uniswapV2Router: string,
    _sushiswapRouter: string,
    _cryptoComRouter: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(
      _wethAddress,
      _dydxSoloMargin,
      _uniswapV2Router,
      _sushiswapRouter,
      _cryptoComRouter,
      overrides || {}
    );
  }
  attach(address: string): Transactor {
    return super.attach(address) as Transactor;
  }
  connect(signer: Signer): Transactor__factory {
    return super.connect(signer) as Transactor__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): TransactorInterface {
    return new utils.Interface(_abi) as TransactorInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): Transactor {
    return new Contract(address, _abi, signerOrProvider) as Transactor;
  }
}
