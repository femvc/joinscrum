'use strict';

define('./login', [], function(){


var login = function(){
    bui.Action.call(this);
    /**
     * @name Action索引ID
     * @comment 主要用于控件中通过onclick="bui.Control.get('listTable','login');
     */
    this.id = 'userLogin';
    this.view = 'login';
    /**
     * 初始化数据模型
     */
    this.model = new bui.BaseModel({});
    this.BACK_LOCATION = '/login';

};
    
login.prototype = {
    initModel: function(callback){
        
        callback&&callback();
    },
    /**
     * @name 初始化列表行为
     * @param {Object} clist 当前主内容区域绘制的控件集合.
     */
    initBehavior: function(clist) {
        var me = this;
        
        if (me.args['logout']) {
            Requester.get('/scrum_api/user_logout?user_id=' + bui.getCookie('mid'), {
                onsuccess: new Function()
            });
            
            bui.context.set('mid', '');
            bui.context.set('token', '');
            bui.setCookie('token', '');

        }
        
        var username = me.getByFormname('username');
        var password = me.getByFormname('password');
        var login_submit = me.getByFormname('login_submit');

        if (username.getValue() == '' && bui.getCookie('mid')) {
             username.setValue(bui.getCookie('mid'));
        }
        
        username.onenter = password.onenter = login_submit.onclick = function(){ me.onSubmit();};
        
    },
    /**
     * @name 初始化列表行为
     * @param {Object} clist 当前主内容区域绘制的控件集合.
     */
    onSubmit: function(){
        if (this.validate()) {
            var me = this,
                username = me.getByFormname('username').getValue(),
                password = me.getByFormname('password').getValue();
            
            Requester.get('/scrum_api/user_login', {
                data: { 
                    username: username,
                    password: password
                },  
                onsuccess: bui.fn(me.loginCallback, me)
            });
        }
    },
    loginCallback: function(err, data){
        var me = this,
            result = data ? data[1] : [];
        if (String(data.success) == 'true' && result.mid && result.token) {
            
            bui.context.set('mid', result['mid']);
            bui.context.set('token', result['token']);
            bui.setCookie('mid', result['mid']);
            bui.setCookie('token', result['token']);

            if (bui.Locator.currentLocation.indexOf('/login') == 0) {
                bui.setCookie('taskboard_user', result['mid']);
                bui.Locator.redirect('/');
            }
            else {
                bui.Locator.reload();
            }
        }
    }
};


bui.inherits(login, bui.Action);

bui.window.login = login;

});
