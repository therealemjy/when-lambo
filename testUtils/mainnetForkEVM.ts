const ganache = require('ganache-cli'); // eslint-disable-line

const startBlockNumber = 13661800;
const port = 8545;

const server = ganache.server({
  port,
  fork: `https://eth-mainnet.alchemyapi.io/v2/riG17C292D4AAxmWW0cSzqqIIgR7TYhu@${startBlockNumber}`,
  network_id: '999',
});

server.listen(port, (err: unknown) => {
  if (err) {
    throw err;
  }

  console.log(`Ganache forked mainnet listening on port ${port}...`);
});

export {};
