// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ngCordova', 'ngFileUpload'])

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
  .state('tabs.home', {
    url: "/home",
    views: {
      'home-tab': {
        templateUrl: "templates/home.html",
        controller: 'homeCtrl'
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
  .state('tabs.activity', {
    url: "/activity",
    views: {
      'activity-tab': {
        templateUrl: "templates/activity.html"
      }
    }
  })
  .state('tabs.search', {
    url: "/search",
    views: {
      'search-tab': {
        templateUrl: "templates/search.html",
        controller: "searchCtrl"
      }
    }
  })
  .state('tabs.profile', {
    url: "/profile",
    views: {
      'profile-tab': {
        templateUrl: "templates/profile.html"
      }
    }
  });
  $urlRouterProvider.otherwise('login');
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
