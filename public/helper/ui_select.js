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
define('./bui.Select', ['./bui', './bui.Control'], function(){

bui.Select = function (options, pending) {
    bui.Select.superClass.call(this, options, 'pending');
    
    this.type = 'Select';
    this.data_value = this.data_value || 'value';
    this.data_text = this.data_text || 'text';
    
    //进入控件处理主流程!
    if (pending != 'pending') {
        this.enterControl();
    }
};

bui.Select.prototype = {
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
     * @name 渲染控件
     * @protected
     * @param {Object} main 控件挂载的DOM.
     */
    initModel: function() {
        var me = this;
        if (me.options && typeof me.options == 'string') {
            me.options = (new Fuction('return ' + me.options))();
        }
    },
    /**
     * @name 渲染控件
     * @protected
     * @param {Object} main 控件挂载的DOM.
     */
    render: function() {
        bui.Select.superClass.prototype.render.call(this);
        var me = this;
        // 绘制宽度和高度
        me.setSize();
        if (me.options) {
            me.renderOptions();
        }
        
        if (me.value !== undefined) {
            me.setValue(me.value);
        }
        var oldEvent = new Function();
        if (me.getMain().onchange) {
            oldEvent = me.getMain().onchange;
        }
        me.getMain().onchange = function(){
            oldEvent();
            me.value = me.getMain().value;
            me.onchange();
        };
    },
    addOption: function(item){
        if (item === undefined) {return;}
        var me = this,
            dataValue = me['data_value'],
            dataLabel = me['data_text'];

        var elem = bui.dom.createElement('OPTION');
        elem.value = typeof item == "string" ? item : item[dataValue];
        elem.text  = typeof item == "string" ? item : item[dataLabel];
        
        me.getMain().appendChild(elem);
    },
    renderOptions: function () {
        var me = this;
        for (var i=0,len=me.options.length; i<len; i++) {
            me.addOption(me.options[i]);
        }
    },
    setOptions: function (options) {
        var me = this,
            main = me.getMain();
        for (var i = main.childNodes.length-1; i>-1; i--) {
            main.removeChild(main.childNodes[i]);
        }
        
        me.options = options;
        me.renderOptions();
    },
    setValue: function (v) {
        var me = this,
            dataValue = me['data_value'],
            dataLabel = me['data_text'];

        me.value = v && (typeof v) != 'string' ? v[dataValue] : v;
        me.getMain().value = me.value;
    },
    getValue: function () {
        var me = this,
            item,
            dataValue = me['data_value'],
            selected = me.getMain().value;
        if (me.options) {
            for (var i=0,len=me.options.length; i<len; i++) {
                item = me.options[i];
                if ((typeof item == 'string' && item === selected) || item[dataValue] === selected ) {
                    selected = item[dataValue];
                    break;
                }
            }
        }
        return selected;
    },
    onchange: function(){}
};
/*通过bui.Control派生bui.Button*/
//bui.Control.derive(bui.TextInput);
/* bui.TextInput 继承了 bui.Control */
bui.inherits(bui.Select, bui.Control);

});