angular.module('app')
.service('WarnWipToast', function($mdToast) {
  var svc = this;

  function showInitialWarning() {
    return $mdToast.show($mdToast.simple()
      .content('Please keep in mind that this app is in pre-pre-beta :)')
      .action('ok')
      .position('bottom left')
      .hideDelay(10000)
    );
  }

  function showFollowup() {
    return $mdToast.show({
      templateUrl: 'app/components/warnWip/warnWipToast.html',
      controller: 'WarnWipToastCtrl',
      controllerAs: 'warnWipToast',
      position: 'bottom left',
      hideDelay: 10000
    });
  }

  svc.show = function() {
    showInitialWarning()
      .then(showFollowup);
  };

});
