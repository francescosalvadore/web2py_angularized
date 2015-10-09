//----------------------------------------------------------------------
// Main App AngularJS module: named 'siteApp'
//----------------------------------------------------------------------

// Strict mode: safer to produce a clean code, but some errors may arise,
// in case try to debug or remove the next line...
// http://www.w3schools.com/js/js_strict.asp
"use strict";

window.siteApp = angular.module('siteApp', [
    'ui.router', 
    'ngResource', 
    'remoteValidation', 
    'ui.bootstrap', 
    'ngTouch',              // provides a ngClick improved for touch devices
    // 'ngSanitize',        // sanitize HTML, not used now
    // 'ngAnimate',         // animation support, not used now
    // 'flow',              // ngFlow file uploader, not used now
    // 'truncate'           // truncate.js, support for truncating strings, not used now
 ]);

// Build constant services starting from a config_data dictionary to extract configuration parameter from controllers
// config_data has double nesting because so I can group parameters
var main_url = window.location.origin + '/' + window.location.pathname.split('/')[1];
var config_data = {
    'siteConfig': {
        'main_title': 'web2py angularized',
        'main_url': main_url
    }
}
angular.forEach(config_data,function(key,value) {
  siteApp.constant(value,key);
})


// Configure AngularJS routes
siteApp.config(
    ['$stateProvider', '$urlRouterProvider', '$httpProvider', '$logProvider', '$provide',
    function($stateProvider, $urlRouterProvider, $httpProvider, $logProvider, $provide) {
    // Specify (forcing a bit) the XMLHttpRequest header for the angular partial views.
    // I like it so I can treat that requests as AJAX request, e.g. request.ajax = True in web2py
    // from http://stackoverflow.com/questions/17760096/routeprovider-templateurl-requests-with-x-requested-with-header
        $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    // Default page when the route is wrong
        $urlRouterProvider.otherwise('/logging/welcome');
    // Using html5mode the urls are nicer (without hastag #) but I cannot reload the page
    // with partial views hence I disable it!
    //   $locationProvider.html5Mode(true);

    // Configure the angular $log. A rough configuration can be done via logProvider (just
    // activate or deactivate the debug level)
    //    $logProvider.debugEnabled(true);
    // A better configuration can be done via the decorator:
    // from https://coderwall.com/p/_zporq/logging-in-angular-apps-and-how-to-filter-those-log-messages
        $provide.decorator('$log', function($delegate, $sniffer) {
            var _log = $delegate.log; //Saving the original behavior

            //$delegate.log = function(message) { };

            $delegate.debug = function(message) { 
                console.log("Log Debug: ",message)
            };

            $delegate.error = function(message) {
                console.log("Error Debug: ",message)
            }

            return $delegate;
        });
// Define routes: currently I do not use specific controllers for each route, but global controllers
// BEWARE: logging_ctrl is the controller of logging and it refers to the body.
// Many of the following routes require that the logging_ctrl has been completed.
// Normally, in AngularJS the fact that an inner controller waits the completion
// of the async functions of the external controller requires 'resolve' attribute
// or some other good tecniques. Here, now it seems that anything works because 
// each route correponds to a Web2py route and web2py probably forces the finalization
// of the page until the next page is loaded. Weird however, resolve should be used 
// instead...
$stateProvider

.state('logging', {
    url: '/logging',
    abstract: true,
    templateUrl: 'logging.html',
    controller: 'logging_ctrl',
    resolve: {
        resolve_user: function(logging_factory) {
            var user_dict = {};
            return logging_factory.get_user(user_dict);
        }
    },
})

.state('logging.welcome', {
    url: '/welcome',
    params : {intro_type: ''},
    views: {
        '': {
            templateUrl: 'welcome.html',
            controller: 'welcome_ctrl',
        },
        'welcome_view_1@logging.welcome': {
            templateUrl: 'welcome_view_1.html',
            controller: function($scope){}
        },
        'welcome_view_2@logging.welcome': {
            templateUrl: 'welcome_view_2.html',
            controller: function($scope){}
        }
    } 
})

.state('logging.welcome_logged', {
    url: '/welcome_logged',
    params : {intro_type: ''},
    views: {
        '': {
            // the next is a fake html. web2py translates it providing welcome.html but the action
            // returning the html also fixes the cookies (may I set the cookies always?)
            templateUrl: 'welcome_logged.html',
            controller: 'welcome_ctrl',
        },
        'welcome_view_1@logging.welcome_logged': {
            templateUrl: 'welcome_view_1.html',
            controller: function($scope){}
        },
        'welcome_view_2@logging.welcome_logged': {
            templateUrl: 'welcome_view_2.html',
            controller: function($scope){}
        }
    }  
})

.state('logging.user_login', {
    url: '/user_login',
    templateUrl: 'user_login.html',
    params : {intro_type: '', redirect_page: ''},
    controller: 'user_login_ctrl'
})

.state('logging.user_logout', {
    url: '/user_logout',
    templateUrl: 'user_logout.html'
})

.state('logging.user_register', {
    url: '/user_register',
    templateUrl: 'user_register.html'
})

.state('logging.user_profile', {
    url: '/user_profile',
    templateUrl: 'user_profile.html'
})

.state('logging.user_passwdchange', {
    url: '/user_passwdchange',
    templateUrl: 'user_passwdchange.html'
})

.state('logging.user_reqresetpasswd', {
    url: '/user_reqresetpasswd',
    templateUrl: 'user_reqresetpasswd.html'
})

.state('logging.user_resetpasswd', {
    url: '/user_resetpasswd?key',
    templateUrl: 'user_resetpasswd.html',
    controller: 'user_resetpasswd_ctrl'
})

.state('logging.user_verify', {
    url: '/user_verify?key',
    templateUrl: 'user_verify.html',
    controller: 'user_verify_ctrl'
})

.state('logging.user_manageapprovals', {
    url: '/user_manageapprovals',
    templateUrl: 'user_manageapprovals.html',
    resolve: {
        pending_users: function(logging_factory) {
            return logging_factory.get_pending_users();
        }
    },
    controller: 'user_manageapprovals_ctrl'
})

.state('logging.page1', {
    url: '/page1',
    abstract : true,
    controller: 'page1_ctrl',
    templateUrl: 'page1.html'
})

.state('logging.page1.tab1', {
    url: '/tab1',
    parent: 'logging.page1',
    controller: 'page1tab1_ctrl',
    templateUrl: 'page1tab1.html',
    //RESOLVE resolve:  {
    //     resolve_simple_data: function(simple_page_data) {
    //         return simple_page_data.get_simple_data();
    //     }
    // }
})

.state('logging.page1.tab2', {
    url: '/tab2',
    templateUrl: 'page1tab2.html'
})

.state('logging.page1.tab3', {
    url: '/tab2',
    templateUrl: 'page1tab3.html'
})

.state('logging.page2', {
    url: '/page2',
    templateUrl: 'page2.html'
})

.state('logging.page2.tab1', {
    url: '/tab1',
    templateUrl: 'page2tab1.html'
})

.state('logging.page2.tab2', {
    url: '/tab2',
    templateUrl: 'page2tab2.html'
})

.state('logging.page3', {
    url: '/page3',
    templateUrl: 'page3.html',
    // After failing to access page3 this address is saved and after logging
    // the user is driven here. Two problems:
    // (1) [major problem]: the cookies are not correctly set because only
    // welcome_logged can set them well
    // (2) [important problem]: I can only check that the user is logged after
    // but not with the required privileges
    controller: 'page3_ctrl'
})

.state('logging.page4', {
    url: '/page4',
    templateUrl: 'page4.html'
})

.state('logging.page5', {
    url: '/page5',
    templateUrl: 'page5.html'
})

.state('logging.page6', {
    url: '/page6',
    templateUrl: 'page6.html',
    // This page is available only for web_admin. Another strategy is used here
    // The html is displayed but using ng-if only the message to login is
    // displayed.
})

.state('activate_loading', {
    url: '/activate_loading',
    templateUrl: 'activate_loading.html'
})

}]);


