import config from '@src/config';
import { Path } from '@src/types';

import logPathsInDevelopment from './logPathsInDevelopment';
import logPathsInProduction from './logPathsInProduction';

const logPaths = async (paths: Path[]) => {
  if (config.environment === 'production') {
    await logPathsInProduction(paths);
  } else {
    await logPathsInDevelopment(paths);
  }
};

export default logPaths;
