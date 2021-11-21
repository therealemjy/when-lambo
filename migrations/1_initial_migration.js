const Migrator = artifacts.require('Migrator');

module.exports = async function (deployer) {
  await deployer.deploy(Migrator);
};
