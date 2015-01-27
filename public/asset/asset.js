'use strict';
/**
 * 基础库, 非必需,可以是jQuery,tangram等
 *
 * @private
 */
document.write('<script type="text/javascript" src="helper/require.js               "></script>');
document.write('<script type="text/javascript" src="helper/ext_md5.js               "></script>');
document.write('<script type="text/javascript" src="helper/ext_base64.js            "></script>');
document.write('<script type="text/javascript" src="helper/ext_json.js              "></script>');
document.write('<script type="text/javascript" src="helper/ext_dragdrop.js          "></script>');
document.write('<script type="text/javascript" src="helper/ext_chart.js             "></script>');

/**
 * FEMVC 框架主体文件
 *
 * @private
 */
document.write('<script type="text/javascript" src="helper/bui.js                   "></script>');
document.write('<script type="text/javascript" src="helper/bui_eventdispatcher.js   "></script>');
document.write('<script type="text/javascript" src="helper/bui_events.js            "></script>');
document.write('<script type="text/javascript" src="helper/bui_basemodel.js         "></script>');
document.write('<script type="text/javascript" src="helper/bui_context.js           "></script>');
document.write('<script type="text/javascript" src="helper/bui_master.js            "></script>');
document.write('<script type="text/javascript" src="helper/bui_template.js          "></script>');
document.write('<script type="text/javascript" src="helper/bui_control.js           "></script>');
document.write('<script type="text/javascript" src="helper/bui_action.js            "></script>');
document.write('<script type="text/javascript" src="helper/bui_router.js            "></script>');
document.write('<script type="text/javascript" src="helper/bui_locator.js           "></script>');
document.write('<script type="text/javascript" src="helper/bui_permission.js        "></script>');
document.write('<script type="text/javascript" src="helper/bui_validator.js         "></script>');
document.write('<script type="text/javascript" src="helper/bui_init.js              "></script>');
document.write('<script type="text/javascript" src="helper/bui_asyque.js            "></script>');
document.write('<script type="text/javascript" src="helper/bui_mockup.js            "></script>');
document.write('<script type="text/javascript" src="helper/requester.js             "></script>');

/**
 * UI控件
 *
 * @public
 */
document.write('<script type="text/javascript" src="helper/ui_label.js              "></script>');
document.write('<script type="text/javascript" src="helper/ui_button.js             "></script>');
document.write('<script type="text/javascript" src="helper/ui_textinput.js          "></script>');
document.write('<script type="text/javascript" src="helper/ui_select.js             "></script>');
document.write('<script type="text/javascript" src="helper/ui_modal.js              "></script>');
document.write('<script type="text/javascript" src="helper/ui_taskboard.js          "></script>');

/**
 * 一些配置文件
 *
 * @public
 */
document.write('<script type="text/javascript" src="asset/templist.js               "></script>');

/**
 * 业务模块
 *
 * @public
 */
document.write('<script type="text/javascript" src="route/!!router.js               "></script>');
document.write('<script type="text/javascript" src="route/taskboard.js              "></script>');
document.write('<script type="text/javascript" src="route/login.js                  "></script>');
document.write('<script type="text/javascript" src="route/venue_detail.js           "></script>');
                                                        
//注: 文件加载完后,通过 bui.init();启动框架

