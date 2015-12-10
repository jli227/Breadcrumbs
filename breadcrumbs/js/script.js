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
            .state('main.activity', {
                url: '/activity',
                templateUrl: 'views/activity.html',
                controller: 'ActivityController'
            })           
            .state('main.privacy', {
                url: '/privacy',
                templateUrl: 'views/privacy.html',
                controller: "MainController"
            });
        $urlRouterProvider.otherwise('/login');
    })
    .controller('LoginController', function($scope) {
        $scope.loggedIn = window.localStorage.getItem('accessToken') != null;
        console.log(window.localStorage.getItem('accessToken'));
        $scope.login = function() {
            var clientID = 'b1401358fc42419a8dfbd3ed74b69228',
                redirectUrl = 'http://localhost:8000/paintberi/breadcrumbs/insta-oauth.html';
            window.location.href = 'https://instagram.com/oauth/authorize/?client_id=' +
                clientID + '&redirect_uri=' +
                redirectUrl + '&response_type=token&scope=public_content';;
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
                        name: response.full_name.replace(/\b./g, function(text){ return text.toUpperCase(); }),
                        username: response.username,
                        id: response.id,
                        profPic: response.profile_picture
                    }
                }, function (error) {
                    console.log(error);
                });
            
            // get most recent posts
            getUserData(selfMediaBaseURL)
                .then(function (response) {
                    if (response.length === 0) {
                        $scope.noPosts = true;
                    } else {
                        var selfData = {
                            recentPhotos: _.pluck(response, 'images.standard_resolution.url'),
                            recentLikes: _.pluck(response, 'likes.count'),
                            photoLinks: _.pluck(response, 'link')
                        };
                        $scope.selfRecent = _.zip(selfData.recentPhotos, selfData.recentLikes, selfData.photoLinks);
                    }
                    $scope.$apply();
                }, function (error) {
                    console.log(error);
                });
        }

        // navbar collapse code
        $scope.isCollapsed = true;

        $scope.instaLink = function() {
            window.open('https://www.instagram.com/' + $scope.currentUser.username);
        };

        // user logout
        $scope.logout = function() {
            window.localStorage.removeItem('accessToken');
            var logoutWin = window.open('https://www.instagram.com/accounts/logout', '_blank');
            $state.go('login');
            setTimeout(function() {logoutWin.close();}, 500);
        };
    })
    .controller('TrendsController', function ($scope, getUserData, $state, InstaURL) {
        var likesBucket = {},
            filterBucket = {},
            locationBuckets = {},
            getMediaUrl = InstaURL + 'media/recent/?access_token=';
        
        for (var i = 0; i <= 23; i++) {
           likesBucket[i] =  {count: 0, sum: 0, avg: 0};
        }

        getUserData(getMediaUrl)
            .then(function(response) {
                if (response.length === 0) {
                    $scope.noPosts = true;
                } else {
                    response.forEach(function (post) {
                        var time = new Date(post.created_time * 1000),
                            hour = time.getHours(),
                            likes = post.likes.count,
                            filter = post.filter,
                            location = post.location != null ? post.location : {name: "Unknown"};
                        likesBucket[hour].count++;
                        likesBucket[hour].sum += likes;
                        likesBucket[hour].avg = likesBucket[hour].sum / likesBucket[hour].count;

                        if (!filterBucket[filter]) {
                            filterBucket[filter] = {count: 0, sum: 0};
                        }
                        filterBucket[filter].count++;
                        filterBucket[filter].sum += likes;
                        filterBucket[filter].avg = filterBucket[filter].sum / filterBucket[filter].count;

                        if (!locationBuckets[location]) {
                            locationBuckets[location.name] = {count: 0, sum: 0};
                        }
                        locationBuckets[location.name].sum += likes;
                    });

                    $scope.likesLabels = Object.keys(likesBucket).map(function (key) {
                        return key + ':00';
                    });
                    $scope.likesData = [_.pluck(likesBucket, 'avg')];
                    $scope.likesSeries = ['Time vs. Average Likes'];

                    $scope.filterLabels = Object.keys(filterBucket);
                    $scope.filterData = [_.pluck(filterBucket, 'avg')];
                    $scope.filterSeries = ['Filter vs. Average Likes'];

                    $scope.locationLabels = Object.keys(locationBuckets);
                    $scope.locationData = [_.pluck(locationBuckets, 'sum')];
                    $scope.locationSeries = ['Location vs. Likes'];

                    $scope.locationOptions = {
                        toolTipTemplate: function(label) {
                            return 'Total Likes : ' + round(label.value);
                        }
                    };

                    $scope.options = {
                        tooltipTemplate: function (label) {
                            return 'Average likes : ' + round(label.value);
                        }
                    };
                }
                $scope.$apply();
            }, function (error) {
                console.log(error);
            }); 

        function round(num) {
            return Math.round(num * 100) / 100;
        } 
                    
    })
    .controller('ActivityController', function ($scope, getUserData, InstaURL) {
        var getMediaUrl = InstaURL + 'media/recent/?access_token=';

        // get user most recent post
        getUserData(getMediaUrl).then(function(response) {
            var dates = _.pluck(response, 'created_time').map(
                function(item) {
                    return moment.unix(item);
                });

            // date difference between most recent and most earliest posts
            var dateDiffWeeksByYear = (dates[0] - dates[dates.length - 1]) / 604800000 / 52;

            // max and min years of posts
            var maxYear = dates[0].year();
            var minYear = dates[dates.length - 1].year();

            // fits the data depending on how spread apart the data is.
            $scope.fitData = function(moreThanYear) {
                if (moreThanYear) {
                    dates.forEach(function(x) {
                        var index = x.week() - 1;
                        $scope.data[0][index]++;
                    });

                    $scope.labels = _.fill(Array(52), '');
                    $scope.labels[0] = "January " + maxYear;
                    $scope.labels[26] = "Mid " + maxYear;
                    $scope.labels[51] = maxYear + 1;
                } else {
                    dates.forEach(function(x) {
                        var year = maxYear - x.year();
                        var index = ($scope.yearDateDiff - year - 1) * 51 + (x.week() - 1);

                        $scope.data[0][index]++;
                    });

                    $scope.labels = _.fill(Array(52 * $scope.yearDateDiff), '');
                    var count = 0;
                    for (var idx = minYear; idx < maxYear; idx++) {
                        var start = count * 51;
                        $scope.labels[start] = "January " + idx;
                        $scope.labels[start + 26] = "Mid " + idx;
                        count++
                    }
                    $scope.labels[$scope.labels.length - 1] = maxYear;
                    count = 0; // can be removed, right?
                }
            };

            if (dateDiffWeeksByYear < 1) {
                $scope.data = [_.fill(new Array(52), 0)];

                $scope.fitData(true);
            } else {
                $scope.yearDateDiff = Math.ceil(dateDiffWeeksByYear);
                $scope.data = [_.fill(new Array(52 * $scope.yearDateDiff), 0)];

                $scope.fitData(false);
            }

            // tags
            var tags = _.flattenDeep(_.pluck(response, 'tags'));
            var groupedTags = _.countBy(tags, function (n) {
                return "#" + n;
            });

            $scope.tags = [];
            $scope.tagValues = [];
            _.forEach(groupedTags, function (value, key) {
                $scope.tags.push(key);
                $scope.tagValues.push(value);
            });

            if ($scope.tags.length === 0) {
                $scope.emptyTags = true;
            }

            $scope.$apply();
        }, function(error) {
            console.log(error);
        });
    });