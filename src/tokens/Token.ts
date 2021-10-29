export interface IToken {
  address: string;
  decimals: number;
}

class Token implements IToken {
  address: string;
  decimals: number;

  constructor(args: { address: string; decimals: number }) {
    this.address = args.address;
    this.decimals = args.decimals;
  }
}

export default Token;
