'use strict';
//   __  __   __  __    _____   ______   ______   __  __   _____     
//  /\ \/\ \ /\ \/\ \  /\___ \ /\__  _\ /\  _  \ /\ \/\ \ /\  __`\   
//  \ \ \_\ \\ \ \ \ \ \/__/\ \\/_/\ \/ \ \ \/\ \\ \ `\\ \\ \ \ \_\  
//   \ \  _  \\ \ \ \ \   _\ \ \  \ \ \  \ \  __ \\ \ . ` \\ \ \ =__ 
//    \ \ \ \ \\ \ \_\ \ /\ \_\ \  \_\ \__\ \ \/\ \\ \ \`\ \\ \ \_\ \
//     \ \_\ \_\\ \_____\\ \____/  /\_____\\ \_\ \_\\ \_\ \_\\ \____/
//      \/_/\/_/ \/_____/ \/___/   \/_____/ \/_/\/_/ \/_/\/_/ \/___/ 
//                                                                   
//                                                                   

/**
 * @name 按钮控件
 * @public
 * @author haiyang5210
 * @date 2014-11-15 19:53
 * @param {Object} options 控件初始化参数.
 */
hui.define('hui_burndown', ['hui_util', 'hui_control', 'hui_requester', 'highcharts', 'jquery'], function () {

    hui.Burndown = function (options, pending) {
        hui.Burndown.superClass.call(this, options, 'pending');
        this.type = 'taskboard';

        //进入控件处理主流程!
        if (pending != 'pending') {
            this.enterControl();
        }
    };

    hui.Burndown.prototype = {
        /**
         * @name 渲染控件
         * @public
         */
        render: function () {
            hui.Burndown.superClass.prototype.render.call(this);
            var me   = this;
            me.getTasklog();

        },
        getTasklog: function () {
            var me = this;
            Requester.get('/ue_api/internal/tasklog_list?product_id=' + me.product_id + '&sprint_id=' + me.sprint_id, {
                onsuccess: function (data) {
                    //me.model.set('task_list'   , _.sortBy(data[1].items, 'task_index').reverse());
                    var uniq = {};
                    var item;
                    var str;
                    var key;
                    var list = data[1].items;
                    var day = {};
                    var taskid = {};
                    for (var i=0,len=list.length; i<len; i++) {
                        item = list[i];
                        str = item.update_time.split(' ');
                        key = str[0] + '_' + item.task_id;
                        if (!uniq[key]) {
                            uniq[key] = [str[1], item];
                        }
                        else if (str[1] > uniq[key][0]) {
                            uniq[key] = [str[1], item];
                        }
                        day[str[0]] = str[0];
                        taskid[item.task_id] = item.task_id;
                    }
                    console.log(uniq);
                    list = [];
                    for (var i in day) {
                        list.push(i);
                    }
                    day = list.sort();
                    list = [];
                    for (var i in taskid) {
                        list.push(i);
                    }
                    taskid = list;

                    for (var i=1,len=day.length; i<len; i++) {
                        for (var j=0,len2=taskid.length; j<len2; j++) {
                            key = day[i] + '_' + taskid[j];
                            if (!uniq[key]) {
                                uniq[key] = uniq[day[i-1] + '_' + taskid[j]];
                            }
                        }
                    }

                    uniq = uniq;
                    var leftTask;
                    var leftHour;
                    var leftTaskList = [];
                    var leftHourList = [];
                    var referHourList = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

                    for (var i=0,len=day.length; i<len; i++) {
                        leftTask = 0;
                        leftHour = 0;
                        for (var j=0,len2=taskid.length; j<len2; j++) {
                            key = day[i] + '_' + taskid[j];
                            if (uniq[key] && uniq[key][1] && uniq[key][1].task_status !== 'done') {
                                leftTask++;
                                leftHour += Number(uniq[key][1].task_remaining);
                            }
                        }
                        leftTaskList.push(leftTask);
                        leftHourList.push(leftHour);
                    }

                    for (var i = 1,len = Math.max(referHourList.length - day.length + 1, 2); i < len; i++) {
                        day.push(hui.util.formatDate(hui.util.parseDate(new Date().getTime()+i*24*60*60*1000), 'yyyy-MM-dd'));
                    };
                    
                    me.getTasklogCallback({day: day, leftTaskList: leftTaskList, leftHourList: leftHourList, referHourList: referHourList});
                }
            });
        },
        getTasklogCallback: function (doc) {
            var me = this;
            var main = me.getMain();
            $(main).highcharts({
                title: {
                    text: '　', //Burndown Chart
                    x: -20 //center
                },
                xAxis: {
                    categories: doc.day,//['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                },
                yAxis:[
                    {
                        lineWidth : 1,
                        title:{
                            text :'Tasks remaining'
                        },
                        max123: 100,
                        min: 0
                    },
                    {
                        title:{text :'Hours remaining'},
                        lineWidth : 1,
                        opposite:true,
                        max123: 800,
                        min: 0
                    }
                ],
                tooltip: {
                    enabled: false
                },
                series: [{
                    data: doc.leftTaskList, //[20,45,60,50,40,30,20,10],
                    name: 'Tasks remaining',
                    yAxis:0,
                    color: 'blue'
                }, {
                    data: doc.leftHourList, //[120,400,600,500,400,300,200,100],
                    yAxis:1,
                    name: 'Hours remaining',
                    color: 'red',
                    dataLabels: {
                        enabled: true
                    }
                }, {
                    data: doc.referHourList, //[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    yAxis:1,
                    name: ' ',
                    color: 'transparent',
                    dataLabels: {
                        enabled: false
                    }
                }]

            });
        }
    };

    /* hui.Burndown 继承了 hui.Control */
    hui.inherits(hui.Burndown, hui.Control);


});
    
