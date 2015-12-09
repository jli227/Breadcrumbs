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
            .state('main.ena', {
                url: '/ena',
                templateUrl: 'views/ena.html',
                controller: 'EController'
            })
            .state('main.vince', {
                url: '/vince',
                templateUrl: 'views/vince.html',
                controller: 'VController'
            })
            .state('main.johnathan', {
                url: '/johnathan',
                templateUrl: 'views/johnathan.html',
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
        /*
            This part requires some customization (just for this stage of development)
            the clientID and redirectURL are mine (ena's), yours will probs be different

            1. go to https://www.instagram.com/developer/
            2. sign in
            3. click "Manage Clients" in the navbar on the upper right
            4. register a client 
            5. fill out things in 'Details' tab
            6. go to the 'Security' tab, uncheck 'Disable implicit OAuth' **important**
            7. register
            8. update the variables below, 
                maybe we should just comment out each others while we are developing?
         */

            //TODO create paintberi instagram account to make universal clientID

            //ena's client stuff
            var clientID = 'e2fad0935d07402c9c5a68287915d997';
            var redirectUrl = 'http://localhost:8000/insta-oauth.html';

            //vince's client stuff
            // var clientID = 'ab1c06711b0046b995f3b42fd2ee5b33';
            // var redirectUrl = 'http://localhost:8000/paintberi/breadcrumbs/insta-oauth.html';

            var url = 'https://instagram.com/oauth/authorize/?client_id=' + 
                        clientID + '&redirect_uri=' + 
                        redirectUrl + '&response_type=token';

            window.location.href = url;
        }
    })
    .controller('MainController', function($scope, $state, $http, getUserData) {
        // retrieve access token from local storage
        var accessToken = window.localStorage.getItem('accessToken');

        if (!accessToken) {
            $state.go('login');
        } else {
            // base URL for self
            var selfBaseURL = 'https://api.instagram.com/v1/users/self/?access_token=';

            // base URL for self recent
            var selfMediaBaseURL = 'https://api.instagram.com/v1/users/self/media/recent/?access_token=';

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
                })
        }

        // navbar collapse code
        $scope.isCollapsed = true;

        // user logout
        $scope.logout = function() {
            window.localStorage.setItem('accessToken', '');

            //TODO figure out logout while avoiding header issues with server
            $('#logout').html('<img src="https://instagram.com/accounts/logout/" width="0" height="0">');
            $state.go('login');
        };

    })
    .controller('EController', function ($scope, getUserData) {
        $scope.labels;        
        $scope.data;
        $scope.series;

        var getMediaUrl = 'https://api.instagram.com/v1/users/self/media/recent/?access_token=';
        getUserData(getMediaUrl)
            .then(function (response) {
                console.log(response);
                var data = [];
                response.forEach(function (post) {
                    var time = moment.unix(post.created_time); 
                    var hour = time.hour();
                    var minute = time.minute();     

                    var label = (hour > 12) ? hour - 12 : hour;
                    label += ':';
                    label += (minute < 10) ? '0' + minute : minute;
                    label += (hour > 12) ? ' PM' : ' AM';

                    data.push({
                        hour: hour,
                        minute: minute,
                        label: label,
                        likes: post.likes.count,
                        info: post
                    });                    
                });   
                data = _.sortByAll(data, ['hour', 'minute']);
                
                $scope.labels = _.pluck(data, 'label');
                $scope.data = [_.pluck(data, 'likes')];
                $scope.series = ['Time vs. Likes'];
                $scope.onClick = function (points, evt) {
                    console.log(points, evt);
                }

                $scope.$apply();
            }, function (error) {
                console.log(error);
            }); 
    })
    .controller('VController', function ($scope) {

    })
    .controller('JController', function ($scope) {

    });