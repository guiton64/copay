'use strict';

angular.module('copayApp.controllers').controller('txDetailsController', function($rootScope, $scope, $filter, $ionicPopup, gettextCatalog, profileService, configService) {

  var self = $scope.self;
  var fc = profileService.focusedClient;
  var config = configService.getSync();
  var configWallet = config.wallet;
  var walletSettings = configWallet.settings;

  $scope.alternativeIsoCode = walletSettings.alternativeIsoCode;
  $scope.color = fc.backgroundColor;
  $scope.copayerId = fc.credentials.copayerId;
  $scope.isShared = fc.credentials.n > 1;

  $scope.showCommentPopup = function() {
    $scope.data = {};

    // An elaborate, custom popup
    var commentPopup = $ionicPopup.show({
      template: '<input type="text" ng-model="data.comment" autofocus>',
      title: gettextCatalog.getString('Enter a new comment'),
      subTitle: gettextCatalog.getString('You can also edit after save'),
      scope: $scope,
      buttons: [
        { // Array[Object] (optional). Buttons to place in the popup footer.
          text: gettextCatalog.getString('Cancel'),
          type: 'button-default',
          onTap: function(e) {
            return;
          }
        }, {
          text: gettextCatalog.getString('Save'),
          type: 'button-positive',
          onTap: function(e) {
            // Returning a value will cause the promise to resolve with the given value.
            return $scope.data.comment;
          }
        }
      ]
    });

    commentPopup.then(function(comment) {
      if (!comment) return;
      $scope.comment = comment;
      $scope.editionTime = Math.floor(Date.now());
    });
  };

  $scope.getAlternativeAmount = function() {
    var satToBtc = 1 / 100000000;

    fc.getFiatRate({
      code: $scope.alternativeIsoCode,
      ts: $scope.btx.time * 1000
    }, function(err, res) {
      if (err) {
        $log.debug('Could not get historic rate');
        return;
      }
      if (res && res.rate) {
        var alternativeAmountBtc = ($scope.btx.amount * satToBtc).toFixed(8);
        $scope.rateDate = res.fetchedOn;
        $scope.rateStr = res.rate + ' ' + $scope.alternativeIsoCode;
        $scope.alternativeAmountStr = $filter('noFractionNumber')(alternativeAmountBtc * res.rate, 2) + ' ' + $scope.alternativeIsoCode;
        $scope.$apply();
      }
    });
  };

  $scope.getShortNetworkName = function() {
    var n = fc.credentials.network;
    return n.substring(0, 4);
  };

  $scope.copyToClipboard = function(addr) {
    if (!addr) return;
    self.copyToClipboard(addr);
  };

  $scope.cancel = function() {
    $scope.txDetailsModal.hide();
  };

});
