'use strict';
//    ____     ____                _   _     ____          ____      ____                   
//  /\  __\  /\  __\    /'\_/`\  /\ \/\ \  /\  __`\      /\  __`\  /\  __`\    /'\_/`\      
//  \ \ \_/_ \ \ \_/_  /\      \ \ \ \ \ \ \ \ \ \_\     \ \ \ \_\ \ \ \ \ \  /\      \     
//   \ \  __\ \ \  __\ \ \ \_/\_\ \ \ \ \ \ \ \ \  __     \ \ \  __ \ \ \ \ \ \ \ \_/\_\    
//    \ \ \_/  \ \ \_/_ \ \ \\ \ \ \ \ \_/ \ \ \ \_\ \  __ \ \ \_\ \ \ \ \_\ \ \ \ \\ \ \   
//     \ \_\    \ \____/ \ \_\\ \_\ \ `\___/  \ \____/ /\_\ \ \____/  \ \_____\ \ \_\\ \_\  
//      \/_/     \/___/   \/_/ \/_/  `\/__/    \/___/  \/_/  \/___/    \/_____/  \/_/ \/_/  
//                                                                                          
//                                                                                          

/**
 * @name 权限管理类
 * @public
 * @author wanghaiyang
 * @date 2013/08/08
 */
define('./bui.Permission', ['./bui'], function(){

bui.Permission = {
    priorityList: {
        
    },
    /**
     * @name 检查用户跳转的目标URL是否有权限, 没有权限强制跳转到指定地址
     * @public 
     */
    checkRouter: function(url, callback){
        if (url != '/404' && url != '/login') {
            // 1. 首先获取用户状态
            Requester.get('/scrum_api/user_loginstatus?' + Math.random(), {
                onsuccess: function (err, data) {
                    bui.context.set('loginStatus', data.result);
                    // 继续跳转流程
                    bui.Permission.checkRouterCallback(url, callback);
                }
            });
        }
        else {
            callback&&callback(url);
        }
    },
    checkRouterCallback: function (url, callback) {
        // 有权限则直接放行!! Todo: 这里需要实现白名单机制
        if (bui.context.get('loginStatus') == 'login') {
            callback&&callback(url);
        }
        else {
            // 注：未登录则url直接跳转到/login
            bui.Locator.redirect('/login');
        }
    },
    /**
     * @name 检查被请求的URL用户是否有权限
     * @public 
     */
    checkRequest: function(url, opt_options){
        // Todo
        return [null, url]; // First param's default value is 'null', means 'permit'
    },
    /**
     * @name 更新用户权限状态
     * @public
     */
    updateStatus: function(url, callback) {
        // Todo
    }
};

});