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
 * @name 事件派发基类
 * @public
 * @author wanghaiyang
 * @date 2013/08/08
 */
define('./bui.EventDispatcher', ['./bui'], function(){

bui.EventDispatcher = function() {
    this._listeners = {};
};
bui.EventDispatcher.prototype = {
    /**
     * 添加监听器
     *
     * @public
     * @param {String} eventType 事件类型.
     * @param {Function} listener 监听器.
     */
    on: function(eventType, listener) {
        if (!this._listeners[eventType]) {
            this._listeners[eventType] = [];
        }
        var list = this._listeners[eventType],
            i,
            len,
            exist = false;
        
        for (i=0,len=list.length; i<len; i++) {
            if (list[i] === listener) {
                exist = true;
                break;
            }
        }
        if (!exist) {
            this._listeners[eventType].push(listener);
        }
    },

    /**
     * 移除监听器
     *
     * @public
     * @param {String} eventType 事件类型.
     * @param {Function} listener 监听器.
     */
    off: function(eventType, listener) {
        if (!this._listeners[eventType]) {
            return;
        }
        var list = this._listeners[eventType],
            i,
            len;
        
        for (i=0,len=list.length; i<len; i++) {
            if (list[i] === listener) {
                this._listeners[eventType].splice(i, 1);
                break;
            }
        }
        if (listener === undefined) {
            this._listeners[eventType] = [];
        }
    },
    /**
     * 清除所有监听器
     *
     * @public
     */
    clear: function() {
        this._listeners = [];
    },
    /**
     * 触发事件
     *
     * @public
     * @param {String} eventType 事件类型.
     */
    trigger: function(eventType) {
        if (!this._listeners[eventType]) {
            return;
        }
        var i, args = [];
        for (i = 1; i < arguments.length; i++) {
            args.push(arguments[i]);
        }
        for (var i = 0; i < this._listeners[eventType].length; i++) {
            this._listeners[eventType][i].apply(this, args);
        }
    }
};

});