//--------------------------------------------------------
// AngularJS Controllers
//--------------------------------------------------------
siteApp.controller('logging_ctrl',
    ['$scope', '$interval', '$resource', 'siteConfig', 'transitions_factory',
     'logging_factory','resolve_user','$state','$log',
    function($scope, $interval, $resource, siteConfig, transitions_factory, 
        logging_factory, resolve_user, $state, $log) {
        
        $log.debug("logging_ctrl started")

        // Title of the document (e.g., for the navbar title)
        $scope.main_title = siteConfig.main_title;
        $scope.main_url = siteConfig.main_url;
        console.log("main_url: ",$scope.main_url);

        // Content of pages (to be inherited from sub-routes)
        $scope.page_content = {}

        // User info are taken from resolve factory. Now assigned to scope variables.
        $scope.user = {}
        $scope.user.logged = resolve_user.logged;
        $scope.user.web_admin = resolve_user.web_admin;
        $scope.user.username = resolve_user.username;
        $scope.user.user_dict = resolve_user;
        $log.debug("logging user dict: ",$scope.user)

        // TODO: if the user keeps the page opened for a long time, the server auth expiration time
        // may be exceeded. How to reflect this into the javascript code? 
        // This is a possible solution:
        // - The first time get_user is called from the resolve of the route
        // - Then each a certain amount of seconds (e.g. 500000) the authentication is checked again
        //   so that the cookies validity is extended (actually the maximum from expiration time
        //   and browser sessions ends is active)
        // - Note: the authentication is rechecked when changing route only if ui-router reload = true
        // - Beware: the $scope.user in not refreshed each time but if the user_id is still the same,
        //   $scope.user is the same
        var auth_refresh_seconds = 500; 
        var promise = $interval(function() { logging_factory.get_user($scope.user)}, 1000*auth_refresh_seconds);

        // The next functions are put here and not in separate controllers because
        // so I can call the functions from each page (since each page is descendant of logging state)

        // Login 
        $scope.login_user = {}
        $scope.login_user.rememberme = false;

        $scope.login_bare = function(login_user, redirect_page) {
            var resource_url = siteConfig.main_url + "/logging/api_login_bare"
            var user_res = $resource(resource_url,
                {     },
                {'login_bare' : { method: 'POST', isArray: false}}
                );
            user_res.login_bare({'login_user':login_user}).$promise.then(
                function(data) {
                    if(data['logged_user']) {
                        // reload: true is needed to execute the logging controller (get the user dict on scope)
                        if (redirect_page) { // !== undefined) {
                            $log.debug("going to the specified page: ",redirect_page)
                            $state.go(redirect_page,{"intro_type":"logged"},{'reload':true})
                        } else {
                            $log.debug("going to the specified page: ",redirect_page)
                            $state.go("logging.welcome_logged",{"intro_type":"logged"},{'reload':true})
                        }
                    } else {
                        $scope.err_found = true;
                        $scope.err_msg = 'Login failed';
                    }
                    $log.debug("Login was ok: ",login_user)
                } , function(error) {
                    $log.error("Login was NOT ok")
                })
        }

        // Logout
        $scope.logout_bare = function() {
            var resource_url = siteConfig.main_url + "/logging/api_logout_bare"
            var user_res = $resource(resource_url,
                {     },
                {'logout_bare' : { method: 'POST', isArray: false}}
                );
            user_res.logout_bare().$promise.then(
                function(data) {
                    $log.debug("Logout was ok")
                    $state.go("logging.welcome",{"intro_type":"loggedout"},{'reload':true})
                } , function(error) {
                    $log.error("Logout was NOT ok")
                })
        }

        // Register
        $scope.reg_user = {};
        $scope.EMAIL_REGEXP = /^[a-z0-9!#$%&'*+/=?^_`{|}~.-]+@[a-z0-9-]+(\.[a-z0-9-]+)*$/i;

        $scope.register_bare = function(reg_user) {
            var resource_url = siteConfig.main_url + "/logging/api_register_bare"
            var user_res = $resource(resource_url,
                {     },
                {'register_bare' : { method: 'POST', isArray: false}}
                );
            user_res.register_bare({'reg_user':reg_user}).$promise.then(
                function(data) {
                    if(data['err_found']) {
                        $scope.err_found = true;
                        $scope.err_msg = data['err_msg'];
                    } else {
                        $scope.display_msg = true;
                        $scope.msg = "Registration successful. Login as the new user"
                        $log.debug("Registration was ok",reg_user)
                        if(data['to_verify']) var intro_type = "registered_to_verify";
                        if(data['to_approve']) var intro_type = "registered_to_approve";
                        $state.go("logging.welcome",{"intro_type":intro_type},{'reload':false})
                    }
                } , function(error) {
                    $log.error("Registration was NOT ok")
                })
        }

        // Profile edit
        $scope.pro_user = {};
        $scope.pro_user['username'] = resolve_user['username'];
        $scope.pro_user['email'] = resolve_user['email'];
        $scope.pro_user['firstname'] = resolve_user['firstname'];
        $scope.pro_user['lastname'] = resolve_user['lastname'];
        $scope.pro_user['passphrase'] = resolve_user['passphrase'];


        $scope.profile_bare = function(pro_user) {
            var resource_url = siteConfig.main_url + "/logging/api_profile_bare"
            var user_res = $resource(resource_url,
                {     },
                {'profile_bare' : { method: 'POST', isArray: false}}
                );
            user_res.profile_bare({'pro_user':pro_user}).$promise.then(
                function(data) {
                    $log.debug("Profile update was ok",pro_user)
                    $scope.pro_user = {};
                    // reload: true is needed to execute the logging controller (get the modifued user dict on scope)
                    $state.go("^.welcome",{"intro_type":"profileupdated"},{'reload':true})
                } , function(error) {
                    $log.error("Profile update was NOT ok")
                })
        }

        // Password change
        $scope.pc_user = {};

        $scope.passwdchange_bare = function(pc_user) {
            var resource_url = siteConfig.main_url + "/logging/api_passwdchange_bare"
            var user_res = $resource(resource_url,
                {     },
                {'passwdchange_bare' : { method: 'POST', isArray: false}}
                );
            user_res.passwdchange_bare({'pc_user':pc_user}).$promise.then(
                function(data) {
                    if(data['err_found']) {
                        $scope.err_found = true;
                        $scope.err_msg = data['err_msg']
                    } else {
                        $state.go("logging.welcome",{"intro_type":"passwdchanged"},{'reload':true})
                    }
                    $log.debug("Profile update was ok",pc_user)
                } , function(error) {
                    $log.error("Profile update was ok",pc_user)("Password change was NOT ok")
                })
        }

        // Request password reset
        $scope.rp_user = {};

        $scope.reqresetpasswd_bare = function(rp_user) {
            var resource_url = siteConfig.main_url + "/logging/api_reqresetpasswd_bare"
            var user_res = $resource(resource_url,
                {     },
                {'reqresetpasswd_bare' : { method: 'POST', isArray: false}}
                );
            user_res.reqresetpasswd_bare({'rp_user':rp_user}).$promise.then(
                function(data) { 
                    if(data['err_found']) {
                        $scope.err_found = true;
                        $scope.err_msg = data['err_msg']
                    } else {
                        $state.go("logging.welcome",{"intro_type":"reqresetpasswd"},{'reload':true})
                    }
                    $log.debug("Request reset password",rp_user)
                } , function(error) {
                    $log.error("Reset password request was NOT ok")
                })
        }
 
        $log.debug("logging_ctrl finished")

    }]);

siteApp.controller('user_login_ctrl',
    ['$scope', '$stateParams','$log',
    function($scope, $stateParams, $log ) {
        $scope.intro_type = $stateParams.intro_type;
        $scope.redirect_page = $stateParams.redirect_page;
    }]);

siteApp.controller('user_manageapprovals_ctrl',
    ['$scope', '$resource', 'siteConfig', '$stateParams', '$state', 'pending_users', '$log',
    function($scope, $resource, siteConfig, $stateParams, $state, pending_users, $log  ) {

        $scope.pending_users = pending_users;
        $log.debug("pending_users: ",pending_users)

        $scope.approve_user = function(username) {
            var registration_key = $stateParams.key;
            $log.debug("registration_key: ",registration_key)
            var resource_url = siteConfig.main_url + "/logging/api_approve_pending_user"
            var user_res = $resource(resource_url,
                {     },
                {'approve_pending_user' : { method: 'POST', isArray: false}}
                );
            user_res.approve_pending_user({'username':username}).$promise.then(
                function(data) {
                    if(data['err_found']) {
                        $scope.err_found = true;
                        $scope.err_msg = data['err_msg']
                    } else {
                        $state.reload()
                    }
                    $log.debug("Approving user by mail verification",registration_key)
                } , function(error) {
                    $log.error("Approving user was NOT ok")
                })
        }
    }]);

siteApp.controller('user_verify_ctrl',
    ['$scope', '$resource', 'siteConfig', '$stateParams', '$state', '$log',
    function($scope, $resource, siteConfig, $stateParams, $state, $log ) {

        $scope.verify_bare = function() {
            var registration_key = $stateParams.key;
            $log.debug("registration_key: ",registration_key)
            var resource_url = siteConfig.main_url + "/logging/api_verify_bare"
            var user_res = $resource(resource_url,
                {     },
                {'resetpasswd_bare' : { method: 'POST', isArray: false}}
                );
            user_res.resetpasswd_bare({'registration_key':registration_key}).$promise.then(
                function(data) {
                    if(data['err_found']) {
                        $scope.err_found = true;
                        $scope.err_msg = data['err_msg']
                    } else {
                        if(data['to_approve']) {
                            $state.go("logging.welcome",{"intro_type":"verify_to_approve"},{'reload':true})
                        } else {
                            $state.go("logging.welcome",{"intro_type":"verify"},{'reload':true})
                        }
                    }
                    $log.debug("Activating user by mail verification",registration_key)
                } , function(error) {
                    $log.error("Activating user was NOT ok")
                })
        }

        // I call the verify when accessing the page and redirect to welcome if anything is ok
        $scope.verify_bare();
    }]);

siteApp.controller('user_resetpasswd_ctrl',
    ['$scope', '$resource', 'siteConfig', '$stateParams', '$state', '$log',
    function($scope, $resource, siteConfig, $stateParams, $state , $log) {

            $scope.rp_user = {};

            $scope.resetpasswd_bare = function(rp_user) {
                rp_user['reset_key'] = $stateParams.key;
                $log.debug("rp_user: ",rp_user)
                var resource_url = siteConfig.main_url + "/logging/api_resetpasswd_bare"
                var user_res = $resource(resource_url,
                    {     },
                    {'resetpasswd_bare' : { method: 'POST', isArray: false}}
                    );
                user_res.resetpasswd_bare({'rp_user':rp_user}).$promise.then(
                    function(data) {
                        if(data['err_found']) {
                            $scope.err_found = true;
                            $scope.err_msg = data['err_msg']
                        } else {
                            $state.go("logging.welcome",{"intro_type":"resetpasswd"},{'reload':true})
                        }
                        $log.debug("Reset password",rp_user)
                    } , function(error) {
                        $log.error("Registration was NOT ok")
                    })
            }
    }]);


siteApp.controller('welcome_ctrl',
    ['$scope', '$resource', '$location', 'siteConfig', '$timeout', '$stateParams','$log',
    function($scope, $resource, $location, siteConfig, $timeout, $stateParams, $log ) {

        $log.debug("welcome ctrl from user : ",$scope.user)
        $log.debug("welcome intro type : ",$scope.intro_type)
        $scope.intro_type = $stateParams.intro_type;

    }]);

siteApp.controller('page1_ctrl',
    ['$scope', '$resource', '$location', 'siteConfig', '$timeout', '$stateParams','$log',
    function($scope, $resource, $location, siteConfig, $timeout, $stateParams, $log ) {

        $scope.page_content.inner = "page 1 proper content"
        $scope.page_content.page1tab1 = {}
        $scope.page_content.page1tab2 = {}

        $log.debug("page1 ctrl from user : ",$scope.user)

    }]);

// Loading data needed by the controller and the corresponding view can be achieved
// using the route resolve or directly in the controller. The second choice
// seems to be more flexible.
siteApp.controller('page1tab1_ctrl',
    ['$scope', 'simple_page_data', 'transitions_factory', '$log', //USING_RESOLVE 'resolve_simple_data'
    function($scope, simple_page_data, transitions_factory, $log /*USING_RESOLVE ,resolve_simple_data */) {

        // $scope.page_content.page1tab1.inner = "page 1 tab1 proper content"
        $scope.page1tab1_ctrl = {};

        $log.debug("page1tab1 ctrl: ",$scope.page_content)

        //USING_RESOLVE $scope.simple_data = resolve_simple_data;
        //USING_RESOLVE $scope.page1tab1_ctrl.ready = true; 

        var modalinstance_logging = transitions_factory.activate_loading("Getting data...");
        simple_page_data.get_simple_data().then(
            function(data){
                console.log("data: ",data)
                $scope.page1tab1_ctrl.simple_data=data;
                $scope.page1tab1_ctrl.ready = true; 
                transitions_factory.deactivate_loading(modalinstance_logging);
            }, function(error){
                $log.error("Failing when getting data from server")
                transitions_factory.deactivate_loading(modalinstance_logging);
            });

    }]);

siteApp.controller('page1tab2_ctrl',
    ['$scope', '$resource', '$location', 'siteConfig', '$timeout', '$stateParams','$log',
    function($scope, $resource, $location, siteConfig, $timeout, $stateParams, $log ) {

        $scope.page_content.page1tab2.inner = "page 1 tab2 proper content"
        $log.debug("page1tab ctrl: ",$scope.page_content)

    }]);

siteApp.controller('page1tab3_ctrl',
    ['$scope', '$resource', '$location', 'siteConfig', '$timeout', '$stateParams','$log',
    function($scope, $resource, $location, siteConfig, $timeout, $stateParams, $log ) {

        $log.debug("page1tab3 ctrl")

    }]);

siteApp.controller('page3_ctrl',
    ['$scope', '$resource', '$location', 'siteConfig', '$timeout', '$stateParams', '$state','$log',
    function($scope, $resource, $location, siteConfig, $timeout, $stateParams, $state, $log ) {
        if(!$scope.user.logged) {
            $state.go("logging.user_login",
                {
                    "intro_type":"login_required",
                    "redirect_page":"logging.page3",
                },
                {'reload':true});
        }
    }]);


siteApp.controller('activate_loading_ctrl',
    ['$scope', '$modalInstance', 'msg','$log',
    function($scope, $modalInstance, msg, $log) {

        $scope.loading = {};
        $scope.loading.msg = msg;

        $scope.ok = function () {
            $log.debug("Ok on modal");
            $modalInstance.close();
        };

        $scope.cancel = function () {
            $log.debug("Cancel on modal");
            $modalInstance.dismiss();
        };

    }]);

siteApp.factory('transitions_factory',
    ['$modal','$q', 'siteConfig',
    function ($modal, $q, siteConfig) {

        var ret_obj = {};

        // activate transition loading
        var activate_loading = function(msg) {

            var modalInstance = $modal.open({
                size: 'lg',
                templateUrl: siteConfig.main_url + "/routes/activate_loading.html",
                // actually passing scope should be enough, no controller should be needed but,
                // I do not know how to pass the scope!
                controller:  'activate_loading_ctrl',
                windowClass: 'app-modal-window',
                resolve: {
                    msg: function() {
                        return msg
                    }
                }
            });

            return modalInstance;
        }

        // deactivate transition loading
        var deactivate_loading = function(modalInstance) {

            // beware: you MUST wait until the modal is really opened to close it
            // otherwise the close will do nothing and the modal will be opened later and forever!
            modalInstance.opened.then(function() { 
                modalInstance.close(); 
            });
            return null;

        }

        ret_obj.activate_loading   = activate_loading;
        ret_obj.deactivate_loading = deactivate_loading;

        return ret_obj;

}]);


siteApp.factory('logging_factory',
    ['$q', 'siteConfig','transitions_factory','$resource','$log',
    function ($q, siteConfig, transitions_factory, $resource, $log) {

        var ret_obj = {};

        var get_user = function(user_dict) {

            var deferred = $q.defer();

            var resource_url = siteConfig.main_url + "/logging/api_user"
            var user_res = $resource(resource_url,
                {     },
                {'get_user' : { method: 'GET', isArray: false}}
                );
            user_res.get_user({ }).$promise.then(
                function(data) {

                    // var sum=0.;for(var i=0;i<10000000;i++){sum+=Math.sin(parseFloat(i));};console.log("sum:",sum);//Javascript sleep trick

                    $log.debug("User data extracted: ",Math.random(), data)
                    var old_logged_user_id = user_dict.id;
                    var logged_user = data['logged_user'];

                    if (logged_user['logged'] == false) {
                        user_dict = {};
                        user_dict.logged   = false;
                        user_dict.my_groups_role = [];
                        user_dict.allowed_groups_role = [];
                        $log.debug("user_dict.logged false:   ",user_dict.logged);
                    } else {
                        $log.debug("User old/new id: ",old_logged_user_id,logged_user['id']);
                        if(logged_user['id'] != old_logged_user_id) {
                            $log.debug("logging.get_user(): user logged changed")
                            user_dict.logged            = true;
                            user_dict.username          = logged_user['username'];
                            user_dict.firstname         = logged_user['firstname'];
                            user_dict.lastname          = logged_user['lastname'];
                            user_dict.email             = logged_user['email'];
                            user_dict.passphrase        = logged_user['passphrase'];
                            user_dict.id                = logged_user['id'];
                            user_dict.groups            = logged_user['groups'];
                            user_dict.can_create        = logged_user['can_create'];
                            user_dict.web_admin         = logged_user['web_admin'];
                            console.log("logged_user:AAAAAAA ",logged_user)

                            // The concept of allower_groups is useful for web_admin since it is 
                            // has all the groups allowed even if it does not belong to (e.g. when editing
                            // datasets)
                            user_dict.allowed_groups = logged_user['allowed_groups']

                            // user.groups is an object while user.my_groups is an array
                            // containing all the info on the groups (permissions...)
                            // and user.my_groups_role is an array only with the names of the roles
                            // (e.g., to be used in ng-options when creating datasets)
                            $log.debug("user_dict.groups: ",user_dict.groups);
                            user_dict.my_groups = [];
                            user_dict.my_groups_role = [];
                            user_dict.my_default_group = "";
                            var ii_g = 0;
                            for (var i_g=0;i_g < user_dict.groups['n_groups'];i_g++){
                                if(user_dict.groups[i_g]['can_create']) {
                                    $log.debug("ii_g: ",ii_g);
                                    user_dict.my_groups[ii_g] = angular.copy(user_dict.groups[i_g]);
                                    user_dict.my_groups_role[ii_g] = angular.copy(user_dict.groups[i_g]['role']);
                                    if(!user_dict.my_default_group){
                                        user_dict.my_default_group = user_dict.my_groups_role[ii_g]
                                    }
                                    ii_g += 1;
                                }
                            }
                            ii_g = 0;
                            user_dict.allowed_groups_role = [];
                            for (var i_g=0;i_g < user_dict.allowed_groups['n_groups'];i_g++){
                                if(user_dict.allowed_groups[i_g]['can_create']) {
                                    $log.debug("ii_g: ",ii_g);
                                    user_dict.allowed_groups_role[ii_g] = angular.copy(user_dict.allowed_groups[i_g]['role']);
                                    ii_g += 1;
                                }
                            }
                            user_dict.my_default_allowed_group = user_dict.allowed_groups_role[0];

                        } else {
                            $log.debug("logging.get_user(): again the same user:   ",user_dict);
                        }
                    }
                    deferred.resolve(user_dict); 
                }, function(error) {
                    deferred.resolve('Error when getting user information from server!'); 
                    $log.error("Cannot get the user information");
                }); 

            return deferred.promise;
        }

        var get_pending_users = function() {
                
            var deferred = $q.defer();

            var resource_url = siteConfig.main_url + "/logging/api_get_pending_users"
            var user_res = $resource(resource_url,
                {     },
                {'get_pending_users' : { method: 'GET', isArray: false}}
                );
            user_res.get_pending_users({ }).$promise.then(
                function(data) {
                    var pending_users = data['pending_users']              
                    deferred.resolve(pending_users);
                }, function(error) {
                    deferred.resolve('Error when getting pending users information from server!'); 
                    $log.error("Cannot get pending users information");
                }
            ); 

            return deferred.promise;

        }

    ret_obj.get_user            = get_user;
    ret_obj.get_pending_users   = get_pending_users;

    return ret_obj;

}]);

siteApp.factory('simple_page_data',
    ['$q', 'siteConfig','transitions_factory','$resource',
    function ($q, siteConfig, transitions_factory, $resource) {

        var ret_obj = {};

        var get_simple_data = function() {
            
            var deferred = $q.defer();

            var resource_url = siteConfig.main_url + "/pages/api_simple_page_data"
            var user_res = $resource(resource_url,
                {     },
                {'simple_page_data' : { method: 'GET', isArray: false}}
                );
            user_res.simple_page_data({ }).$promise.then(
                function(data) {
                    var simple_data = data['groups']              
                    deferred.resolve(simple_data);
                }, function(error) {
                    deferred.resolve('Error when getting simple data information from server!'); 
                    $log.error("Cannot get simple data information");
                }
            ); 

            return deferred.promise;

        }

    ret_obj.get_simple_data            = get_simple_data;

    return ret_obj;

}]);
