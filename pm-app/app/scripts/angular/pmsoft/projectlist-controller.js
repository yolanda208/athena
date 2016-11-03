/**
 * Created by FanTaSyLin on 2016/11/3.
 */

(function () {

    'use strict';

    angular.module('PMSoft')
        .controller('ProjectListController', ProjectListController);

    ProjectListController.$inject = ['$rootScope', '$cookies', 'PMSoftServices'];

    function ProjectListController($rootScope, $cookies, PMSoftServices) {
        var self = this;
        var myStar = {};

        self.account = '';
        self.projectList = [];
        self.starProjectList = [];

        self.init = _init;
        self.starred = _starred;


        $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {

            _init();

        });

        function _init() {

            if (window.location.hash === '#/project') {

                //alert('ProjectListController');

                self.account = $cookies.get('account');
                myStar = $cookies.getObject('mystar-project');
                if (!myStar) {
                    myStar = [];
                }

                /*if ($cookies.hasOwnProperty('mystar-project')) {
                 myStar = JSON.parse($cookies.get('mystar-project'));
                 } else {
                 myStar = [];
                 }*/

                PMSoftServices.getPastProjects(self.account, function (data) {
                    //TODO: 目前只添加了需要的字段，后续如果不够吃再加
                    self.projects = [];
                    data.forEach(function (item) {
                        var project = {};
                        project.cnName = item.cnName;
                        project._id = item._id;
                        project.enName = item.enName;
                        project.about = item.about;
                        project.type = item.type;
                        project.unread = false;
                        project.isStarred = false;
                        project.reviewers = item.reviewers;
                        for (var i = 0; i < item.reviewers.length; i++) {
                            if (item.reviewers[i].account === self.account) {
                                self.projectList.push(project);
                                break;
                            }
                        }
                    });
                    //获取星标项目
                    _getStarProjectList();
                });
            }

        }

        function _getStarProjectList() {
            self.starProjectList = [];
            for (var i = 0; i < self.projectList.length; i++) {
                var item = self.projectList[i]
                for (var j = 0; j < myStar.length; j++) {
                    if (myStar[j] === item._id) {
                        item.isStarred = true;
                        self.starProjectList.push(item);
                        break;
                    }
                }
            }
            /*self.projectList.forEach(function (item) {
                for (var i = 0; i < myStar.length; i++) {
                    if (myStar[i] === item._id) {
                        item.isStarred = true;
                        self.starProjectList.push(item);
                        break;
                    }
                }
            });*/
        }

        function _starred(project) {
            project.isStarred = !project.isStarred;
            if (project.isStarred === true) {
                myStar.push(project._id);
                self.starProjectList.push(project);
            } else {
                var index = -1;
                for (var i = 0; i < myStar.length; i++) {
                    if (myStar[i] === project._id) {
                        index = i;
                        break;
                    }
                }
                if (index !== -1) {
                    myStar.splice(index, 1);
                }
                index = -1;
                for (var i = 0; i < self.starProjectList.length; i++) {
                    if (self.starProjectList[i]._id === project._id) {
                        index = i;
                        break;
                    }
                }
                if (index !== -1) {
                    self.starProjectList.splice(index, 1);
                }
            }
            var expireTime = new Date();
            expireTime.setDate(expireTime.getDate() + 7000);
            $cookies.putObject('mystar-project', myStar, {'expires': expireTime});
        }

    }

})();