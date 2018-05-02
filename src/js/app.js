App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    // Load pets.
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

        petsRow.append(petTemplate.html());
      }
    });

    return App.initWeb3();
  },

  initWeb3: function() {
    // Is there an injected web3 instance?
if (typeof web3 !== 'undefined') {
  App.web3Provider = web3.currentProvider;
} else {
  // If no injected web3 instance is detected, fall back to Ganache
  App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
}
web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('LendEther.json', function(data) {
  // Get the necessary contract artifact file and instantiate it with truffle-contract
  var LendEtherArtifact = data;
  App.contracts.LendEther = TruffleContract(LendEtherArtifact);

  // Set the provider for our contract
  App.contracts.LendEther.setProvider(App.web3Provider);

  // Use our contract to retrieve and mark the adopted pets
  return App.markLended();
});

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleLend);
  },

  markLended: function(lendMap, account) {
    var lendEtherInstance;

    App.contracts.LendEther.deployed().then(function(instance) {
        lendEtherInstance = instance;
        return lendEtherInstance.getLendMap.call();
      }).then(function(lendMap) {
        for (i = 0; i < lendMap.length; i++) {
          if (lendMap[i] !== '0x0000000000000000000000000000000000000000') {
            $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
          }
        }
      }).catch(function(err) {
        console.log(err.message);
      });
  },

  handleLend: function(event) {
    event.preventDefault();

    var lendId = parseInt($(event.target).data('id'));

    var lendEtherInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];

      App.contracts.LendEther.deployed().then(function(instance) {
        lendEtherInstance = instance;
        // Execute lend as a transaction by sending account
        //return lendEtherInstance.lend(lendId, {from: account});
        return lendEtherInstance.lend(lendId, {from: account}).then(function(id){
          return lendEtherInstance.transfer("0x836360EfF41480da275b559bc81CE13Dfc42C336",50)
        });
      }).then(function(result) {
        return App.markLended();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
