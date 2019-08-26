const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");
const Product = require("../models/product");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.create = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: "Image could not be uploaded"
            });
        }
        const {name, description, price, category, quantity, shipping} = fields;

        if(!name || !description || !price || !category || !quantity || !shipping){
            return res.status(400).json({
                error: "all the fields must be added"
            })
        }

        let product = new Product(fields);

        if (files.photo) {
            // console.log(files.photo);
            if(files.photo.size > 5000000){
                return res.status(400).json({
                    error: 'Image should be less than 5 MBs'
                })
            }
            product.photo.data = fs.readFileSync(files.photo.path);
            product.photo.contentType = files.photo.type;
        }

        product.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(result);
        });
    });
};

exports.productById = (req, res, next, id) => {
    Product.findById(id).exec((error, product) => {
        if(error || !product){
            return res.status(400).json({
                  error: "Product not found"  
            })
        }
        req.product = product;
        next();
    })
}


exports.read = (req, res) => {
    req.product.photo = undefined;
    return res.json(req.product);
}

exports.remove = (req, res) => {
    let product = req.product;
    product.remove((error, productDeleted) => {
        if(error){
            return res.status(400).json({
                error: "Product not found"
        })
    }
    
        res.json({
            productDeleted,
            message: "Product has been deleted"
        })
    })


}

exports.update = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: "Image could not be uploaded"
            });
        }
        const {name, description, price, category, quantity, shipping} = fields;

        if(!name || !description || !price || !category || !quantity || !shipping){
            return res.status(400).json({
                error: "all the fields must be added"
            })
        }

        let product = req.product;
        product = _.extend(product, fields)

        if (files.photo) {
            // console.log(files.photo);
            if(files.photo.size > 5000000){
                return res.status(400).json({
                    error: 'Image should be less than 5 MBs'
                })
            }
            product.photo.data = fs.readFileSync(files.photo.path);
            product.photo.contentType = files.photo.type;
        }

        product.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(result);
        });
    });

}

exports.list = (req, res) => {
  let order = req.query.order ? req.query.order : 'asc'
  let sortBy = req.query.sortBy ? req.query.sortBy : '_id'
  let limit = req.query.limit ? req.query.limit : 6

  Product.find()
        .select("-photo")
        .populate('category')
        .sort([[sortBy, order]])
        .limit(limit)
        .exec((err, products) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            return res.send(products)
        })

}
