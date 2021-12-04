export default class CancelablePromise {
  private readonly abortSymbol = Symbol('cancelled');
  private abortPromise: Promise<any>;
  private resolve!: any; // Works due to promise init

  constructor() {
    this.abortPromise = new Promise((res) => (this.resolve = res));
  }

  public async wrap<T>(p: PromiseLike<T>): Promise<T> {
    const result = await Promise.race([p, this.abortPromise]);
    if (result === this.abortSymbol) {
      throw new Error('aborted');
    }

    return result;
  }

  public abort() {
    this.resolve(this.abortSymbol);
  }
}
