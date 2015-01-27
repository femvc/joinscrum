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
 * @name 按钮控件
 * @public
 * @author wanghaiyang
 * @date 2013/08/08
 * @param {Object} options 控件初始化参数.
 */
define('./bui.Button', ['./bui', './bui.Control'], function(){


bui.Button = function (options, pending) {
    bui.Button.superClass.call(this, options, 'pending');
    // 标识鼠标事件触发自动状态转换
    this.autoState = 1;    
    
    // 类型声明，用于生成控件子dom的id和class
    this.type = 'btn';
    
    //进入控件处理主流程!
    if (pending != 'pending') {
        this.enterControl();
    }
};

bui.Button.prototype = {
    getClass: function(k){
        return 'btn' + (k ? '-' + k : '');
    },
    /**
     * @name button的html模板
     * @private
     */
    tplButton: '<span id="#{2}" class="#{1}">#{0}</span>',
    
    /**
     * @name 默认的onclick事件执行函数, 不做任何事，容错
     * @public
     */
    onclick: new Function(),
    
    /**
     * @name 获取button主区域的html
     * @private
     * @return {String}
     */
    getMainHtml: function() {
        var me = this;
        
        return bui.Control.format(
            me.tplButton,
            me.content || '&nbsp;',
            me.getClass( 'label' ),
            me.getId( 'label' )
        );
    },

    /**
     * @name 设置是否为Active状态
     * @public
     * @param {Boolean} active active状态
     */
    setActive: function ( active ) {
        var state = 'active';

        if ( active ) {
            this.setState( state );
        } 
        else {
            this.removeState( state );
        }
    },
    
    /**
     * @name 渲染控件
     * @public
     */
    render: function () {
        bui.Button.superClass.prototype.render.call(this);
        var me   = this,
            main = me.getMain(),
            innerDiv;
        
        innerDiv = main.firstChild;
        if (!me.content && innerDiv && innerDiv.tagName != 'DIV') {
            me.content = me.getInnerHTML();
        }
        
        me.setInnerHTML(me.getMainHtml());

        // 初始化状态事件
        main.onclick = me.getHandlerClick();

        // 设定宽度
        me.width && (main.style.width = me.width + 'px');
        
        // 设置disabled
        me.setDisabled( !!me.disabled );
    },
    
    /**
     * @name 获取按钮点击的事件处理程序
     * @private
     * @return {function}
     */
    getHandlerClick: function() {
        var me = this;
        return function ( e ) {
            if ( !me.isDisabled() ) {
                me.onclick();
            }
        };
    },
    
    /**
     * @name 设置按钮的显示文字
     * @public
     * @param {String} content 按钮的显示文字
     */
    setContent: function ( content ) {
        this.setInnerHTML(content, bui.g(this.getId( 'label' )));
    },
    /**
     * @name 设置按钮的显示文字
     * @public
     * @param {String} content 按钮的显示文字
     */
    showWaiting: function(){
        
    }
};

/*通过bui.Control派生bui.Button*/
//bui.Control.derive(bui.Button);
/* bui.Button 继承了 bui.Control */
bui.inherits(bui.Button, bui.Control);


});
