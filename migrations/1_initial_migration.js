// eslint-disable-next-line  no-undef
const Migrations = artifacts.require('Migrations');

module.exports = async function (deployer) {
  await deployer.deploy(Migrations);
};
