const { CartProduct } = require('../../models/cart_product');
const { Category } = require('../../models/category');
const { Order } = require('../../models/order');
const { Product } = require('../../models/product');
const { Review } = require('../../models/review');
const { User } = require('../../models/user');
const { Token } = require('../../models/token');
const mediaHelper = require('../../helpers/media_helper')
const util = require('util');
const path = require('path');
const { OrderItem } = require('../../models/order_items');
const multer = require('multer');
const { default: mongoose } = require('mongoose');

const ProductsController = {
    getProductsCount: async function(req, res){
        try{

            const productCounts = await Product.countDocuments();
            
            if(!productCounts){
                return res.status(500).json({ statusCode: 500, success: false, message: 'Could not count products.' });
            }

            return res.status(200).json({ statusCode: 200, success: true, message: 'Success.', data: { productCounts } });

        }catch(ex){
            return res.status(500).json({ statusCode: 500, success: false, message: ex.message });
        }
    },


    addProduct: async function(req, res){
        try{

            const uploadImage = util.promisify(
                mediaHelper.upload.fields([ 
                    { name: 'image', maxCount: 1 },
                    { name: 'images', maxCount: 10 },
                  ])
            );

            try{
                await uploadImage(req, res);
            }catch (ex){
                return res.status(500).json({ statusCode: 500, success: false, message: `${ex.message}\n${ex.fields}\n${ex.storageErrors}` });
            }

            const category = await Category.findById(req.body.category);

            if(!category){
                return res.status(404).json({ statusCode: 404, success: false, message: 'Invalid category.' });
            }

            if(category.markedForDeletion){
                return res.status(404).json({ statusCode: 404, success: false, message: 'Category marked for deletion. You cannot add products to this category.' });
            }

            const image = req.files['image'][0];
            if(!image){
                return res.status(404).json({ statusCode: 404, success: false, message: 'No file found.' });
            }

            req.body['image'] = `${req.protocol}://${req.get('host')}/${image.path}`;

            const gallery =  req.files['images']
            const imagePaths = [];
            if(gallery){
                for(const eachImage of gallery){
                    const eachImagePath = `${req.protocol}://${req.get('host')}/${image.path}`;
                    imagePaths.push(eachImagePath);
                }
            }

            if(imagePaths.length > 0){
                req.body['images'] = imagePaths;
            }

            const product = await Product(req.body).save();
            if(!product){
                return res.status(500).json({ statusCode: 500, success: false, message: 'Product could not be created.' });
            }


            return res.status(200).json({ statusCode: 200, success: true, message: 'Product created success.', data: product });

        }catch(ex){
            return res.status(500).json({ statusCode: 500, success: false, message: ex.message });
        }
    },

    editProduct: async function(req, res){
        try{

            if(!mongoose.isValidObjectId(req.params.id) || !(await Product.findById(req.params.id))){
                return res.status(404).json({ statusCode: 404, success: false, message: 'Invalid product id.' });
            }

            if(req.body.category){
                const category = await Category.findById(req.params.id);
                if(!category){
                    return res.status(404).json({ statusCode: 404, success: false, message: 'Invalid category.' });
                }
                if(category.markedForDeletion){
                    return res.status(404).json({ statusCode: 404, success: false, message: 'Category marked for deletion. You cannot add products to this category.' });
                }

               let product = await Product.findById(req.params.id);
               
               if(req.body.images){
                const limit = 10 - product.images.length;
                const galleryUpload = util.promisify(
                mediaHelper.upload.fields([ { name: 'images', maxCount: limit } ])
               );

               try{
                    await galleryUpload(req, res);
                }catch (ex){
                    return res.status(500).json({ statusCode: 500, success: false, message: `${ex.message}\n${ex.fields}\n${ex.storageErrors}` });
                }
               }

               const imageFiles = req.files['images'];
               const galleryUpdate = imageFiles && imageFiles.length > 0;

               if(galleryUpdate){
               const imagePaths = [];
                for(const eachImage of imageFiles){
                    const eachImagePath = `${req.protocol}://${req.get('host')}/${image.path}`;
                    imagePaths.push(eachImagePath);
                }
               req.body['images'] = [...product, ...imagePaths];
               }
            }

            if(req.body.image){
                const uploadImage = util.promisify(
                    mediaHelper.upload.fields([ { name: 'image', maxCount: 1 } ])
                );

                try{
                    await uploadImage(req, res);
                }catch (ex){
                    return res.status(500).json({ statusCode: 500, success: false, message: `${ex.message}\n${ex.fields}\n${ex.storageErrors}` });
                }


                const image = req.files['image'][0];
                if(!image){
                    return res.status(404).json({ statusCode: 404, success: false, message: 'No file found.' });
                }

                req.body['image'] = `${req.protocol}://${req.get('host')}/${image.path}`;
            }

            const updatedProduct = await Product.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true }
            );

            if(!updatedProduct){
                return res.status(404).json({ statusCode: 404, success: false, message: 'The product you are trying to delete is not found in the database' });
            }

            return res.status(200).json({ statusCode: 200, success: true, message: 'Product updated success.', data: updatedProduct });

        }catch(ex){
            return res.status(500).json({ statusCode: 500, success: false, message: ex.message });
        }
    },

    deleteProductImages: async function(req, res){
        try{

            const productId = req.params.id;
            const { deletedImagesUrls } = req.body;

            if(!mongoose.isValidObjectId(productId) || !Array.isArray(deletedImagesUrls)){
                return res.status(400).json({ statusCode: 400, success: false, message: 'Invalid reques data.' });
            }

            await mediaHelper.deleteImages(deletedImagesUrls);
            const product = await Product.findById(productId);

            if(!product){
                return res.status(404).json({ statusCode: 404, success: false, message: 'Product not found.' });
            }

            product.images = product.images.filter((image) => !deletedImagesUrls.includes(image));

            await product.save();


            return res.status(200).json({ statusCode: 200, success: true, message: 'Product images deleted.'});

        }catch(ex){
            if(ex.code == 'ENOENT'){
                return res.status(504).json({ statusCode: 504, success: false, message: 'The image you\'re trying to delete does not found.' });
            }
            return res.status(500).json({ statusCode: 500, success: false, message: ex.message });
        }
    },

    deleteProduct: async function(req, res){
        try{

            const productId = req.params.id;
            
            if(!mongoose.isValidObjectId(productId)){
                return res.status(400).json({ statusCode: 400, success: false, message: 'Invalid reques data.' });
            }

            const product = await Product.findById(productId);


            if(!product){
                return res.status(404).json({ statusCode: 404, success: false, message: 'Product not found.' });
            }

            await mediaHelper.deleteImages([...product.images, product.image], 'ENOENT');

            await Review.deleteMany({ _id: {$in: product.reviews} });

            await Product.findByIdAndDelete(productId);

            return res.status(200).json({ statusCode: 200, success: true, message: 'Product deleted.'});

        }catch(ex){
            return res.status(500).json({ statusCode: 500, success: false, message: ex.message });
        }
    },

    getProducts: async function(req, res){
        try{

            const page = req.query.page || 1;
            const pageSize = 10;

            const product = await Product
            .find()
            .select('-reviews -rating')
            .skip((page - 1) * pageSize)
            .limit(pageSize);


            if(!product){
                return res.status(404).json({ statusCode: 404, success: false, message: 'Product not found.' });
            }

            return res.status(200).json({ statusCode: 200, success: true, message: 'Success', data: product});

        }catch(ex){
            return res.status(500).json({ statusCode: 500, success: false, message: ex.message });
        }
    },
};

module.exports = ProductsController;