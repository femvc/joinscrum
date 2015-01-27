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
 * @name 异步队列
 * @public
 * @author wanghaiyang
 * @date 2013/08/08
 */
define('./bui.asyque', ['./bui'], function(){

bui.asyque = function(){
    this.que = []; // 注：存放要调用的函数列表
    this.id = Math.random(); // 注：仅用于标示，不会被调用（即使删掉也没什么影响）
};

/**  
 * @name 添加需要异步执行的函数
 * @param {Function} fn 需要异步执行的函数
 * @return {this} 返回主体以便于后续操作
 */
bui.asyque.prototype.push = function(fn, target){
    var me = this,
        _fn = target ? bui.fn(fn, target) : fn,
        callback = bui.fn(me.next, me);
    
    fn = function(){
        _fn(callback);
    };
    me.que.push(fn);
    
    return me;
};

/**  
 * @name 开始执行异步队列
 * @param {Function} callback 嵌套时的回调函数，其实就是bui.asyque.prototype.next
 * @return {void} 
 */
bui.asyque.prototype.next = function(callback){
    if (callback) {
        callback();
    }
    
    if (this.que.length>0) {
        var fn = this.que.shift();
        fn();
    }
};

/**  
 * @name Javascript简单异步框架 
 * @property {Array} que 保存回调队列  
 * @method {Function} push 添加需要异步执行的函数
 * @method {Function} next 开始执行异步队列
 * @comment 异步队列中的函数需要实现callback的接口
 * @example
     function doit() {
        alert('a');
        
        var que1 = new bui.asyque();
        que1.push(a);
        que1.push(d); 
        bui.window.setTimeout(function(){
            que1.next();
        },400);
    }

     function a(callback) {
        alert('a');
        
        var que2 = new bui.asyque();
        que2.push(b).push(c).push(callback); 
        
        bui.window.setTimeout(function(){
            que2.next();
        },400);
    }
    function b(callback) {
        alert('b');
        callback&&callback();
    }
    function c(callback) {
        alert('c');
        callback&&callback();
    }
 */ 

});