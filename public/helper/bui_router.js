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
 * @name 路由规则管理类
 * @public
 * @description 将URL映射具体对象
 * @author wanghaiyang
 * @date 2013/08/08
 */
define('./bui.Router', ['./bui'], function(){

bui.Router = {
    pathRules: [],
    /**
     * 根据location找到匹配的rule并返回对应的action
     *
     * @public
     * @param {String} loc 路径
     */
    findAction: function( loc ) {
        var me = this,
            pathRules = me.pathRules,
            i, len, matches, rule, props,
            action = null;
        //匹配所有符合表达式的路径
        for ( i=0,len=pathRules.length;i<len;i++ ) {
            rule = pathRules[ i ].location;
            if (rule && (rule instanceof RegExp) && ( matches = rule.exec( loc ) ) !== null ) {
                action = pathRules[ i ].action;
            }
        }
        //[优先]匹配单独具体路径
        for ( i=0,len=pathRules.length;i<len;i++ ) {
            rule = pathRules[ i ].location;
            if (rule && (typeof rule == 'string') && rule == loc ) {
                action = pathRules[ i ].action;
            }
        }
        
        return action;
    },
    /**
     * 设置rule
     *
     * @public
     * @param {String} rule 路径
     * @param {String} action 对应action
     */
    setRule: function ( rule, action ) {
        this.pathRules.push( {
            'location'  : rule,
            'action' : action
        } );
    },
    /**
     * 载入完成读取所有rule
     *
     * @protected
     * @param {String} rule 路径
     * @param {String} func 对应action
     */
    init: function ( modules ) {
        // Todo:
    },
  
    //错误处理
    error:function(msg){
        msg = 'error: ' + msg;
        if(bui.window.console) {
            bui.window.console.log(msg);
        }
        else throw Error(msg);
    }
};


});

