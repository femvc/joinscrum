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
 * @name 全局通用事件字典
 * @public
 * @author wanghaiyang
 * @date 2013/08/08
 */
define('./bui.events', ['./bui'], function(){

bui.events = {
  // 浏览器事件
  LOAD: 'load',
  CLICK: 'click',
  DBCLICK: 'dbclick',
  MOUSE_OVER: 'mouseover',
  MOUSE_OUT: 'mouseout',
  ENTER: 'enter',
  OPEN: 'open',

  // 自定义的事件
  ITEM_CLICK: 'itemclick',
  VIEWAREA_CHANGE: 'viewareachange',
  BEFORE_CHANGE: 'beforechange',
  BEFORE_QUEUE: 'beforequeue',
  AFTER_QUEUE: 'afterqueue',
  BEFORE_UPLOAD: 'beforeupload',
  AFTER_UPLOAD: 'afterupload',
  UPLOAD_SUCCESS: 'uploadsuccess',
  UPLOAD_FAILURE: 'uploadfailure',
  AFTER_DELETE: 'afterdelete',
  AFTER_RENDER: 'afterrender',
  AFTER_COLUMN_RESIZE: 'aftercolumnresize',
  AFTER_SELECT: 'afterselect',
  AFTER_SHOW: 'aftershow',
  AFTER_HIDE: 'afterhide'
};

});
