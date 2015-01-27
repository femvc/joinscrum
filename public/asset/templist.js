'use strict';

define('./bui.Template.TEMPLATE_LIST', ['./bui.Template'], function(){

bui.Template.TEMPLATE_LIST = [''
    ,'tpl_taskboard_layout.htm'
    ,'tpl_taskboard_highlight.htm'
    ,'tpl_taskboard_addtask.htm'
    ,'tpl_taskboard_impediment.htm'
    ,'tpl_login.htm'
    ,''
    ,''
    ,''
    
];
/**
 * 用于同步所有异步请求
 */
bui.Template.loadedCount = 0;

});

