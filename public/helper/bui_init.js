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
 * @name 预处理流程
 * @public
 * @author wanghaiyang
 * @date 2013/08/08
 */
define('./bui.init', ['./bui', './bui.Template', './bui.Router', './bui.Locator' ], function(){

bui.init = function(){
    var que = new bui.asyque();
    
    /**
     * @name before事件外部接口
     * @public
     */
    if (bui.beforeinit) {
        que.push(bui.beforeinit);
    }
    /**
     * @name 载入预定义模板文件
     * @private
     */
    if (bui.Template && bui.Template.loadAllTemplate && bui.Template.TEMPLATE_LIST) {
        que.push(function(callback){
            bui.Template.loadAllTemplate();
            bui.Template.onload = callback;
        });
    }
    
    que.push(bui.Template.finishLoad);
    /**
     * @name afterinit事件外部接口，在bui.Template.finishLoad之后执行
     * @public
     */
    if (bui.afterinit) {
        que.push(bui.afterinit);
    }
    
    que.next();
}

bui.afterinit = function(callback){
    // Todo
    callback();
};

/**
 * @name 模板载入完毕之后,初始化路由列表,启动location侦听
 * @private
 */
bui.Template.finishLoad = function(callback){
    callback&&callback();

    // 1.防止onload再次执行
    if (bui.Template) {
        bui.Template.loadedCount = -100000;
        delete bui.Template.loadedCount;
    }
    
    // 2.初始化路由列表
    if ( bui.Router && bui.Router.init){
        bui.Router.init();
    }
    // 3.启动location侦听
    if ( bui.Locator && bui.Locator.init){
        // 默认首次进入的路径
        bui.Locator.init();
    }
};

});
