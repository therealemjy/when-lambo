const ganache = require('ganache-cli'); // eslint-disable-line

const startBlockNumber = 13661800;
const port = 8545;

const server = ganache.server({
  port,
  fork: `https://mainnet.infura.io/v3/64b45f4612074272a32e82d4428e2127@${startBlockNumber}`,
  network_id: '999',
});

server.listen(port, (err: unknown) => {
  if (err) {
    throw err;
  }

  console.log(`Ganache forked mainnet listening on port ${port}...`);
});

export {};
