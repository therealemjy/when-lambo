import BigNumber from 'bignumber.js';

const convertBigNumbersToStrings = (source: any): any =>
  Object.keys(source).reduce((convertedObject, key) => {
    let value = source[key];

    if (value instanceof BigNumber) {
      value = value.toFixed();
    } else if (typeof value === 'object' && value && !(value instanceof Date)) {
      value = convertBigNumbersToStrings(value);
    }

    return {
      ...convertedObject,
      [key]: value,
    };
  }, {} as any);

export default convertBigNumbersToStrings;
