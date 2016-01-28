angular.module('starter.services', [])
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
      query.orderByDesc('createdAt');
      query.find({
        success: function(object){
          defer.resolve(object);
        },error: function(error){
          defer.reject(error);
        }
      });
      return defer.promise;
    },
    search: function(keywords){
      var defer = $q.defer();
      var cs = new CB.CloudSearch('stream');
      cs.searchQuery = new CB.SearchQuery();
      cs.searchFilter = new CB.SearchFilter();
      cs.searchFilter.include('user');
      cs.searchFilter.include('image');
      cs.searchQuery.searchOn('caption', keywords);
      cs.orderByDesc('createdAt');
      cs.search({
        success: function(feed){
          defer.resolve(feed);
        },error: function(err){
          defer.reject(err);
        }
      });
      return defer.promise;
    },
    getAPost: function(id){
      var defer = $q.defer();
      var query = new CB.CloudQuery('stream');
      query.include('user');
      query.include('image');
      query.findById(id, {
        success: function(object){
          defer.resolve(object);
        },error: function(error){
          defer.reject(error);
        }
      });
      return defer.promise;
    }
  };
});
