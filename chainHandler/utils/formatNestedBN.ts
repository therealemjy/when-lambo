import BigNumber from 'bignumber.js';

// This is a util used in dev only, to make nested BigNumber values inside an
// object human-readable
const formatNestedBN = (source: any): any =>
  Object.keys(source).reduce((convertedObject, key) => {
    let value = source[key];

    if (value?._isBigNumber) {
      value = value.toString();
    } else if (value instanceof BigNumber) {
      value = value.toFixed(0);
    } else if (typeof value === 'object' && value && !(value instanceof Date)) {
      value = formatNestedBN(value);
    }

    return {
      ...convertedObject,
      [key]: value,
    };
  }, {} as any);

export default formatNestedBN;
