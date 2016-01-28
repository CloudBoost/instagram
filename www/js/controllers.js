angular.module('starter.controllers', [])
.controller('loginCtrl', function ($scope, $state, $rootScope, $location, $http, facebookLogin) {
  $scope.facebookLogin = function () {
    FB.login(function (response) {
      if (response.authResponse) {
          console.log('Welcome!  Fetching your information.... ');
          FB.api('/me', function (response) {
              /*setting the user object*/
              console.log('user', response);
              /*get the access token*/
              var FBAccessToken = FB.getAuthResponse().accessToken;
              console.log('access token', FBAccessToken);
              $http.get("https://graph.facebook.com/v2.2/me", { params: { access_token: FBAccessToken, fields: "id, email, first_name, last_name, gender, birthday, location", format: "json" }}).then(function(result) {
                var profile = result.data;
                facebookLogin.userAccount(profile).then(function(data) {
                  $rootScope.user = data.document;
                  $state.go('tabs.home');
                  //$scope.$apply();
                }).catch(function(err) {
                  console.log(err);
                });
              }).catch(function(err){
                console.log(err);
              });
          });
      } else {
          console.log('User cancelled login or did not fully authorize.');
      }
  });
 };
})
.controller('homeCtrl', function($rootScope, $ionicLoading, $scope, $state, $stateParams, Stream){
  $scope.photos = [];
  Stream.feed().then(function(feed){
    $scope.photos = CB.toJSON(feed);
  }).catch(function(){

  });

  //real time
  CB.CloudObject.on('stream', 'created', function(obj){
    Stream.getAPost(obj.document._id).then(function(post){
      $scope.photos.unshift(CB.toJSON(post));
    }).catch(function(err){
      console.log(err);
    });
  });

})
.controller('cameraCtrl', function( $scope, $rootScope, $state, UploadService, Stream){
  $scope.image = {};
  $scope.upload = function() {
    $scope.updating = true;
    $scope.saving=true;
    if($scope.image.file){
      UploadService.imageUpload($scope.image.file).then(function(obj){
        $scope.image.file = obj;
        Stream.addNew($scope.image, $rootScope.user._id).then(function(item){
          $scope.image = {};
        }).catch(function(err){
          console.log(err);
        });
      }).catch(function(err){
        console.log("error"+ err);
      });
    }else {
      console.log("Select an image");
    }
  };
})
.controller('searchCtrl', function($scope, Stream){
  $scope.photos = [];
  $scope.search = function(term){
    Stream.search(term).then(function(feed){
      $scope.photos = CB.toJSON(feed);
    }).catch(function(err){
      console.log(err);
    });
  };
});
