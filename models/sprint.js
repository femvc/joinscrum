'use strict'; // utf-8编码
module.exports = {
    createNew: function () {
        var dataModel = require('./base').createNew('sprint');
        return dataModel;
    }
};