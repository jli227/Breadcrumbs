angular.module('BreadcrumbsApp', ['ui.router', 'ui.bootstrap', 'chart.js'])
    .factory('getUserData', function ($http) {
        return function (baseUrl) {
            var accessToken = window.localStorage.getItem('accessToken')
                endUrl = '&callback=JSON_CALLBACK'; 
            return new Promise(function (resolve, reject) {
                $http.jsonp(baseUrl + accessToken + endUrl)
                    .then(function (response) {
                        resolve(response.data.data);
                    }, function (error) {
                        reject(error);
                    });
            });
        }
    })
    .constant("InstaURL", 'https://api.instagram.com/v1/users/self/')
    .config(function($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('login', {
                url: '/login',
                templateUrl: 'views/login.html',
                controller: 'LoginController'
            })
            .state('main', {
                url: '/main',
                templateUrl: 'views/main.html',
                controller: 'MainController'
            })
            .state('main.photos', {
                url: '/photos',
                templateUrl: 'views/photos.html',
                controller: 'MainController'
            })
            .state('main.trends', {
                url: '/trends',
                templateUrl: 'views/trends.html',
                controller: 'TrendsController'
            })
            .state('main.vince', {
                url: '/vince',
                templateUrl: 'views/vince.html',
                controller: 'VController'
            })
            .state('main.jonathan', {
                url: '/jonathan',
                templateUrl: 'views/jonathan.html',
                controller: 'JController'
            })
            .state('privacy', {
                url: '/privacy',
                templateUrl: 'views/privacy.html',
                controller: "MainController"
            });

        //TODO create controllers
        $urlRouterProvider.otherwise('/login');
    })
    .controller('LoginController', function($scope) {
        $scope.login = function() {
            // paintberi's client stuff
            var clientID = 'b1401358fc42419a8dfbd3ed74b69228',
                redirectUrl = 'http://localhost:8000/paintberi/breadcrumbs/insta-oauth.html',
                url = 'https://instagram.com/oauth/authorize/?client_id=' + 
                        clientID + '&redirect_uri=' + 
                        redirectUrl + '&response_type=token&scope=public_content';

            window.location.href = url;
        }
    })
    .controller('MainController', function($scope, $state, $http, getUserData, InstaURL) {
        // retrieve access token from local storage
        var accessToken = window.localStorage.getItem('accessToken');

        if (!accessToken) {
            $state.go('login');
        } else {
            // base URL for self
            var selfBaseURL = InstaURL + '?access_token=',
            // base URL for self recent
                selfMediaBaseURL = InstaURL + 'media/recent/?access_token=';

            // get current user data from Instagram
            getUserData(selfBaseURL)
                .then(function (response) {
                    $scope.currentUser = {
                        name: response.username,
                        id: response.id,
                        profPic: response.profile_picture
                    }
                }, function (error) {
                    console.log(error);
                });
            
            // get most recent posts
            getUserData(selfMediaBaseURL)
                .then(function (response) {
                    var selfData = {
                        recentPhotos: _.pluck(response, 'images.standard_resolution.url'),
                        recentLikes: _.pluck(response, 'likes.count')
                    };                  
                    $scope.selfRecent = _.zip(selfData.recentPhotos, selfData.recentLikes);
                }, function (error) {
                    console.log(error);
                });            
        }

        // navbar collapse code
        $scope.isCollapsed = true;

        // user logout
        $scope.logout = function() {
            window.localStorage.setItem('accessToken', '');
            $state.go('login');
        };

    })
    .controller('TrendsController', function ($scope, getUserData, InstaURL) {
        // "neater" way of creating the buckets?
        //var likesBucket = {};
        //for (var i = 1; i <= 24; i++) {
        //    likesBucket[i] =  {count: 0, sum: 0, avg: 0};
        //}
        var likesBucket = {
                1: {count: 0, sum: 0, avg: 0},
                2: {count: 0, sum: 0, avg: 0},
                3: {count: 0, sum: 0, avg: 0},
                4: {count: 0, sum: 0, avg: 0},
                5: {count: 0, sum: 0, avg: 0},
                6: {count: 0, sum: 0, avg: 0},
                7: {count: 0, sum: 0, avg: 0},
                8: {count: 0, sum: 0, avg: 0},
                9: {count: 0, sum: 0, avg: 0},
                10: {count: 0, sum: 0, avg: 0},
                11: {count: 0, sum: 0, avg: 0},
                12: {count: 0, sum: 0, avg: 0},
                13: {count: 0, sum: 0, avg: 0},
                14: {count: 0, sum: 0, avg: 0},
                15: {count: 0, sum: 0, avg: 0},
                16: {count: 0, sum: 0, avg: 0},
                17: {count: 0, sum: 0, avg: 0},
                18: {count: 0, sum: 0, avg: 0},
                19: {count: 0, sum: 0, avg: 0},
                20: {count: 0, sum: 0, avg: 0},
                21: {count: 0, sum: 0, avg: 0},
                22: {count: 0, sum: 0, avg: 0},
                23: {count: 0, sum: 0, avg: 0},
                24: {count: 0, sum: 0, avg: 0}
            },
            filterBucket = {},
            getMediaUrl = InstaURL + 'media/recent/?access_token=';

            getUserData(getMediaUrl)
                .then(function (response) {
                    var data = [];

                    response.forEach(function (post) {
                        var time = moment.unix(post.created_time), 
                            hour = time.hour(),
                            minute = time.minute(),
                            likes = post.likes.count,
                            filter = post.filter;

                        likesBucket[hour].count++;
                        likesBucket[hour].sum += likes;
                        likesBucket[hour].avg = likesBucket[hour].sum / likesBucket[hour].count;             

                        if (!filterBucket[filter]) {
                            filterBucket[filter] = {};
                            filterBucket[filter].count = 0;
                            filterBucket[filter].sum = 0;
                        }
                        filterBucket[filter].count++;
                        filterBucket[filter].sum += likes;
                        filterBucket[filter].avg = filterBucket[filter].sum / filterBucket[filter].count;
                    });

                    $scope.likesLabels = Object.keys(likesBucket);
                    $scope.likesData = [_.pluck(likesBucket, 'avg')];
                    $scope.likesSeries = ['Time vs. Average Likes'];

                    $scope.filterLabels = Object.keys(filterBucket);
                    $scope.filterData = [_.pluck(filterBucket, 'avg')];
                    $scope.filterSeries = ['Filter vs. Average Likes'];

                    $scope.$apply();
                }, function (error) {
                    console.log(error);
                });                     
    })
    .controller('VController', function ($scope) {

    })
    .controller('JController', function ($scope, getUserData, InstaURL) {
        var getMediaUrl = InstaURL + 'media/recent/?access_token=';
        var locationBuckets = {};

        getUserData(getMediaUrl)
            .then(function(response) {
                response.forEach(function(post) {
                    var location = post.location  != null ? post.location : {name: "Unknown"};
                    if (!locationBuckets[location]) {
                        locationBuckets[location.name] = {};
                        locationBuckets[location.name].count = 0;
                        locationBuckets[location.name].sum = 0;
                    }
                    locationBuckets[location.name].count++;
                    locationBuckets[location.name].sum += post.likes.count;
                    locationBuckets[location.name].avg = locationBuckets[location.name].sum / locationBuckets[location.name].count;
                });

                $scope.locationLabels = Object.keys(locationBuckets);
                $scope.locationData = [_.pluck(locationBuckets, 'avg')];
                $scope.locationSeries = ['Location vs. Likes'];

                $scope.$apply();
            });
    });