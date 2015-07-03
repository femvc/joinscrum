'use strict';
//   __    __           ______   ______  _____    __  __     
//  /\ \  /\ \ /'\_/`\ /\  _  \ /\__  _\/\  __`\ /\ \/\ \    
//  \ `\`\\/'//\      \\ \ \/\ \\/_/\ \/\ \ \/\ \\ \ \ \ \   
//   `\ `\ /' \ \ \__\ \\ \  __ \  \ \ \ \ \ \ \ \\ \ \ \ \  
//     `\ \ \  \ \ \_/\ \\ \ \/\ \  \ \ \ \ \ \_\ \\ \ \_\ \ 
//       \ \_\  \ \_\\ \_\\ \_\ \_\  \ \_\ \ \_____\\ \_____\
//        \/_/   \/_/ \/_/ \/_/\/_/   \/_/  \/_____/ \/_____/
//                                                           
//                                                           

/**
 * @name 组件
 * @public
 * @author haiyang5210
 * @date 2014-11-15 20:10
 * @param {Object} options 控件初始化参数.
 */
hui.define('hui_label', ['hui_control'], function () {

    hui.Label = function (options, pending) {
        this.isFormItem = false; // 注：getParamMap时不需要处理label
        hui.Label.superClass.call(this, options, 'pending');

        //进入控件处理主流程!
        if (pending != 'pending') {
            this.enterControl();
        }
    };

    hui.Label.prototype = {
        /**
         * @name 渲染控件
         * @param {Object} main 控件挂载的DOM.
         */
        render: function () {
            hui.Label.superClass.prototype.render.call(this);
            var me = this;
            //me.main = main;
            if (me.text !== undefined) {
                me.setInnerHTML(me, me.text);
            }
            // 设置_rendered
            main.setAttribute('_rendered', 'true');
        },
        /**
         * @name 设置文字
         * @param {Object} main 控件挂载的DOM.
         */
        setValue: function (txt) {
            var me = this;
            //me.main = main;
            if (me.main) {
                txt = String(txt);
                me.setInnerHTML(me, txt);
                me.value = txt;
                me.text = txt;
            }
        }
    };

    /* hui.Label 继承了 hui.Control */
    hui.inherits(hui.Label, hui.Control);

});