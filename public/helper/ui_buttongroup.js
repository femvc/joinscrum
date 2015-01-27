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
 * @name 按钮多项选择
 * @public
 * @author wanghaiyang
 * @date 2013/08/08
 * @param {Object} options 控件初始化参数.
 */
define('./bui.ButtonGroup', ['./bui', './bui.Control'], function(){

bui.ButtonGroup = function (options, pending) {
    bui.ButtonGroup.superClass.call(this, options, 'pending');
    
    // 类型声明，用于生成控件子dom的id和class
    this.type = 'ButtonGroup';

    //进入控件处理主流程!
    if (pending != 'pending') {
        this.enterControl();
    }
};

bui.ButtonGroup.prototype = {
    /**
     * @name 内部元素模板
     * @protected
     */
    getTpl: function () {
        var tpl = '<button type="button" id="#{0}" value="#{1}" class="btn btn-info #{2}" ' + 
            ' onclick="bui.Control.getById(\'#{3}\').setValue(this.getAttribute(\'value\'))" >#{1}</button>';
        
        return tpl;
    },
    /**
     * @name 生成内容
     * @protected
     */
    initContent: function() {
        var me = this,
            html = [],
            options = me.options,
            item,
            value = me.value;
        
        for (var i=0,len=options.length; i<len; i++) {
            item = options[i];
            html.push(bui.Control.format(me.getTpl(),
                me.getId(item),
                item,
                item == value ? ' active' : '',
                me.getId()
            ));
        }
        me.setInnerHTML(html.join(''));
    },
    /**
     * @name 设置备选选项
     * @protected
     * @param {Array} value 备选选项值,如[[id01,title01],[id02,title02]]
     */
    setOptions: function (value) {
        var me = this;
        if (value == undefined) {
            value = [];
        }
        else if (value&&value.join) {
            value = value;
        }
        else if (value&&value.substr) {
            value = (new Function("return " + value + ";"))();
        }
        else {
            value = [];
        }
        
        me.options = value;
        me.initContent();
    },
    /**
     * @name 将文本框设置为不可写
     * @public
     * @param {Boolean|String} readonly
     */
    setDisabled: function(value) {
        var attr = 'disabled';
        if (typeof value === 'undefined') {
            value = true;
        }
        value = !!value ? attr : '';
        var me = this,
            list = me.getMain().getElementsByTagName('BUTTON'),
            item;
        for (var i=0,len=list.length; i<len; i++) {
            list[i].disabled = value;
            if (!value) list[i].removeAttribute(attr);
        }
        me[attr] = value;
    },
    initView: function () {
        var me = this;
        me.setOptions(me.options);
    },
    initBehavior: function () {
        var me = this;
        console.log('initBehavior - main:' + me.getMain().getAttribute('id'));
    },
    /**
     * @name 渲染控件
     * @protected
     */
    render: function() {
        bui.ButtonGroup.superClass.prototype.render.call(this);
        var me = this;
        
        me.setValue(me.value);
        //me.options = ["0|所有","2|小清新","3|猎奇","4|约会","5|复古","6|下午茶","7|买醉","8|文艺","9|名人出入","10|有故事","11|小聚","12|隐蔽","13|音乐","14|娱乐","15|一个人","16|好风景","17|私房菜","18|电影","19|坏品位","20|附近","21|咖啡馆/沏茶店","22|逛街","23|甜品","24|日本料理","25|露天","26|宵夜","27|爱吃辣","28|早午餐","29|晚餐","30|新开"];
        
        //me.initBehavior();
    },
    /**
     * @name 设置控件的值
     * @protected
     * @param {Array|String} value 已选选项值,如[id01,id02]
     */
    setValue: function (value) {
        var me = this,
            options = me.getMain().getElementsByTagName('BUTTON'),
            item;
        /*if (me.value === value) {
            value = null;
        }*/
        for (var i=0,len=options.length; i<len; i++) {
            item = options[i];
            if (value != undefined && item.getAttribute('value') === String(value)) {
                bui.Control.addClass(item, 'active');
            }
            else {
                bui.Control.removeClass(item, 'active');
            }
        };
        
        me.value = value;
        
    },
    /**
     * @name 获取控件的值
     * @protected
     * @param {Array|String} value 已选选项值,如[id01,id02]
     */
    getValue: function () {
        return this.value;
    }
};
/*通过bui.Control派生bui.Button*/
//bui.Control.derive(bui.ButtonGroup);
bui.inherits(bui.ButtonGroup, bui.Control);

});