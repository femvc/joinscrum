'use strict'; // utf-8编码
var productModel = require('../models/product').createNew();

// product_api
// app.get('/ue_api/internal/product_list',     account.auth, product.list);
// app.get('/ue_api/internal/product_detail',   account.auth, product.detail);
// app.get('/ue_api/internal/product_save',     account.auth, product.save);

var arr = [
    // 'product_id',
    // 'product_name',
    // 'product_desc',
    'product_index',
    'product_deleted',
    'user_id',
    'edit_time'];

exports.list = function (req, res, next) {
    // res.end('aaaaaaaaaa');
    var params = req.paramlist,
        current = params.current || 1,
        count = params.count || 1000,
        sort = {
            'update_time': -1,
            'create_time': -1
        },
        filter = {};

    for (var i=0,len=arr.length; i<len; i++) {
        if (params[arr[i]]) {
            filter[i] = params[arr[i]];
        }
    }
    if (params.product_name)
        filter.product_name = global.common.likeWith(params.product_name);
    if (params.product_desc)
        filter.product_desc = global.common.likeWith(params.product_desc);

    productModel.getItems(filter, sort, current, count, function (err, doc) {
        if (err) {
            response.err(req, res, 'INTERNAL_DB_OPT_FAIL');
        }

        response.ok(req, res, {
            items: doc
        });
    });
};

function get_product (req, res, filter, next) {
    if (!filter.product_id && !filter.product_name) {
        return response.err(req, res, 'MISSING_PARAMETERS', 'product_id');
    }
    productModel.getItem(filter, function (err, doc) {
        if (err) {
            response.err(req, res, 'INTERNAL_DB_OPT_FAIL');
        }
        // Output product_detail
        if (!next) {
            if (!doc) {
                response.err(req, res, 'USER_USERNAME_NOT_EXIST');
            }
            else {
                response.ok(req, res, doc);
            }
        }
        else {
            next(doc);
        }
        
    });
}

exports.detail = function (req, res, next) {
    var product = {};
    if (req.paramlist.product_id) {
        product.product_id = req.paramlist.product_id;
    }
    
    return get_product(req, res, product);
};

exports.save = function (req, res, next) {
    var product_id = req.paramlist.product_id,
        product = {},
        callback;

    if (!req.paramlist.product_name) {
        return response.err(req, res, 'MISSING_PARAMETERS', 'product_name');
    }

    product.product_name = req.paramlist.product_name;
    product.product_desc = req.paramlist.product_desc;
    for (var i=0,len=arr.length; i<len; i++) {
        if (req.paramlist[arr[i]]) {
            product[arr[i]] = req.paramlist[arr[i]];
        }
    }

    callback = function (err, doc) {
        if (err) {
            response.send(req, res, 'INTERNAL_DB_OPT_FAIL');
        }
        response.ok(req, res, doc);
    };

    var now = new Date();
    var date = global.common.formatDate(now, 'yyyy-MM-dd HH:mm:ss');
    // Update
    if (product_id) {
        product.update_time = date;
        product.product_id = product_id;
        productModel.update({
            product_id: product_id
        }, {
            $set: product
        }, {
            upsert: false,
            multi: false
        }, function (err, doc) {
            if (err) {
                callback(err, doc);
            }
            else {
                return get_product(req, res, {product_id: req.paramlist.product_id});
            }
        });
    }
    // Add
    else {
        get_product(req, res, {product_name: req.paramlist.product_name}, function (doc) {
            if (doc) {
                response.err(req, res, 'ALREADY_EXIST', 'product');
            }
            else {
                product.update_time = date;
                product.product_id = 'product' + global.common.formatDate(now, 'yyyyMMddHHmmss') + (String(Math.random()).replace('0.', '') + '0000000000000000').substr(0, 16);

                productModel.insert(product, callback);
            }
        });
    }

};