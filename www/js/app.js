// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ngCordova', 'ngFileUpload'])

.run(function($ionicPlatform, $cordovaStatusbar) {
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


.factory('$globalSettings', function(){
    return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    }
  }
})

.factory('$photoConnect', function($q){
  var rootRef = new Firebase('https://camera-iphone.firebaseio.com/');
  return{
    getPhotoStream: function(){
      var images = rootRef.child("images");
      return $q(function (resolve, reject) {
        function successCallback(snapshot) {
            resolve(snapshot.val());
        };

        function cancelCallback(error) {
            reject(error);  // pass along the error object
        };

        images.on("value", successCallback, cancelCallback);
      });

    },
    savePhoto: function(jsonObj){
      var images = rootRef.child("images");
      images.push(jsonObj);
    }
  };
})



.factory('$picService', function($cordovaCamera, $http, $photoConnect){
  return{
    takePicture: function(){
      document.addEventListener("deviceready", function () {

      var options = {
        quality: 50,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.CAMERA,
        allowEdit: true,
        encodingType: Camera.EncodingType.JPEG,
        targetWidth: 500,
        targetHeight: 500,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: false
      };

      // transitionTo() promise will be rejected with
      // a 'transition prevented' error
      $cordovaCamera.getPicture(options).then(function(imageData) {
        var image = document.getElementById('myImage');

        var imageObj = {
          img: "data:image/jpeg;base64," + imageData
        };

        var data = JSON.stringify(imageObj);
        // Simple POST request example (passing data) :
        alert("uploading...");
        $http({
          method: 'POST',
          url: 'http://www.ianfajardo.com/image_upload/index.php',
          data: data,
          headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function(data){
          var timestamp = new Date().getTime();
          var dataFire = {
            img_url: data,
            time: timestamp
          };
          $photoConnect.savePhoto(dataFire);

        });

      }, function(err) {
        // error
        alert('getPic Error');
      });

  }, false);

    }
  }
})

.controller('loginCtrl', function ($scope, $state) {
  $scope.login = function(){
    $state.go('tabs.photostream');
  }

})

.controller('photostreamCtrl', function($rootScope, $ionicLoading, $scope, $photoConnect, $state, $stateParams){

  $scope.viewLoad = function(){
    $scope.show = function() {
      $ionicLoading.show({
        template: '<ion-spinner icon="spiral"></ion-spinner>'
      });
    };
    $scope.hide = function(){
      $ionicLoading.hide();
    };
    $scope.show();
      var promise = $photoConnect.getPhotoStream();
      promise.then(function(photos){
        var photo = photos;
        $scope.photos = photos;
        $scope.hide();
      });
    }

  $scope.viewLoad();

  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){

    if(toState.name == "tabs.photostream"){
      //console.log('event fire:' + toState.name);
      $scope.viewLoad();
    }
  });
})

.controller('cameraCtrl', function($cordovaStatusbar, $cordovaCamera, $scope, $picService, $state){

      document.addEventListener("deviceready", function(){
      $cordovaStatusbar.overlaysWebView(true);

      // styles: Default : 0, LightContent: 1, BlackTranslucent: 2, BlackOpaque: 3
      $cordovaStatusbar.style(1)
    }, false);

      $scope.picture = function(){
        $picService.takePicture();
      }
})

.controller('alarmCtrl', function($scope, $interval, $cordovaLocalNotification, $globalSettings){
  //var init


  var date = new Date();
  $scope.hour = (date.getHours() <= 12) ? addZero(date.getHours()) : addZero(date.getHours()-12);
  $scope.minute = addZero(date.getMinutes());
  $scope.period = "AM";
  $scope.hold = false;



  var promises = {};

  //scope functions
  $scope.increase = function(type, min, max){
    time_increment($scope, type, min, max);
  }

  $scope.decrease = function(type, min, max){
    time_decrement($scope, type, min, max)
  }

  $scope.increaseHold = function(type, min, max){
    var promise = $interval(function(){
      $scope.increase(type, min, max);
    }, 200);
    promises[type] = promise;
  }

  $scope.decreaseHold = function(type, min, max){
    var promise = $interval(function(){
      $scope.decrease(type, min, max);
    }, 200);
    promises[type] = promise;
  }

  $scope.release = function(type){
    $interval.cancel(promises[type]);
  }

  $scope.periodToggle = function(){
    if($scope.period == "AM"){
      $scope.period = "PM";
    }
    else{
      $scope.period = "AM";
    }
  }

  //helper functions
  var time_increment = function($time, prop, min, max){
    $time[prop] = parseInt($time[prop]);
    if($time[prop] < max){
      $time[prop]++;
    }
    else{
      $time[prop] = min;
    }
    $time[prop] = addZero($time[prop]);
  };

  var time_decrement = function($time, prop, min, max){
    $time[prop] = parseInt($time[prop]);
    if($time[prop] > min){
      $time[prop]--;
    }
    else{
      $time[prop] = max;
    }
    $time[prop] = addZero($time[prop]);
  }

  function addZero(i) {
    if (i < 10) {
      i = "0" + i;
    }
    return i;
  }



})
