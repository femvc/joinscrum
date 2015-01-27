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
 * @name 控制器负责控制action跳转[包括多个action共存的情况]
 * @public
 * @author wanghaiyang
 * @date 2013/08/08
 * @comment
 *  对外接口: bui.Master.forward(url) 根据loc跳转到对应的action
 *  默认调用外部接口: action.enterAction() 进入指定action
 */
define('./bui.Master', ['./bui'], function(){

bui.Master = {
    historyList:[],
    newRequest: null,
    ready: true,
    
    checkNewRequest: function () {
        var me = this,
            url = me.newRequest;
        
        me.ready = true;
        
        if (url){
            me.newRequest = null;
            me.forward(url);
        }
    },
    
    //仅供redirect时调用,必须保证url对应的action是有效的,跳转过程中不操作url,不推荐外部直接调用!!!
    forward: function( url ) {
        var me = this;
        // 注：由于forward的过程中不改变url，因此将可能改变url的bui.Permission.checkRouter放到bui.Locator.switchToLocation中了
        // 这里不可以通过me.getExtClass()去取!!
        // if (bui.Permission && bui.Permission.checkRouter) {
        //     bui.Permission.checkRouter(url, bui.fn(me.forwardCallback, me));
        // }
        // else {
            me.forwardCallback(url);
        //}
    },
    // 权限验证可能是一个异步过程!!
    forwardCallback: function(url){    
        var me = this,
            result, loc, args,
            action = null,
            preAction = null;
        
        //Action渲染过程中禁止跳转，否则容易造成死循环，缓存新请求。
        if (me.ready == false) { me.newRequest = url; }
        if (me.ready == true ) {
            result = me.parseLocator(url);
            loc  = result['location'];
            args = result['query'];
            
            // 首先销毁当前action的实例
            if(me.historyList[me.historyList.length-1]){
                me.disposeAction(me.parseLocator(me.historyList[me.historyList.length-1])['location']);
            }
            
            // 找到匹配的路径规则(该过程中会创建action实例)
            
            action = me.getActionInstance( me.findActionName(loc) ); /* me.getActionInstance参数可以接收'变量名'|'单例'|'Action子类' */
            
            if (action && action.enterAction) {
                //Action渲染过程中禁止跳转，否则容易造成死循环。
                me.ready = false;
                //时间不长则无需显示等待中
                //bui.Mask.timer = bui.window.setTimeout('bui.Mask.showLoading()',300);
                //me.getExtClass('bui.Mask').showLoading();
                
                me.historyList.push(url);
                action.enterAction(args);
            }
        }
    },
    back: function(){
        var me = this,
            result, loc,
            action = null;
        
        //有历史记录
        if ( me.historyList.length > 1 ){
            //当前action
            result = me.parseLocator(me.historyList.pop());
            loc  = result['location'];
            
            me.disposeAction(loc);
            
            me.ready = true;
            //后退一步
            me.getExtClass('bui.Locator').redirect(me.historyList.pop());
        }
        //无历史记录
        else {
            //当前action
            result = me.parseLocator(me.historyList[me.historyList.length-1]);
            loc  = result['location'];
            
            //跳转到指定后退location
            loc = me.disposeAction(loc);
            if (loc) {
                me.getExtClass('bui.Locator').redirect(loc);
            }
        }
    },
    /**
     * @name 根据loc找到action
     * @private
     * @param {String} loc
     * @result {String} actionName
     */
    findActionName: function(loc) {
        var me = this,
            action = me.getExtClass('bui.Router').findAction(loc);
        if ( !action ) { 
            // 找不到对应Action
            if (bui.window.console && bui.window.console.error) {
                bui.window.console.error('Path "'+loc+'" not exist.');
            }
            // 找不到则返回404
            if (loc !== '/404') {
                action = me.findActionName( '/404' );
            }
        }
        return action; 
    },
   /**
     * @name 根据loc找到action
     * @private
     * @param {String} loc
     */
    disposeAction: function(loc) {
        var me = this,
            action = me.getExtClass('bui.Action').getByActionName(me.findActionName( loc )),/* getByActionName参数可以接收'变量名'|'单例'|'Action子类' */
            defaultBack = (action && action.BACK_LOCATION) ? action.BACK_LOCATION : null;
        
        if(action && action.dispose) {
            action.dispose();
        }
        
        return defaultBack;
    },
    /**
     * @name 返回对应action的实例
     * @private
     * @param {Function||Object} action
     */
    getActionInstance: function(action) {
        if ( typeof action == 'string' ) {        
            action = bui.getObjectByName(action);
        }
        
        if (action instanceof Function) {
            action = this.getExtClass('bui.Action').getByActionName(action) || new action();
        }
        
        return action;
    },
    /**
     * @name 解析获取到的location字符串
     * @private
     * @param {Object} loc
     */
    parseLocator: function(url) {
        url = url == null ? '' : String(url);
        var pair,
            query= {},
            loc = '', 
            args = '',
            list, 
            v,
            str;
        
        // Parse ?aa=xxx
        pair = url.split('#')[0].match(/^([^\?]*)(\?(.*))?$/);
        if (pair) {
            loc = pair[1];
            args = (pair.length == 4 ? pair[3] : '')||'';
        }
        list = args ? args.split('&') : [];
        for(var i=0,len=list.length; i<len; i++){
            v = list[i].split('=');
            v.push('');
            query[v[0]] = v[1];            
        }
        
        // Parse #~bb=xxx
        str = url.split('#');
        pair = (str.length > 1 ? str[1] : str[0]).match(/^([^~]*)(~(.*))?$/);
        if (pair) {
            loc = pair[1];
            args = (pair.length == 4 ? pair[3] : '')||'';
        }
        list = args ? args.split('&') : [];
        for(var i=0,len=list.length; i<len; i++){
            v = list[i].split('=');
            v.push('');
            query[v[0]] = v[1];            
        }

        return {'location':loc, 'query':query};
    },
    /**
     * @name 初始化控制器,包括路由器和定位器locator
     * @protected
     * @param {String} rule 路径
     * @param {String} func 对应action
     */
    init: function () {
        var me = this;
    },
    getExtClass: function(clazz){
        var result = function(){};
        switch (clazz) {
            //me.getExtClass('bui.Mask')
            case 'bui.Mask':
                if (typeof bui !== 'undefined' && bui && bui.Mask) {
                    result = bui.Mask;
                }
                else {
                    result.showLoading = new Function();
                    result.hideLoading = new Function();
                }
            break;
            //me.getExtClass('bui.Locator')
            case 'bui.Locator':
                if (typeof bui !== 'undefined' && bui && bui.Locator) {
                    result = bui.Locator;
                }
                else {
                    result.redirect = new Function();
                }
            break;
            //me.getExtClass('bui.Action')
            case 'bui.Action':
                if (typeof bui !== 'undefined' && bui && bui.Action) {
                    result = bui.Action;
                }
                else {
                    result.getByActionName = new Function();
                }
            break;
            //me.getExtClass('bui.Router')
            case 'bui.Router':
                if (typeof bui !== 'undefined' && bui && bui.Router) {
                    result = bui.Router;
                }
                else {
                    result.findAction = new Function();
                }
            break;
            default: 
        }
        return result;
    }
};

});
