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
 * @name 表单数据验证类
 * @public
 * @author wanghaiyang
 * @date 2013/08/08
 */
define('./bui.Validator', ['./bui'], function(){
bui.dom = bui.dom || document;

bui.Validator = {
    /**
     * @name 通用错误提示
     */
    errorMsg: {
        'SUCCESS': '',
        'ERROR_EMPTY': 'Can not be empty',
        'ERROR_REGEX': 'Wrong format',
        'ERROR_INT': 'Wrong format，please fill out the integer',
        'ERROR_NUMBER': 'Wrong format，Please fill in the number',
        'ERROR_MIN': 'Not be less than #{0}',
        'ERROR_MIN_DATE': 'Can not be earlier #{0}',
        'ERROR_MAX': 'No more than #{0}',
        'ERROR_MAX_DATE': 'No later than #{0}',
        'ERROR_GT': 'must be more than #{0}',
        'ERROR_GT_DATE': 'Must be later than #{0}',
        'ERROR_LT': 'Must be less than #{0}',
        'ERROR_LT_DATE': 'Must be earlier than #{0}',
        'ERROR_RANGE': ' #{0} #{1} the range',
        'ERROR_LENGTH': 'Length must be equal #{0}',
        'ERROR_MIN_LENGTH': 'Length not be less than #{0}',
        'ERROR_MAX_LENGTH': 'Length not be greater than #{0}',
        'ERROR_LENGTH_RANGE': 'Length #{0} #{1} the range',
        'ERROR_CALENDAR': 'Wrong format，Please input as format 2010-01-01\'s',
        'ERROR_EXT': 'Extension is not legitimate, allowing only the suffix #{0}',
        'ERROR_BACKEND': ' #{0}'
    },
    /**
     * @name Id后缀及错误样式名
     */
    config: {    
        errorClass: 'validate-error',
        validClass: 'validate',
        iconClass: 'validate-icon',
        textClass: 'validate-text',
        suffix: 'validate',
        iconSuffix: 'validateIcon',
        textSuffix: 'validateText'
    },
    /**
     * @name 待验证的对象获取值解析器
     */
    parse: function(text, type) {
        if (type === 'int') {
            return parseInt(text, 10);
        } 
        else if (type === 'float') {
            return parseFloat(text);
        } 
        else if (type === 'date') {
            return bui.Validator.parseDate(text);
        } 
        else {
            return text;
        }
    },

    /**
     * @name 设定控件的innerHTML[nodejs&browser]
     * @public
     * @param {String} html innerHTML
     * @param {HTMLElement} elem 默认为控件主DOM[可选]
     * @return {String}
     */
    setInnerHTML: function (html, elem) {
        var me = this,
            elem = elem || me.getMain();
        if (elem.setInnerHTML) {
            elem.setInnerHTML(html);
        }
        else if (elem.innerHTML !== undefined) {
            elem.innerHTML = html;
        }
    },
    /**
     * @name 在父元素的末尾提示信息
     * @private
     * @param {String} noticeText 错误信息.
     * @param {HTMLElement} input 控件元素.
     */
    noticeInTail: function(noticeText, control) {
        var me = bui.Validator,
            input = control && control.getMain ? control.getMain() : control;
        me.showNoticeDom(control);
        var title = input.getAttribute('title') || '';
        me.setInnerHTML(title + noticeText, me.getTextEl(control));
    },

    /**
     * @name 在父元素的末尾提示信息
     * @private
     * @param {String} noticeText 错误信息.
     * @param {HTMLElement} input 控件元素.
     */
    noticeInTailNoTitle: function(noticeText, control) {
        var me = bui.Validator,
            input = control && control.getMain ? control.getMain() : control;
        me.showNoticeDom(control);
        me.setInnerHTML(noticeText, me.getTextEl(input));
    },

    /**
     * @name 显示notice的dom元素
     * @private
     * @param {HTMLElement} input 对应的input元素.
     */
    showNoticeDom: function(control) {
        var me = bui.Validator,
            input = control && control.getMain ? control.getMain() : control,
            el = me.getEl(input),
            father = input.parentNode;
        
        if (!el) {
            el = me.createNoticeElement(input);
            father.appendChild(el);
        }

        el.style.display = '';

        bui.Validator.addClass(father, me.config['errorClass']);
    },

    /**
     * @name 创建notice元素
     * @private
     * @param {HTMLElement} input 对应的input元素.
     * @return {HTMLElement}
     */
    createNoticeElement: function(input) {
        var me = bui.Validator,
            inputId = input.id,
            el = me.getEl(input),
            icon, text;

        if (!el) {
            el = bui.dom.createElement('div');
            el.id = inputId +'-'+ me.config['suffix'];
            el.className = me.config['validClass'];

            icon = bui.dom.createElement('div');
            icon.id = inputId +'-'+ me.config['iconSuffix'];
            icon.className = me.config['iconClass'];
            el.appendChild(icon);

            text = bui.dom.createElement('div');
            text.id = inputId +'-'+ me.config['textSuffix'];
            text.className = me.config['textClass'];
            el.appendChild(text);
        }

        return el;
    },

    /**
     * @name 在父元素的末尾取消提示信息
     * @private
     * @param {HTMLElement} input 控件元素.
     */
    cancelNoticeInTile: function(control) {
        var me = bui.Validator,
            input = control && control.getMain ? control.getMain() : control,
            el = me.getEl(input),
            father = input.parentNode;

        // 向上两层,管理员角色验证需要
        if (el) {
            el.style.display = 'none';
        }
        bui.Validator.removeClass(father, me.config['errorClass']);
        
        if (father.lastChild.className && father.lastChild.className.replace(/(^[\s\t\xa0\u3000]+)|([\u3000\xa0\s\t]+$)/g,'') === 'validate') {
            father.removeChild(father.lastChild);
        }
    },
    /**
     * @name 获取info区域的元素
     * @private
     * @param {HTMLElement} input 对应的input元素.
     * @return {HTMLElement}
     */
    getTextEl: function(input) {
        var me = this,
            elem,
            input = input && input.getMain ? input.getMain() : input;
        elem = bui.dom.getElementById(input.id +'-'+ me.config['textSuffix']);
        return elem;
    },

    /**
     * @name 获取提示元素
     * @private
     * @param {HTMLElement} input 对应的input元素.
     * @return {HTMLElement}
     */
    getEl: function(input) {
        var me = this,
            elem,
            input = input && input.getMain ? input.getMain() : input;
        elem = bui.dom.getElementById(input.id +'-'+ me.config['suffix']);
        return elem;
    },
    /**
     * @name 获取提示元素
     * @private
     * @param {HTMLElement} input 对应的input元素.
     * @return {HTMLElement}
     */
    getSegElement: function(control, segId) {
        var me = this,
            elem = bui.dom.getElementById(segId);
        return elem;
    },
    /**
     * @name 验证规则
     * @private
     * @param {ui.Control} control 需要验证的控件.
     * @param {String} ruleName 验证规则的名称,格式rule:notEmpty,preControl,nextControl.
     * 后面会根据preserveArgument是否为true决定是否及preControl,nextControl是否
     */
    applyRule: function(control, ruleName) {
        // 判断控件是否具有获取value的方法
        if (!control || (!control.getValue && control.value === null) || !ruleName) {
            return true;
        }
        
        // [nodejs&browser]
        if (!bui.dom && control.getMain().setInnerHTML) {
            bui.dom = bui.bocument;
        }
        bui.dom = bui.dom || document;
    
        var me = this,
            ruleSegment = ruleName.split(','),
            text = control.getValue ? control.getValue(true) : control.value,
            rule = me.ruleMap[ruleSegment[0]],
            args = [text], 
            error, 
            errorText = '';

        // FIXME 采用control.isCheckBox()
        if (control.type == 'checkbox') {
            text = control.getChecked() || control.checked;
            args = [text];
        }
        if (ruleSegment.length) {
            me.parseRuleSegment(control, rule, args, ruleSegment);
        }

        error = rule.validate.apply(rule, args);

        if (parseInt('0'+String(error).replace(/\s/g,''),10) !== 0) { //TODO:这种形式是要被历史遗弃的
            if ('object' == typeof rule.noticeText) {
                errorText = rule.noticeText[error];
            } 
            else {
                errorText = rule.noticeText;
            }
        } 
        else if (Object.prototype.toString.call(error) == '[object String]' && error !== '') {
            errorText = me.errorMsg[error];
        } 
        else if (Object.prototype.toString.call(error)==='[object Array]') {
            error[0] = me.errorMsg[error[0]];
            errorText = bui.Validator.format(error[0], error.splice(1,error.length));
        }

        if (errorText) {
            rule.notice = rule.notice || me.noticeInTail;
            rule.notice(errorText, control);
        } 
        else {
            rule.cancelNotice = rule.cancelNotice || me.cancelNoticeInTile;
            rule.cancelNotice(control);
        }
        return !errorText;
    },
    /**
     * @name 解析rule:ruleName,argus01,...中的其他参数
     * @private
     * @param {ui.Control} control 需要验证的控件.
     * @param {String} ruleName 验证规则的名称,格式rule:notEmpty,preControl,nextControl.
     * 后面会根据preserveArgument是否为true决定是否及preControl,nextControl是否加到args中
     */
    parseRuleSegment: function(control, rule, args, ruleSegment){
        var me = this,
            i,
            segLen = ruleSegment.length,
            ctrl = null;
        // ruleSegment[0] is ruleName
        for (i = 1; i < segLen; i++) {
            if (ruleSegment[i] == 'this') {
                // pass control to validate function
                args.push(control);
            } 
            // preserveArgument 保护参数
            else if (!rule.preserveArgument) {
                if (bui 
                    && bui.Control 
                    && bui.Control.getById 
                    && (ctrl = bui.Control.getById(ruleSegment[i], control.getAction ? control.getAction() : null))
                    && !!ctrl) {
                    if (ctrl.getValue && !ctrl.getState('disabled')) {
                        if (ctrl.type == 'checkbox' || ctrl.type == 'radiobox') {
                            args.push(ctrl.getChecked());
                        } 
                        else {
                            args.push(ctrl.getValue());
                        }
                    }
                    else {
                        args.push(ctrl);
                    }
                }
                else {
                    ctrl = me.getSegElement(control, ruleSegment[i]);
                    if (ctrl && ctrl.value !== null && !ctrl.getAttribute('disabled')) {
                        if (ctrl.type == 'checkbox' || ctrl.type == 'radiobox') {
                            args.push(ctrl.getAttribute('checked'));
                        } 
                        else {
                            args.push(ctrl.value);
                        }
                    }
                    else {
                        args.push(ctrl);
                    }
                }
            }
        }
    }
};

/**
 * @name 对目标字符串进行格式化
 * @param {String} source 目标字符串
 * @param {Object|String...} opts 提供相应数据的对象或多个字符串
 * @returns {String} 格式化后的字符串
 */
bui.Validator.format = function (source, opts) {
    source = String(source);
    var data = Array.prototype.slice.call(arguments,1), toString = Object.prototype.toString;
    if(data.length){
        data = (data.length == 1 ? 
            /* ie 下 Object.prototype.toString.call(null) == '[object Object]' */
            (opts !== null && (/\[object Array\]|\[object Object\]/.test(toString.call(opts))) ? opts : data) 
            : data);
        return source.replace(/#\{(.+?)\}/g, function (match, key){
            var replacer = data[key];
            // chrome 下 typeof /a/ == 'function'
            if('[object Function]' == toString.call(replacer)){
                replacer = replacer(key);
            }
            return ('undefined' == typeof replacer ? '' : replacer);
        });
    }
    return source;
};

/**
 * @name 为目标元素添加className
 * 
 * @param {HTMLElement|String} element 目标元素或目标元素的id
 * @param {String} className 要添加的className，允许同时添加多个class，中间使用空白符分隔
 * @remark
 * 使用者应保证提供的className合法性，不应包含不合法字符，className合法字符参考：http://www.w3.org/TR/CSS2/syndata.html。
 *     
 *                 
 * @returns {HTMLElement} 目标元素
 */
bui.Validator.addClass = function (element, className) {
    bui.Validator.removeClass(element, className);
    element.className = (element.className +' '+ className).replace(/(\s)+/ig," ");
    return element;
};
bui.Validator.removeClass = function(element, className) {
    var list = className.replace(/\s+/ig, ' ').split(' '),
        str = element.className;
    var i,len,k,v;
    for (i=0,len=list.length; i < len; i++){
         str = (" "+str.replace(/(\s)/ig,"  ")+" ").replace(new RegExp(" "+list[i]+" ","g")," ");
    }
    str = str.replace(/(\s)+/ig," ");
    element.className = str;
    str = str.replace(/^(\s)+/ig,'').replace(/(\s)+$/ig,'');
    return element;
};

/*  
  将String类型解析为Date类型.  
  parseDate('2006-1-1') return new Date(2006,0,1)  
  parseDate(' 2006-1-1 ') return new Date(2006,0,1)  
  parseDate('2006-1-1 15:14:16') return new Date(2006,0,1,15,14,16)  
  parseDate(' 2006-1-1 15:14:16 ') return new Date(2006,0,1,15,14,16);  
  parseDate('不正确的格式') retrun null  
*/   
bui.Validator.parseDate = function(str){   
    str = String(str).replace(/^[\s\xa0]+|[\s\xa0]+$/ig, ''); 
    var results = null; 
     
    // 秒数 #9744242680 
    results = str.match(/^ *(\d{10}) *$/);   
    if(results && results.length>0)   
      return new Date(parseInt(str)*1000);    
     
    // 毫秒数 #9744242682765 
    results = str.match(/^ *(\d{13}) *$/);   
    if(results && results.length>0)   
      return new Date(parseInt(str));    
     
    // 20110608 
    results = str.match(/^ *(\d{4})(\d{2})(\d{2}) *$/);   
    if(results && results.length>3)   
      return new Date(parseInt(results[1]),parseInt(results[2]) -1,parseInt(results[3]));    
     
    // 20110608 1010 
    results = str.match(/^ *(\d{4})(\d{2})(\d{2}) +(\d{2})(\d{2}) *$/);   
    if(results && results.length>6)   
      return new Date(parseInt(results[1]),parseInt(results[2]) -1,parseInt(results[3]),parseInt(results[4]),parseInt(results[5]));    
     
    // 2011-06-08 
    results = str.match(/^ *(\d{4})[\._\-\/\\](\d{1,2})[\._\-\/\\](\d{1,2}) *$/);   
    if(results && results.length>3)   
      return new Date(parseInt(results[1]),parseInt(results[2]) -1,parseInt(results[3]));    
     
    // 2011-06-08 10:10 
    results = str.match(/^ *(\d{4})[\._\-\/\\](\d{1,2})[\._\-\/\\](\d{1,2}) +(\d{1,2}):(\d{1,2}) *$/);   
    if(results && results.length>6)   
      return new Date(parseInt(results[1]),parseInt(results[2]) -1,parseInt(results[3]),parseInt(results[4]),parseInt(results[5]));    
     
    // 2011-06-08 10:10:10 
    results = str.match(/^ *(\d{4})[\._\-\/\\](\d{1,2})[\._\-\/\\](\d{1,2}) +(\d{1,2}):(\d{1,2}):(\d{1,2}) *$/);   
    if(results && results.length>6)   
      return new Date(parseInt(results[1]),parseInt(results[2]) -1,parseInt(results[3]),parseInt(results[4]),parseInt(results[5]),parseInt(results[6]));    
     
    return null;   
};


/**
 * @name 验证规则集合
 * @private
 */
bui.Validator.ruleMap = {
    'required': {
        preserveArgument: true,

        validate: function(text) {
            if (!text || (Object.prototype.toString.call(text) == '[object String]' && String(text).replace(/(^[\s\t\xa0\u3000]+)|([\u3000\xa0\s\t]+$)/g,'') === '')) {
                return 'ERROR_EMPTY';
            }
            return 'SUCCESS';
        }
    },

    'ext' : {
        preserveArgument: true,

        /**
         * @param {String} text 需要检查的文本内容.
         * @param {...*} var_args 合法的后缀名.
         */
        validate: function(text, var_args) {
          if (String(text).replace(/(^[\s\t\xa0\u3000]+)|([\u3000\xa0\s\t]+$)/g,'') === '') {
            return 'ERROR_EMPTY';
          }

          var allowedExt = Array.prototype.slice.call(arguments, 1);
          var dotIndex = text.lastIndexOf('.');
          if (dotIndex == -1) {
            return ['ERROR_EXT', allowedExt.join(',')];
          }

          var ext = text.substring(dotIndex + 1).toLowerCase();
          for (var i = 0, j = allowedExt.length; i < j; i++) {
            if (allowedExt[i].toLowerCase() == ext) {
              return 'SUCCESS';
            }
          }

          return ['ERROR_EXT', allowedExt.join(',')];
        }
    },

    'regex': {
        preserveArgument: true,

        validate: function(text, pattern, modifiers) {
            if (String(text).replace(/(^[\s\t\xa0\u3000]+)|([\u3000\xa0\s\t]+$)/g,'') === '') {
                return 'SUCCESS';
            }
            if (!new RegExp(pattern, modifiers).test(text)) {
                return 'ERROR_REGEX';
            }
            return 'SUCCESS';
        }
    },

    'int': {
        preserveArgument: true,

        validate: function(text) {
            if (String(text).replace(/(^[\s\t\xa0\u3000]+)|([\u3000\xa0\s\t]+$)/g,'') === '') {
                return 'SUCCESS';
            }
            if (isNaN(text - 0) || text.indexOf('.') >= 0) {
                return 'ERROR_INT';
            }
            return 'SUCCESS';
        }
    },

    'number': {
        preserveArgument: true,

        validate: function(text) {
            if (String(text).replace(/(^[\s\t\xa0\u3000]+)|([\u3000\xa0\s\t]+$)/g,'') === '') {
                return 'SUCCESS';
            }
            if (isNaN(text - 0)) {
                return 'ERROR_NUMBER';
            }
            return 'SUCCESS';
        }
    },

    'min': {
        preserveArgument: true,

        validate: function(text, minValue, type) {
            if (String(text).replace(/(^[\s\t\xa0\u3000]+)|([\u3000\xa0\s\t]+$)/g,'') === '') {
                return 'SUCCESS';
            }
            if (bui.Validator.parse(text, type) < bui.Validator.parse(minValue, type)) {
                return [type === 'date' ? 'ERROR_MIN_DATE' : 'ERROR_MIN', minValue];
            }
            return 'SUCCESS';
        }
    },

    'gt': {
        preserveArgument: true,

        validate: function(text, minValue, type) {
            if (String(text).replace(/(^[\s\t\xa0\u3000]+)|([\u3000\xa0\s\t]+$)/g,'') === '') {
                return 'SUCCESS';
            }
            if (bui.Validator.parse(text, type) <= bui.Validator.parse(minValue, type)) {
                return [type === 'date' ? 'ERROR_GT_DATE' : 'ERROR_GT', minValue];
            }
            return 'SUCCESS';
        }
    },

    'max': {
        preserveArgument: true,

        validate: function(text, maxValue, type) {
            if (String(text).replace(/(^[\s\t\xa0\u3000]+)|([\u3000\xa0\s\t]+$)/g,'') === '') {
                return 'SUCCESS';
            }
            if (bui.Validator.parse(text, type) > bui.Validator.parse(maxValue, type)) {
                return [type === 'date' ? 'ERROR_MAX_DATE' : 'ERROR_MAX', maxValue];
            }
            return 'SUCCESS';
        }
    },

    'lt': {
        preserveArgument: true,

        validate: function(text, maxValue, type) {
            if (String(text).replace(/(^[\s\t\xa0\u3000]+)|([\u3000\xa0\s\t]+$)/g,'') === '') {
                return 'SUCCESS';
            }
            if (bui.Validator.parse(text, type) >= bui.Validator.parse(maxValue, type)) {
                return [type === 'date' ? 'ERROR_LT_DATE' : 'ERROR_LT', maxValue];
            }
            return 'SUCCESS';
        }
    },

    'range': {
        preserveArgument: true,

        validate: function(text, minValue, maxValue, type) {
            if (String(text).replace(/(^[\s\t\xa0\u3000]+)|([\u3000\xa0\s\t]+$)/g,'') === '') {
                return 'SUCCESS';
            }
            if (bui.Validator.parse(text, type) - bui.Validator.parse(maxValue, type) > 0 ||
                bui.Validator.parse(text, type) - bui.Validator.parse(minValue, type) < 0) {
                return ['ERROR_RANGE', minValue, maxValue];
            }
            return 'SUCCESS';
        }
    },

    'length': {
        preserveArgument: true,

        validate: function(text, length) {
            if (text.length !== length) {
                return ['ERROR_LENGTH', length];
            }
            return 'SUCCESS';
        }
    },

    'minLength': {
        preserveArgument: true,

        validate: function(text, minLength) {
            if (text.length < minLength) {
                return ['ERROR_MIN_LENGTH', minLength];
            }
            return 'SUCCESS';
        }
    },

    'maxLength': {
        preserveArgument: true,

        validate: function(text, maxLength) {
            if (text.length > maxLength) {
                return ['ERROR_MAX_LENGTH', maxLength];
            }
            return 'SUCCESS';
        }
    },

    'lengthRange': {
        preserveArgument: true,

        validate: function(text, minLength, maxLength) {
            if (text.length < minLength || text.length > maxLength) {
                return ['ERROR_LENGTH_RANGE', minLength, maxLength];
            }
            return 'SUCCESS';
        }
    },

    /****************************以上是通用验证规则************************/
    'username': {
        'validate': function(text) {
            var len = text.length;
            if (len === 0) {
                return 1;
            } else if (len < 3) {
                return 2;
            } else if (!(/^[a-zA-Z\d_\.\-]+$/.test(text))) {
                return 3;
            }

            return 0;
        },
        'notice': bui.Validator.noticeInTail,
        'cancelNotice': bui.Validator.cancelNoticeInTile,
        'noticeText': {
            1: 'Can not be empty',
            2: 'Length not less than three',
            3: 'Must contain only lowercase letters, uppercase letters, Arabic numerals, in the dash, and underscore'
        }
    },
    
    'name': {
        'validate': function(text) {
            var len = text.length;
            if (len === 0) {
                return 1;
            } else if (len > 100) {
                return 2;
            }

            return 0;
        },
        'notice': bui.Validator.noticeInTail,
        'cancelNotice': bui.Validator.cancelNoticeInTile,
        'noticeText': {
            1: 'Can not be empty',
            2: 'The length should not exceed 100'
        }
    },

    'email': {
        'validate': function(text) {
            var len = text.length;
            if (len == 0) {
                return 1;
            } else if (len > 64) {
                return 2;
            } else if (!/^([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})$/.test(text)) {
                return 3;
            }
            return 0;
        },
        'notice': bui.Validator.noticeInTail,
        'cancelNotice': bui.Validator.cancelNoticeInTile,
        'noticeText': {
            1: 'Can not be empty',
            2: 'Length can not exceed 64',
            3: 'Wrong format'
        }
    },
    'emailVerify': {
        'validate': function(text, text2) {
            var len = text.length;
            if (len === 0) {
                return 1;
            } else if (len > 64) {
                return 2;
            } else if (!/^.+@.+$/.test(text)) {
                return 3;
            } else if (text != text2) {
                return 4;
            }

            return 0;
        },
        'notice': bui.Validator.noticeInTailNoTitle,
        'cancelNotice': bui.Validator.cancelNoticeInTile,
        'noticeText': {
            1: 'Confirmation email can not be empty',
            2: 'Confirmation email length can not exceed 64',
            3: 'Confirmation email\'s format is wrong ',
            4: 'The message you twice enter is inconsistent，Please re-enter'
        }
    },
    'phone': {
        'validate': function(text) {
            var f = /^((0\d{2,3})-)(\d{7,8})(-(\d{3,}))?$/.test(text);
            if (text != '' && !f) {
                return 1;
            }
            return 0;
        },
        'notice': bui.Validator.noticeInTail,
        'cancelNotice': bui.Validator.cancelNoticeInTile,
        'noticeText': {
            1: 'Wrong format，by area code - phone number format to fill in'
        }
    },
    'fax': {
        'validate': function(text) {
            var f = /^((0\d{2,3})-)(\d{7,8})(-(\d{3,}))?$/.test(text);
            if (text != '' && !f) {
                return 1;
            }
            return 0;
        },
        'notice': bui.Validator.noticeInTail,
        'cancelNotice': bui.Validator.cancelNoticeInTile,
        'noticeText': {
            1: 'Wrong format，by area code - phone number format to fill in please.'
        }
    },
    'position': {
        'validate': function(text) {
            var len = text.length;
            if (len > 64) {
                return 1;
            }

            return 0;
        },
        'notice': bui.Validator.noticeInTail,
        'cancelNotice': bui.Validator.cancelNoticeInTile,
        'noticeText': {
            1: 'Length can not exceed 64'
        }
    },
    'mobile': {
        'validate': function(text) {
            var f = /^[\d\-\(\)\[\] ]+$/.test(text);
            if (text != '' && !f) {
                return 1;
            }

            return 0;
        },
        'notice': bui.Validator.noticeInTailNoTitle,
        'cancelNotice': bui.Validator.cancelNoticeInTile,
        'noticeText': {
            1: 'Mobile Number\'s format is wrong '
        }
    },
    'adress': {
        'validate': function(text) {
            var len = text.length;
            if (text != '' && len > 1024) {
                return 1;
            }

            return 0;
        },
        'notice': bui.Validator.noticeInTailNoTitle,
        'cancelNotice': bui.Validator.cancelNoticeInTile,
        'noticeText': {
            1: 'Address\'s length should not exceed 1024'
        }
    },

    'description': {
        'validate': function(text) {
            return (text.length <= 4000) ? 0 : 1;
        },
        'notice': bui.Validator.noticeInTail,
        'cancelNotice': bui.Validator.cancelNoticeInTile,
        'noticeText': 'Length can not exceed 4000'
    },

    'notEmpty': {
        'validate': function(text) {
            var len = text.length;
            if (len === 0) {
                return 1;
            }

            return 0;
        },
        'notice': bui.Validator.noticeInTail,
        'cancelNotice': bui.Validator.cancelNoticeInTile,
        'noticeText': {
            1: 'Can not be empty'
        }
    },

    'password': {
        'validate': function(text) {
            var len = text.length;
            if (len === 0) {
                return 1;
            } else if (len < 6) {
                return 2;
            } else if (!(/[a-z]/.test(text) && /[A-Z]/.test(text) && /\d/.test(text))) {
                return 3;
            }

            return 0;
        },
        'notice': bui.Validator.noticeInTail,
        'cancelNotice': bui.Validator.cancelNoticeInTile,
        'noticeText': {
            1: 'Can not be empty',
            2: 'Not less than six',
            3: 'Must contain lowercase letters, uppercase letters and Arabic numerals three characters'
        }
    },

    'passwordVerify': {
        'validate': function(text, text1) {
            var len = text.length;
            if (len === 0) {
                return 1;
            } else if (text != text1) {
                return 2;
            }

            return 0;
        },

        'notice': bui.Validator.noticeInTailNoTitle,
        'cancelNotice': bui.Validator.cancelNoticeInTile,
        'noticeText': {
            1: 'Password can not be empty',
            2: 'The password you twice enter is inconsistent，please re-enter'
        }
    },
    'birthday' : {
        'validate': function(text) {
            text = String(text).replace(/\s/g,'');
            if (!(/^\d\d\d\d[-\.]\d\d[-\.]\d\d$/.test(text))) {
                return 1;
            }
        },
        'notice': bui.Validator.noticeInTailNoTitle,
        'cancelNotice': bui.Validator.cancelNoticeInTile,
        'noticeText': {
            1: 'Wrong date format,The correct format is 2012-03-30'
        }
    },
    

    'backendError': {
        validate: function(text, control) {
            return ['ERROR_BACKEND', control.errorMessage];
        },
        notice: bui.Validator.noticeInTailNoTitle
    }
};

/**
 * @name 验证规则集合
 * @public
 * @param {String} ruleName 规则名称
 * @param {Map} rule 规则内容
 */
bui.Validator.addRule = function(ruleName, ruleContent, force){
    if (!force && bui.Validator.ruleMap[ruleName]) {
        throw { title: 'bui.Validator.addRule() Error: ', name: 'rule "'+ruleName+'" exist.'};
    }
    else {
        bui.Validator.ruleMap[ruleName] = ruleContent;
    }
};

});


