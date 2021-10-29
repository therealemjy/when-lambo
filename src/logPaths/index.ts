import config from '@src/config';
import { Path } from '@src/types';

import logPathsInDevelopment from './logPathsInDevelopment';
import logPathsInProduction from './logPathsInProduction';

const logPaths = (paths: Path[]) => {
  if (config.environment === 'production') {
    logPathsInProduction(paths);
  } else {
    logPathsInDevelopment(paths);
  }
};

export default logPaths;
