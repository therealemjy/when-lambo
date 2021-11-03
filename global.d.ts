declare global {
  namespace NodeJS {
    interface Global {
      currentGasPrices: {
        rapid: number;
        fast: number;
        standard: number;
        slow: number;
      };
    }
  }
}
export {};
