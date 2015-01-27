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
 * @name 浏览器地址栏变化监听器
 * @public
 * @description Locator主要功能是监听Location的变化, 在URL发生变化的时候保存历史记录并通知Controller. 在浏览器中，更改url“#”号后面的hash内容时，页面不会发生跳转重新请求。利用这个特点，可以在hash中记录历史和实现url敏感。
 * @author wanghaiyang
 * @date 2013/08/08
 */
define('./bui.Locator', ['./bui'], function(){

bui.Locator = {
    /**
     * @name 默认首次进入的路径.
     * @default '/'
     * @public
     */
    DEFAULT_INDEX:'/',
    /**
     * @name 当前路径.
     * @public
     */
    currentLocation:null,
    /**
     * @name 使用iframe兼容早期IE版本无法通过onhashchange保存浏览历史的问题.
     * @private
     */
    CONTROL_IFRAME_ID : 'ERHistroyRecordIframe' + String(Math.random()).replace('.',''),
    IFRAME_CONTENT  : '<html><head></head><body><input type="text" id="save">'
            + '<script type="text/javascript">'
            + 'var loc = "#{0}";'
            + 'document.getElementById("save").value = loc;'
            + 'parent.bui.Locator.updateLocation(loc);'
            + 'parent.bui.Locator.switchToLocation(loc);'
            + '<'
            + '/script ></body></html>',
    /**
     * @name 获取location信息
     * @private
     * @return {String}
     */
    getLocation: function () {
        var hash;

        // firefox下location.hash会自动decode
        // 体现在：
        //   * 视觉上相当于decodeURI，
        //   * 但是读取location.hash的值相当于decodeURIComponent
        // 所以需要从location.href里取出hash值
        if ( /firefox\/(\d+\.\d+)/i.test(navigator.userAgent) ? + RegExp['\x241'] : undefined ) {
            hash = location.href.match(/#(.*)$/);
            hash && (hash = hash[ 1 ]);
        } 
        else {
            hash = location.hash;
        }

        if ( hash ) {
            return hash.replace( /^#/, '' );
        }
        
        return '';
    },
    /**
     * @name 更新hash信息
     * @private
     * @param {String} loc
     */
    updateLocation: function( loc ) {
        var me = this,
            isChange = (me.currentLocation != loc);
        
        // 存储当前信息
        // opera下，相同的hash重复写入会在历史堆栈中重复记录
        // 所以需要getLocation来判断
        if ( me.currentLocation != loc && me.getLocation() != loc ) {
            location.hash = loc;
        }
        
        me.currentLocation = loc;
        return isChange;
    },
    /**
     * @name 控制定位器转向
     * @public
     * @param {String} loc location位置
     * @param {Object} opt_option 转向参数
     */
    redirect: function( loc, opt_option ) {
        var me = bui.Locator,
            opt = opt_option || {},
            hisList,
            histotry = document.getElementById('histotry');        
        
        if(!bui.Locator.hisList) {
            bui.Locator.hisList = [];
        }
        hisList = bui.Locator.hisList;
        hisList.push(loc);
        
        if (histotry){
            histotry.innerHTML = hisList.join('<br/>');
        }
        
        // 非string不做处理
        if ( typeof loc != 'string' ) {
            return;
        }
        
        // 增加location带起始#号的容错性
        // 可能有人直接读取location.hash，经过string处理后直接传入
        loc = loc.replace( /^#/, '' );
        
        // 空string当成DEFAULT_INDEX处理
        if ( loc.length == 0 ) {
            loc = me.DEFAULT_INDEX; 
        }
        
        // 与当前location相同时不进行route
        var isLocChanged = me.updateLocation( loc );
        if ( isLocChanged || opt.enforce ) {
            loc = me.currentLocation;

            // 触发onredirect事件
            me.onredirect(loc);
            
            // 当location未变化，强制刷新时，直接route
            if ( isLocChanged == false ) {
                bui.Locator.switchToLocation( loc );
            } 
            else {
                // location被改变了,非强制跳转
                me.doRoute( loc );
            }
        }
    },
    /**
     * @name 权限判断以及重定向
     * @private
     * @param {String} loc location位置
     */
    doRoute: function( loc ) {
        var me = this;
        // 权限判断以及转向
        var loc302 = me.authorize( loc );
        if ( loc302 ) {
            me.redirect( loc302 );
            return;
        }

        // ie下使用中间iframe作为中转控制
        // 其他浏览器直接调用控制器方法
        var ie = /msie (\d+\.\d+)/i.test(navigator.userAgent) ? (document.documentMode || + RegExp['\x241']) : undefined;
        if ( ie && ie < 8 ) {
            me.ieRoute( loc );
        } 
        else {
            me.switchToLocation( loc );
        }
    },
    /**
     * @name Location变化调用接口
     * @public
     */
    switchToLocation: function(url){
        var me = this,
            action,
            loc = url;
        // Check url whether illegal.
        if (bui.Router && bui.Router.findAction) {
            // bui.Master.parseLocator(url)
            if (bui.Master && bui.Master.parseLocator) {
                loc = bui.Master.parseLocator(url);
                loc = loc ? loc.location : url;
            }
            action = bui.Router.findAction(loc);
            url = action ? url : '/404';
        }
        // checkRouter的过程中可能会改变url
        if (bui.Permission && bui.Permission.checkRouter) {
            bui.Permission.checkRouter(url, bui.fn(me.callMasterForward, me));
        }
        else {
            me.callMasterForward(url);
        }
    },
    /**
     * @name 调用Master的forward接口
     * @private
     */ 
    callMasterForward: function (url) {
        if (typeof bui != 'undefined' && bui.Master && bui.Master.forward) {
            bui.Master.forward( url );
        }
    },
    /**
     * @name onredirect事件外部接口
     * @interface
     * @public
     */
    'onredirect': new Function(),
    /**
     * @name 强制刷新当前地址
     * @method
     * @public
     */
    'reload': function() {
        var me = this;
        if ( me.currentLocation ) {
            me.redirect( me.currentLocation, { enforce : true } );
        }
    },
    /**
     * @name IE下调用router
     * @method
     * @private
     * @param {String} loc 地址, iframe内容字符串的转义
     */
    ieRoute: function( loc ) {
        var me = this;
        var iframe = bui.bocument.getElementById(me.CONTROL_IFRAME_ID),
            iframeDoc = iframe.contentWindow.document;

        iframeDoc.open( 'text/html' );
        iframeDoc.write(
            me.IFRAME_CONTENT.replace('#{0}',
            String(loc).replace( /\\/g, "\\\\" ).replace( /\"/g, "\\\"" )));
        iframeDoc.close();
        
    },
    /**
     * @name 初始化locator
     * @public
     */
    init: function() {
        var me = this,
            ie = /msie (\d+\.\d+)/i.test(navigator.userAgent) ? (document.documentMode || + RegExp['\x241']) : undefined;
        if( ie && ie < 8 ){
            me.ieCreateIframeRecorder();
            bui.window.setInterval( function(){me.changeListener();}, 100 );
        } else if ( 'onhashchange' in bui.window ) {
            bui.window.onhashchange = function(args){me.changeListener(args);};
            me.changeListener();
        } else {
            bui.window.setInterval( function(){me.changeListener();}, 100 );
        }
    },
    /**
     * @name hash变化的事件监听器
     * @method
     * @private
     */
    changeListener: function() {
        var me = this,
            loc = me.getLocation();

        if ( !loc && !me.currentLocation ) {
            me.redirect( me.DEFAULT_INDEX );
        } else if ( loc && me.updateLocation( loc ) ) {
            me.doRoute( loc );
        }
    },    
    /**
     * @name ie下创建记录与控制跳转的iframe
     * @method
     * @private
     */
    ieCreateIframeRecorder: function() {
        var me = this;
        var iframe = document.createElement('iframe'),
            size   = 200,
            pos    = '-1000px';

        iframe.id       = me.CONTROL_IFRAME_ID;
        iframe.width    = size;
        iframe.height   = size;
        iframe.src      = "about:blank";

        iframe.style.position   = "absolute";
        iframe.style.top        = pos;
        iframe.style.left       = pos;

        document.documentElement.appendChild(iframe);
    },
    /**
     * @name 路径权限规则列表
     * @property
     * @type {Array}
     * @default []
     * @public
     */
    authorizers : [],
    /**
     * @name 增加权限验证器
     * @method
     * @public
     * @param {Function} authorizer 验证器，验证失败时验证器返回转向地址
     */
    addAuthorizer: function( authorizer ) {
        var me = this;
        if ( 'function' == typeof authorizer ) {
            me.authorizers.push( authorizer );
        }
    },
    /**
     * @name 权限验证
     * @method
     * @private
     * @return {String} 验证失败时验证器返回转向地址
     */
    authorize: function( currLoc ) {
        var me = this,
            loc, 
            i, 
            len = me.authorizers.length;

        for (i = 0; i < len; i++ ) {
            loc = me.authorizers[ i ]( currLoc );
            if ( loc ) {
                return loc;
            }
        }
    }
};

// 定义快捷方式
bui.redirect = bui.Locator.redirect;

});

