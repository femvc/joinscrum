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
 * @name 表单数据验证类[中文]
 * @public
 * @author wanghaiyang
 * @date 2013/08/08
 */

bui.Validator.errorMsg = {
    'SUCCESS': '',
    'ERROR_EMPTY': '不能为空',
    'ERROR_REGEX': '格式错误',
    'ERROR_INT': '格式不正确，请填写整数',
    'ERROR_NUMBER': '格式不正确，请填写数字',
    'ERROR_MIN': '不能小于#{0}',
    'ERROR_MIN_DATE': '不能早于#{0}',
    'ERROR_MAX': '不能大于#{0}',
    'ERROR_MAX_DATE': '不能晚于#{0}',
    'ERROR_GT': '必须大于#{0}',
    'ERROR_GT_DATE': '必须晚于#{0}',
    'ERROR_LT': '必须小于#{0}',
    'ERROR_LT_DATE': '必须早于#{0}',
    'ERROR_RANGE': '必须在#{0}到#{1}的范围内',
    'ERROR_LENGTH': '长度必须等于#{0}',
    'ERROR_MIN_LENGTH': '长度不能小于#{0}',
    'ERROR_MAX_LENGTH': '长度不能大于#{0}',
    'ERROR_LENGTH_RANGE': '长度必须在#{0}到#{1}的范围内',
    'ERROR_CALENDAR': '格式不正确，请按2010-01-01的格式输入',
    'ERROR_EXT': '后缀名不合法，只允许后缀名为#{0}',
    'ERROR_BACKEND': '#{0}'
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
            1: '不能为空',
            2: '长度不能少于3位',
            3: '只能包含小写字母、大写字母、阿拉伯数字、中划线和下划线'
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
            1: '不能为空',
            2: '的长度不能超过100'
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
            1: '不能为空',
            2: '长度不能超过64',
            3: '格式错误'
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
            1: '确认邮件不能为空',
            2: '确认邮件长度不能超过64',
            3: '确认邮件格式错误',
            4: '您两次输入的邮件不一致，请重新输入'
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
            1: '格式错误，请按区号-电话号码格式填写'
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
            1: '格式错误，请按区号-电话号码格式填写'
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
            1: '的长度不能超过64'
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
            1: '手机号码格式错误'
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
            1: '地址长度不得超过1024'
        }
    },

    'widthAndHeight': {
        'validate': function(text, text2, required) {
            if (text === '' && text2 === '' && required === false) {
                return 0;
            }
            var num = parseInt(text, 10);
            if (num > 0 && num <= 10000) {
                num = parseInt(text2, 10);
                if (num > 0 && num <= 10000) {
                    return 0;
                }
            }

            return 1;
        },

        'notice': bui.Validator.noticeInTailNoTitle,
        'cancelNotice': bui.Validator.cancelNoticeInTile,
        'noticeText': '请填写1～10000的整数'
    },

    'slotWidthAndHeight': {
        'validate': function(text, text2) {
            if (/^[0-9]{1,5}$/.test(text) && /^[0-9]{1,5}$/.test(text2)) {
                var num = parseInt(text, 10);
                if (num >= 0 && num <= 10000) {
                    num = parseInt(text2, 10);
                    if (num >= 0 && num <= 10000) {
                        return 0;
                    }
                }
            }

            return 1;
        },

        'notice': bui.Validator.noticeInTailNoTitle,
        'cancelNotice': bui.Validator.cancelNoticeInTile,
        'noticeText': '请填写0～10000的整数'
    },
    'description': {
        'validate': function(text) {
            return (text.length <= 4000) ? 0 : 1;
        },
        'notice': bui.Validator.noticeInTail,
        'cancelNotice': bui.Validator.cancelNoticeInTile,
        'noticeText': '的长度不能超过4000'
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
            1: '不能为空'
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
            1: '不能为空',
            2: '不能少于6位',
            3: '必须包含小写字母、大写字母和阿拉伯数字三种字符'
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
            1: '密码不能为空',
            2: '您两次输入的密码不一致，请重新输入'
        }
    },

    'rmtupload' : {
       'validate': function(text, control, required) {

            var localPath = control.controlMap.localPath.getValue();
            var len = localPath.length;
            var s1 = localPath.substring(localPath.length - 4, localPath.length).toLowerCase();
            var s2 = localPath.substring(localPath.length - 5, localPath.length - 4);


            if (len === 0) {
                if (required) {
                    return 1;
                }
            } else {
                if (control.mediatype == 'media' &&
                   (s1 != '.jpg' && s1 != '.gif' && s1 != '.png' && s1 != '.swf' || s2 == '/')) {
                    return 3;
                }
                if (control.mediatype == 'image' &&
                    (s1 != '.jpg' && s1 != '.gif' && s1 != '.png' || s2 == '/')) {
                    return 4;
                }
                if (control.mediatype == 'flash' &&
                    (s1 != '.swf' || s2 == '/')) {
                    return 5;
                }
            }

            return 0;
        },

        'notice': bui.Validator.noticeInTailNoTitleUploader,
        'cancelNotice': bui.Validator.cancelNoticeInTileUploader,
        'noticeText': {
            1: '请上传',
            2: '请填写1～10000的整数',
            3: '只能上传gif、jpg、png格式的图片或swf格式的Flash',
            4: '只能上传gif、jpg、png格式的图片',
            5: '只能上传swf格式的Flash'
        }
    },
    'rmtlink' : {
        'validate': function(text, required, staticsv) {
            var text = String(text).replace(/(^[\s\t\xa0\u3000]+)|([\u3000\xa0\s\t]+$)/g,'');
            var len = text.length;

            if (len === 0) {
                if (required) {
                    return 1;
                } else {
                    if (staticsv) {
                        return 4;
                    }
                }
            } else if (len > 1000) {
                return 2;
            } else if (!cb.util.regexp.urlLoose.test(text)) {
                return 3;
            }
        },
        'notice': bui.Validator.noticeInTailNoTitle,
        'cancelNotice': bui.Validator.cancelNoticeInTile,
        'noticeText': {
            1: '地址不能为空',
            2: '地址不能超过1000个字符',
            3: '地址格式错误',
            4: '为空时不能统计点击量'
        }
    },
    'rmttext': {
        'validate': function(text, required) {
            var len = text.length;
            if (len === 0) {
                if (required) {
                    return 1;
                }

            } else if (len > 100) {
                return 2;
            }

            return 0;
        },
        'notice': bui.Validator.noticeInTail,
        'cancelNotice': bui.Validator.cancelNoticeInTile,
        'noticeText': {
            1: '不能为空',
            2: '不能超过100个字符'
        }
    },
    'rmtnumber': {
        'validate': function(text, required) {
            var len = text.length;
            if (len === 0) {
                if (required) {
                    return 1;
                }
            } else if (!/^\-?(([1-9][0-9]*)|0)(\.[0-9]{1,2})?$/.test(text)) {
                return 2;
            }

            return 0;
        },
        'notice': bui.Validator.noticeInTail,
        'cancelNotice': bui.Validator.cancelNoticeInTile,
        'noticeText': {
            1: '不能为空',
            2: '请填写数字, 最多两位小数'
        }
    },
    'rmturl' : {
        'validate': function(text, required) {
            var len = text.length;
            var s1 = text.substring(text.length - 4, text.length).toLowerCase();
            var s2 = text.substring(text.length - 5, text.length - 4);
            if (len === 0) {
                if (required) {
                    return 1;
                }
            } else if (len > 1000) {
                return 2;
            } else if (!cb.util.regexp.urlLoose.test(text) || (s1 != '.jpg' && s1 != '.gif' && s1 != '.png' && s1 != '.swf') || s2 == '/') {
                return 3;
            }

        },
        'notice': bui.Validator.noticeInTailNoTitle,
        'cancelNotice': bui.Validator.cancelNoticeInTile,
        'noticeText': {
            1: 'URL地址不能为空',
            2: 'URL地址不能超过1000个字符',
            3: '请输入后缀为"jpg","gif","png"或"swf"的URL地址'
        }
    },
    'link' : {
        'validate': function(text) {
            var len = text.length;
            if (len === 0) {
                return 1;
            } else if (len > 1000) {
                return 2;
            } else if (!cb.util.regexp.urlLoose.test(text)) {
                return 3;
            }
        },
        'notice': bui.Validator.noticeInTail,
        'cancelNotice': bui.Validator.cancelNoticeInTile,
        'noticeText': {
            1: '不能为空',
            2: '不能超过1000个字符',
            3: '格式错误'
        }
    },
    'xmlValue' : {
        'validate': function(text) {
            if (!cb.util.regexp.xmlValue.test(text)) {
                return 1;
            }
        },
        'noticeText': {
            1: '不能含有：&lt; &gt; &amp; &#39; &quot;'
        }
    },
    'imgUrl' : {
        'validate': function(text) {
            var len = text.length;
            var s1 = text.substring(text.length - 4, text.length).toLowerCase();
            var s2 = text.substring(text.length - 5, text.length - 4);
            if (len === 0) {
                return 1;
            } else if (len > 1000) {
                return 2;
            } else if (!cb.util.regexp.urlLoose.test(text)) {
                return 3;
            } else if (s1 != '.jpg' && s1 != '.gif' && s1 != '.png' || s2 == '/') {
                return 4;
            }

        },
        'notice': bui.Validator.noticeInTailNoTitle,
        'cancelNotice': bui.Validator.cancelNoticeInTile,
        'noticeText': {
            1: '图片地址不能为空',
            2: '图片地址不能超过1000个字符',
            3: '图片地址格式错误',
            4: '请输入后缀为"jpg","gif"或"png"的图片地址'
        }
    },
    'imgTitle' : {
        'validate': function(text) {
            var len = text.length;
            if (len > 30) {
                return 1;
            }
        },
        'notice': bui.Validator.noticeInTailNoTitle,
        'cancelNotice': bui.Validator.cancelNoticeInTile,
        'noticeText': {
            1: '图片描述的长度不能超过30'
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
            1: '日期格式错误,正确格式为2012-03-30'
        }
    },
    

    'backendError': {
        validate: function(text, control) {
            return ['ERROR_BACKEND', control.errorMessage];
        },
        notice: bui.Validator.noticeInTailNoTitle
    }
};
