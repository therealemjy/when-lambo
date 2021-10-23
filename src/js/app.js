App = {
  accountAddress: 0x0,
  web3Provider: null,
  contracts: {},

  init: function () {
    return App.initWeb3();
  },

  initWeb3: async function () {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        App.web3Provider = window.ethereum;
      } catch (error) {
        console.error("Error:", error);
      }
    } else {
      App.web3Provider = new Web3.providers.HttpProvider(
        "http://localhost:7545"
      );
    }

    web3 = new Web3(App.web3Provider);
  },
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
