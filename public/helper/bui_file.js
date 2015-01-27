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
 * @name HTML5文件上传
 * @public
 * @author wanghaiyang
 * @date 2013/08/08
 */
define('./bui.File', ['./bui'], function(){

bui.File = {
    uploadFile: function(args){
        var action = args.action;
        // elem
        function uploadComplete(result) {
            bui.File.uploadComplete();
            
            var data = (new Function('return '+result.target.responseText))();
            args.onfinish&&args.onfinish(data);
        }
        
        var fd = new FormData();
        if (args.data) {
            for (var i in args.data) {
                if (!i) continue;
                fd.append(i, args.data[i]);
            }
        }
        
        var xhr = new XMLHttpRequest();  
        xhr.upload.addEventListener('progress', bui.File.uploadProgress, false);  
        xhr.addEventListener('load', uploadComplete, false);  
        xhr.addEventListener('error', bui.File.uploadFailed, false);  
        xhr.addEventListener('abort', bui.File.uploadCanceled, false);  
        xhr.open('POST', action );  
        xhr.send(fd);  
        //uploadComplete({target:{responseText:'{result:"http://www.jiepang.com/767676676767"}'}});
    }, 
    uploadProgress: function (evt) {  
        /*if (evt.lengthComputable) {  
            var percentComplete = Math.round(evt.loaded * 100 / evt.total);  
            document.getElementById('progressNumber').innerHTML = percentComplete.toString() + '%';  
        }  
        else {  
            document.getElementById('progressNumber').innerHTML = 'unable to compute';  
        }*/
        if (evt.lengthComputable) {
            var percentComplete = Math.round(evt.loaded * 100 / evt.total);  
            var text = percentComplete.toString() + '%'+' uploaded.';
            if (bui.Pnotify) {
                bui.Pnotify.show(text, 'always', 'top: 60px;');
            }
            else {
                document.oldTitle = document.oldTitle ? document.oldTitle : document.title;
                document.title = text;
            }
        }
    },
    /**
     * @name 上传结束时调用(随后会自动调用FileInput.onfinish())
     * @private
     */
    uploadComplete: function (evt) {  
        /* This event is raised when the server send back a response */  
        //alert(evt.target.responseText);
        var text = 'Uploaded success.';
        if (bui.Pnotify) {
            bui.Pnotify.show(text, 'default', 'top: 20px;');
        }
        else {
            document.title = text;
            window.setTimeout('document.title = document.oldTitle', 500);
        }
    },
    uploadFailed: function (evt) {  
        alert('There was an error attempting to upload the file.');  
    },  

    uploadCanceled: function (evt) {  
        alert('The upload has been canceled by the user or the browser dropped the connection.');  
    }
};

});

/*
<script type="text/javascript">
var haiyang = {
    action: '/media/upload?media_type=JPG',
    data: {},
    onfinish: function (result) {
        alert('ok');
    }
};
function doit(){ 
    //todo
    var file = g('media');
    haiyang.data = {
        thumbnail: file.files[0],
        media: file.files[0]
    };
    bui.File.uploadFile(haiyang);
}

//-->
</script>

media: <input type="file" id="media" name="media"> <br/>
<button type="button" onclick="doit()">doit</button>

*/
