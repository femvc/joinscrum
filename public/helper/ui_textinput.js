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
 * @name 文本输入框控件
 * @public
 * @author wanghaiyang
 * @date 2013/08/08
 * @param {Object} options 控件初始化参数.
 */
define('./bui.TextInput', ['./bui', './bui.Control'], function(){

bui.TextInput = function (options, pending) {
    bui.TextInput.superClass.call(this, options, 'pending');
    
    this.form = 1;
    this.value = this.value === 0 ? 0 : (this.value || '');
    
    //进入控件处理主流程!
    if (pending != 'pending') {
        this.enterControl();
    }
};

bui.TextInput.prototype = {
    /**
     * @name 获取文本输入框的值
     * @public
     * @return {String}
     */
    getValue: function() {
            return this.getMain().value;
    },

    /**
     * @name 设置文本输入框的值
     * @public
     * @param {String} value
     */
    setValue: function(value) {
        this.getMain().value = value === undefined ? '' : value;
        if (value) {
            this.getFocusHandler()();
        } else {
            this.getBlurHandler()();
        }
    },

    /**
     * @name 设置输入控件的title提示
     * @public
     * @param {String} title
     */
    setTitle: function(title) {
        this.getMain().setAttribute('title', title);
    },

    /**
     * @name 将文本框设置为不可写
     * @public
     */
    disable: function(disabled) {
        if (typeof disabled === 'undefined') {
            disabled = true;
        }
        if (disabled) {
            this.getMain().disabled = 'disabled';
            this.setState('disabled');
        } else {
            this.getMain().removeAttribute('disabled');
            this.removeState('disabled');
        }
    },

    /**
     * @name 设置控件为只读
     * @public
     * @param {Object} readonly
     */
    setReadonly: function(readonly) {
        readonly = !!readonly;
        this.getMain().readOnly = readonly;
        /*this.getMain().setAttribute('readonly', readonly);*/
        this.readonly = readonly;
    },

    /**
     * @name 渲染控件
     * @protected
     * @param {Object} main 控件挂载的DOM.
     */
    render: function() {
        var me = this,
            main = me.getMain(),
            tagName = main.tagName,
            inputType = main.getAttribute('type');
        
        // 判断是否input或textarea输入框
        if (tagName == 'TEXTAREA'|| (tagName == 'INPUT' && (inputType == 'text' || inputType == 'password'))) {
            me.type = tagName == 'INPUT' ? 'text' : 'textarea'; // 初始化type用于样式
            
            // 绘制控件行为
            bui.TextInput.superClass.prototype.render.call(me);
            
            // 设置readonly状态
            me.setReadonly(!!me.readonly);
            
            // 绑定事件
            main.onkeypress = me.getPressHandler();
            main.onfocus = me.getFocusHandler();
            main.onblur = me.getBlurHandler();
        }
                
        if (me.main && me.value != '') {
            me.getMain().value = me.value;
        }
    },

    /**
     * @name 获取获焦事件处理函数
     * @private
     * @return {Function}
     */
    getFocusHandler: function() {
        var me = this;

        return function() {
            var main = me.main;

            me.onfocus();
        };
    },

    /**
     * @name 获取失焦事件处理函数
     * @private
     * @return {Function}
     */
    getBlurHandler: function() {
        var me = this;

        return function() {
            var main = me.main,
                value = me.getValue();

            me.onblur();
        };
    },

    /**
     * @name 获取键盘敲击的事件handler
     * @private
     * @return {Function}
     */
    getPressHandler: function() {
        var me = this;
        return function(e) {
            e = e || bui.window.event;
            var keyCode = e.keyCode || e.which;
            if (keyCode == 13) {
                return me.onenter();
            }
        };
    },

    onenter: new Function(),

    onfocus: new Function(),

    onblur: new Function(),

    /** 
     * @name 获焦并选中文本
     * @public
     */
    focusAndSelect: function() {
        this.getMain().select();
    },

    /**
     * @name 释放控件
     * @public
     */
    dispose: function() {
        // 卸载main的事件
        var main = this.getMain();
        main.onkeypress = null;
        main.onchange = null;
        main.onpropertychange = null;
        main.onfocus = null;
        main.onblur = null;

        bui.Control.prototype.dispose.call(this);
    }
};
/*通过bui.Control派生bui.Button*/
//bui.Control.derive(bui.TextInput);
/* bui.TextInput 继承了 bui.Control */
bui.inherits(bui.TextInput, bui.Control);

});