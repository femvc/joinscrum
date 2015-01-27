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
 * @name 前端构造测试数据
 */
define('./mocklist', ['./bui', './bui.Mockup'], function(){

bui.Mockup.set('/dashboard/editor_venues/update_new', {
    status: 'Update success.'
});
bui.Mockup.set('/scrum_api/user_list/all', {
    success: 'true',
    result: [
        {user_id:'unspecified',user_name:'',       user_label: '(unspecified)'},
        {user_id:'andy.wang',  user_name:'王海洋', user_label: '王海洋(andy.wang)'},
        {user_id:'jicheng.li', user_name:'李吉成', user_label: '李吉成(jicheng.li)'}
    ]
});
bui.Mockup.set('/scrum_api/product_list/all', {
    success: 'true',
    result: [
        {
            product_id : '100',
            product_name: 'Campus - Jiepang Team',
            product_key: 'CAMPUS'
        },
        {
            product_id : '101',
            product_name: 'Campus2 - Jiepang Team',
            product_key: 'CAMPUS'
        }
    ]
});
bui.Mockup.set('/scrum_api/sprint_list?product_id=100', {
    success: 'true',
    result: [
        {
            sprint_id: '1000',
            sprint_name: 'Campus - Jiepang Team',
            product_id: '100'
        },
        {
            sprint_id: '1001',
            sprint_name: 'Campus 2 - Jiepang Team',
            product_id: '100'
        }
    ]
});
// /scrum_api/get_backlog_list?sprint_id=0001
bui.Mockup.set('/scrum_api/backlog_list?sprint_id=1000', {
    success: 'true',
    result: [
        {
            backlog_id: '10000',
            backlog_name: '[C-2] 登录与账号',
            backlog_index: 1,
            sprint_id: '1000'
        },
        {
            backlog_id: '10001',
            backlog_name: 'Login/Logout',
            backlog_index: 2,
            sprint_id: '1000'
        }
    ]
});
// /scrum_api/get_task_list?sprint_id=0001
bui.Mockup.set('/scrum_api/task_list?sprint_id=1000', {
    success: 'true',
    result: [
        {
            task_id: '10000001',
            task_name: '[Android]发送请求到服务器端',
            task_desc: '客户端和服务器端都需要验证用户名、密码的有效性',
            task_person: 'andy.wang',
            task_status: 'notstarted',
            task_remaining: '2',
            task_estimate: '6',
            task_comments: 'no comments.',
            backlog_id: '10000'
        },
        {
            task_id: '10000002',
            task_name: '[Android]发送请求到服务器端2',
            task_desc: '客户端和服务器端都需要验证用户名、密码的有效性',
            task_person: 'andy.wang',
            task_status: 'notstarted',
            task_remaining: '2',
            task_estimate: '6',
            task_comments: 'no comments.',
            backlog_id: '10001'
        }
    ]
});

bui.Mockup.set('/scrum_api/save_task', [{
        success: 'true',
        result: {
            task_id: '10000001',
            task_name: '[Android]发送请求到服务器端',
            task_desc: '客户端和服务器端都需要验证用户名、密码的有效性',
            task_person: 'andy.wang',
            task_status: 'notstarted',
            task_remaining: '2',
            task_estimate: '6',
            task_comments: 'no comments.',
            backlog_id: '10000',
            index: 100
        }
    },
    {
        success: 'true',
        result: {
            task_id: '10000002',
            task_name: '[Android]发送请求到服务器端',
            task_desc: '客户端和服务器端都需要验证用户名、密码的有效性',
            task_person: 'andy.wang',
            task_status: 'notstarted',
            task_remaining: '2',
            task_estimate: '6',
            task_comments: 'no comments.',
            backlog_id: '10000',
            index: 100
        }
    },
    {
        success: 'true',
        result: {
            task_id: '10000003',
            task_name: '[Android]发送请求到服务器端',
            task_desc: '客户端和服务器端都需要验证用户名、密码的有效性',
            task_person: 'andy.wang',
            task_status: 'notstarted',
            task_remaining: '2',
            task_estimate: '6',
            task_comments: 'no comments.',
            backlog_id: '10000',
            index: 100
        }
    },
    {
        success: 'true',
        result: {
            task_id: '10000004',
            task_name: '[Android]发送请求到服务器端',
            task_desc: '客户端和服务器端都需要验证用户名、密码的有效性',
            task_person: 'andy.wang',
            task_status: 'notstarted',
            task_remaining: '2',
            task_estimate: '6',
            task_comments: 'no comments.',
            backlog_id: '10000',
            index: 100
        }
    },
    {
        success: 'true',
        result: {
            task_id: '10000002',
            task_name: '[Android]发送请求到服务器端',
            task_desc: '客户端和服务器端都需要验证用户名、密码的有效性',
            task_person: 'andy.wang',
            task_status: 'notstarted',
            task_remaining: '2',
            task_estimate: '6',
            task_comments: 'no comments.',
            backlog_id: '10000',
            index: 100
        }
    }
]);

bui.Mockup.set('/scrum_api/save_backlog', [{
        success: 'true',
        result: {
            backlog_id: '10001',
            backlog_name: 'Login/Logout',
            backlog_index: 2,
            sprint_id: '1000'
        }
    },
    {
        success: 'true',
        result: {
            backlog_id: '10002',
            backlog_name: 'Login/Logout',
            backlog_index: 2,
            sprint_id: '1000'
        }
    },
    {
        success: 'true',
        result: {
            backlog_id: '10003',
            backlog_name: 'Login/Logout',
            backlog_index: 2,
            sprint_id: '1000'
        }
    },
    {
        success: 'true',
        result: {
            backlog_id: '10004',
            backlog_name: 'Login/Logout',
            backlog_index: 2,
            sprint_id: '1000'
        }
    }
]);

bui.Mockup.set('/scrum_api/remove_task', {
    success: 'true',
    result: 'Task "001" remove success.'
});


});