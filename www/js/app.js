// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ngCordova', 'ngFileUpload'])

.run(function($ionicPlatform, $cordovaStatusbar) {
  CB.CloudApp.init('instagram', 'aCU3kLvpDnZXbJjS3iPGRQ==');
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs

    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})
.config(function($stateProvider, $urlRouterProvider){
  $stateProvider
  .state('login', {
    url: "/login",
    templateUrl: "templates/login.html",
    controller: 'loginCtrl'
  })
  .state('tabs', {
    url: "/tabs",
    abstract: true,
    templateUrl: "templates/tabs.html",
    controller: "cameraCtrl"
  })
  .state('tabs.photostream', {
    url: "/photostream",
    views: {
      'photostream-tab': {
        templateUrl: "templates/photostream.html",
        controller: 'photostreamCtrl'
      }
    }
  })
  .state('tabs.camera', {
    url: "/camera",
    views: {
      'camera-tab': {
        templateUrl: "templates/camera.html"
      }
    }
  })
  .state('tabs.favorites', {
    url: "/favorites",
    views: {
      'favorites-tab': {
        templateUrl: "templates/favorites.html"
      }
    }
  })
  .state('tabs.setAlarm', {
    url: "/setAlarm",
    views: {
      'setAlarm-tab': {
        templateUrl: "templates/editAlarm.html",
        controller: "alarmCtrl"
      }
    }
  })
  .state('tabs.settings', {
    url: "/settings",
    views: {
      'settings-tab': {
        templateUrl: "templates/settings.html"
      }
    }
  });
  $urlRouterProvider.otherwise('login');
})

.filter('reverse', function() {
  return function(items) {
    var filtered = [];
    angular.forEach(items, function(item) {
      filtered.push(item);
    });
    return filtered.reverse();
  };
})

.factory('authFact', function ($cookieStore) {
      var authFact = {};

      this.authToken = null;

      authFact.setAccessToken = function(authToken) {
          $cookieStore.put('accessToken', authToken);
      };

      authFact.getAccessToken = function() {
          authFact.authToken = $cookieStore.get('accessToken');
          return authFact.authToken;
      };

      authFact.getuserObj = function () {
          var userObj = $cookieStore.get('userObj');

          if (userObj)
              return userObj;
          else
              console.log('User object not found');
      };

      return authFact;
})
.factory('facebookLogin', function ($q) {
    return {
     userAccount: function(profile){
       var profileId = profile.id;
       var email = profile.email;
       var name = profile.first_name + " " + profile.last_name;
       var picture = 'https://graph.facebook.com/' + profile.id + '/picture?type=large';
       var defer = $q.defer();
       var cbquery = new CB.CloudQuery('User');
       cbquery.equalTo('facebook', profileId);
       cbquery.find({
         success: function(object){
           if(object.length > 0){
              defer.resolve(object[0]);
           }else{
              var cbuser = new CB.CloudObject('User');
              cbuser.set('username', email || profileId);
              cbuser.set('email', email || profileId + "@mail.com");
              cbuser.set('password', '2zBIht@mePh<1Rf'); //dummy password
              cbuser.set('facebook', profileId);
              cbuser.set('picture', picture);
              cbuser.set('name', name);
              cbuser.save({
                success: function(user){
                  defer.resolve(user);
                },
                error: function(err){
                  defer.reject(err);
                }
              });
           }
         },
         error: function(err){
           defer.reject(err);
         }
       });
       return defer.promise;
     }
   };
 })
.factory('UploadService', function($http, $q){
  return {
    imageUpload: function(imageFile){
      var defer = $q.defer();
      var file = new CB.CloudFile(imageFile);
      file.save({
        success: function(url){
          defer.resolve(url);
        },
        error: function(err){
          defer.reject(err);
        }
      });
      return defer.promise;
    }
  };
})
.factory('Stream', function($http, $q){
  return {
    addNew: function(data, userId){
      var defer = $q.defer();
      var object = new CB.CloudObject("stream");
      var user = new CB.CloudObject('User', userId);
      object.set('caption', data.caption);
      object.set('image', data.file);
      object.set('user', user);
      object.save({
        success: function(newItem){
          defer.resolve(newItem);
        },
        error: function(err){
          defer.reject(err);
        }
      });
      return defer.promise;
    },
    feed: function(){
      var defer = $q.defer();
      var query = new CB.CloudQuery('stream');
      query.include('user');
      query.include('image');
      query.find({
        success: function(object){
          defer.resolve(object);
        },error: function(error){
          defer.reject(error);
        }
      });
      return defer.promise;
    }
  };
})
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
                  $state.go('tabs.photostream');
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
.controller('photostreamCtrl', function($rootScope, $ionicLoading, $scope, $state, $stateParams, Stream){
  $scope.photos = [];
  Stream.feed().then(function(feed){
    $scope.photos = CB.toJSON(feed);
  }).catch(function(){

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

        }).catch(function(){

        });
      }).catch(function(err){
        console.log("error"+ err);
      });
    }else {
      console.log("Select an image");
    }
  };
})
.controller('alarmCtrl', function($scope){

});

window.fbAsyncInit = function() {
   FB.init({
     appId      : '959616540774994',
     xfbml      : true,
     version    : 'v2.5'
   });
 };

 (function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));
