'use strict';


var output = function(user) {
    if (!user)
        return null;

    user.uid = user._id.toString();
    
    delete user._id;
    delete user.password;
    return user;
};
exports.output = output;
