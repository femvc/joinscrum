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
hui.define('hui_memberload', ['hui_util', 'hui_control', 'highcharts', 'jquery'], function () {

    hui.Memberload = function (options, pending) {
        hui.Memberload.superClass.call(this, options, 'pending');
        this.type = 'memberload';

        //进入控件处理主流程!
        if (pending != 'pending') {
            this.enterControl();
        }
    };

    hui.Memberload.prototype = {
        /**
         * @name 渲染控件
         * @public
         */
        render: function () {
            hui.Memberload.superClass.prototype.render.call(this);
            var me   = this,
                main = me.getMain(),
                innerDiv;
            
                $(main).highcharts({
                    chart: {
                        type: 'column'
                    },
                    title: {
                        text: ''
                    },
                    xAxis: {
                        categories: me.member || []//['袁头', '姚乾', '李江', '丁必贵', '时伟', '建涛', '姚乾', '李江', '丁必贵', '时伟', '建涛', '姚乾', '李江', '丁必贵', '时伟', '建涛']
                    },
                    yAxis: {
                        min: 0,
                        title: {
                            text: 'Team Member Load (Hours)'
                        },
                        stackLabels: {
                            enabled: true,
                            style: {
                                fontWeight: 'bold',
                                color: 'gray'
                            }
                        }
                    },
                    legend: {
                        align: 'right',
                        x: 0,
                        verticalAlign: 'top',
                        y: 0,
                        floating: true,
                        backgroundColor: 'white',
                        borderColor: '#0CC',
                        borderWidth: 1,
                        shadow: false
                    },
                    tooltip: {
                        formatter: function () {
                            return '<b>' + this.x + '</b><br/>' +
                                this.series.name + ': ' + this.y + '<br/>' +
                                'Total: ' + this.point.stackTotal;
                        }
                    },
                    plotOptions: {
                        column: {
                            stacking: 'normal',
                            dataLabels: {
                                enabled: true,
                                color: 'white',
                                style: {
                                    textShadow: '0 0 3px black'
                                },
                                formatter: function () {
                                    return '<b>' + (this.y === 0 ? '' : this.y) + '</b>';
                                }
                            }
                        },
                        series: {
                            pointWidth: 30
                        }
                    },
                    series: me.hours || [] /*[{
                        name: 'wechat',
                        data: [5, 3, 4, 7, 2, 2, 3, 4, 7, 2, 2, 3, 4, 7, 2, 2, 3, 4, 7, 2, 2]
                    }, {
                        name: 'search',
                        data: [2, 2, 3, 2, 1]
                    }, {
                        name: 'tuan',
                        data: [3, 4, 4, 2, 5]
                    }]*/
                });
        }
    };

    /* hui.Memberload 继承了 hui.Control */
    hui.inherits(hui.Memberload, hui.Control);


});
    
