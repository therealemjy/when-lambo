// eslint-disable-next-line  no-undef
const ConvertLib = artifacts.require('ConvertLib');
// eslint-disable-next-line  no-undef
const MetaCoin = artifacts.require('MetaCoin');

module.exports = async function (deployer) {
  await deployer.deploy(ConvertLib);
  await deployer.link(ConvertLib, MetaCoin);
  await deployer.deploy(MetaCoin);
};
