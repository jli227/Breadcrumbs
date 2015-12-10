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
    .controller('MainController', function($scope, $state, $http, getUserData) {
        // retrieve access token from local storage
        var accessToken = window.localStorage.getItem('accessToken');

        if (!accessToken) {
            $state.go('login');
        } else {
            // base URL for self

            var selfBaseURL = 'https://api.instagram.com/v1/users/self/?access_token=',
            // base URL for self recent
                selfMediaBaseURL = 'https://api.instagram.com/v1/users/self/media/recent/?access_token=';    

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
                    // console.log(response);
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
    .controller('TrendsController', function ($scope, getUserData) {
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
            getMediaUrl = 'https://api.instagram.com/v1/users/self/media/recent/?access_token=';

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
    .controller('VController', function ($scope, getUserData) {
        var getMediaUrl = 'https://api.instagram.com/v1/users/self/media/recent/?access_token=';

        $scope.options = {
            chart: {
                type: 'historicalBarChart',
                height: 450,
                margin : {
                    top: 20,
                    right: 20,
                    bottom: 65,
                    left: 50
                },
                x: function(d){return d[0];},
                y: function(d){return d[1]/100000;},
                showValues: true,
                valueFormat: function(d){
                    return d3.format(',.1f')(d);
                },
                duration: 100,
                xAxis: {
                    axisLabel: 'X Axis',
                    tickFormat: function(d) {
                        return d3.time.format('%x')(new Date(d))
                    },
                    rotateLabels: 30,
                    showMaxMin: false
                },
                yAxis: {
                    axisLabel: 'Y Axis',
                    axisLabelDistance: -10,
                    tickFormat: function(d){
                        return d3.format(',.1f')(d);
                    }
                },
                tooltip: {
                    keyFormatter: function(d) {
                        return d3.time.format('%x')(new Date(d));
                    }
                },
                zoom: {
                    enabled: true,
                    scaleExtent: [1, 10],
                    useFixedDomain: false,
                    useNiceScale: false,
                    horizontalOff: false,
                    verticalOff: true,
                    unzoomEventType: 'dblclick.zoom'
                }
            }
        };

        $scope.data = [
            {
                "key" : "Quantity" ,
                "bar": true,
                "values" : [[ 1136005200000 , 1271000.0] , [ 1138683600000 , 1271000.0] , [ 1141102800000 , 1271000.0] , [ 1143781200000 , 0] , [ 1146369600000 , 0] , [ 1149048000000 , 0] , [ 1151640000000 , 0] , [ 1154318400000 , 0] , [ 1156996800000 , 0] , [ 1159588800000 , 3899486.0] , [ 1162270800000 , 3899486.0] , [ 1164862800000 , 3899486.0] , [ 1167541200000 , 3564700.0] , [ 1170219600000 , 3564700.0] , [ 1172638800000 , 3564700.0] , [ 1175313600000 , 2648493.0] , [ 1177905600000 , 2648493.0] , [ 1180584000000 , 2648493.0] , [ 1183176000000 , 2522993.0] , [ 1185854400000 , 2522993.0] , [ 1188532800000 , 2522993.0] , [ 1191124800000 , 2906501.0] , [ 1193803200000 , 2906501.0] , [ 1196398800000 , 2906501.0] , [ 1199077200000 , 2206761.0] , [ 1201755600000 , 2206761.0] , [ 1204261200000 , 2206761.0] , [ 1206936000000 , 2287726.0] , [ 1209528000000 , 2287726.0] , [ 1212206400000 , 2287726.0] , [ 1214798400000 , 2732646.0] , [ 1217476800000 , 2732646.0] , [ 1220155200000 , 2732646.0] , [ 1222747200000 , 2599196.0] , [ 1225425600000 , 2599196.0] , [ 1228021200000 , 2599196.0] , [ 1230699600000 , 1924387.0] , [ 1233378000000 , 1924387.0] , [ 1235797200000 , 1924387.0] , [ 1238472000000 , 1756311.0] , [ 1241064000000 , 1756311.0] , [ 1243742400000 , 1756311.0] , [ 1246334400000 , 1743470.0] , [ 1249012800000 , 1743470.0] , [ 1251691200000 , 1743470.0] , [ 1254283200000 , 1519010.0] , [ 1256961600000 , 1519010.0] , [ 1259557200000 , 1519010.0] , [ 1262235600000 , 1591444.0] , [ 1264914000000 , 1591444.0] , [ 1267333200000 , 1591444.0] , [ 1270008000000 , 1543784.0] , [ 1272600000000 , 1543784.0] , [ 1275278400000 , 1543784.0] , [ 1277870400000 , 1309915.0] , [ 1280548800000 , 1309915.0] , [ 1283227200000 , 1309915.0] , [ 1285819200000 , 1331875.0] , [ 1288497600000 , 1331875.0] , [ 1291093200000 , 1331875.0] , [ 1293771600000 , 1331875.0] , [ 1296450000000 , 1154695.0] , [ 1298869200000 , 1154695.0] , [ 1301544000000 , 1194025.0] , [ 1304136000000 , 1194025.0] , [ 1306814400000 , 1194025.0] , [ 1309406400000 , 1194025.0] , [ 1312084800000 , 1194025.0] , [ 1314763200000 , 1244525.0] , [ 1317355200000 , 475000.0] , [ 1320033600000 , 475000.0] , [ 1322629200000 , 475000.0] , [ 1325307600000 , 690033.0] , [ 1327986000000 , 690033.0] , [ 1330491600000 , 690033.0] , [ 1333166400000 , 514733.0] , [ 1335758400000 , 514733.0]]
            }];
    })
    .controller('JController', function ($scope) {


    });