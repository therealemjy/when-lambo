export interface IToken {
  symbol: string;
  address: string;
  decimals: number;
}

class Token implements IToken {
  symbol: string;
  address: string;
  decimals: number;

  constructor(args: { symbol: string; address: string; decimals: number }) {
    this.symbol = args.symbol;
    this.address = args.address;
    this.decimals = args.decimals;
  }
}

export default Token;
