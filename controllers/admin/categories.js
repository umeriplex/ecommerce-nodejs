const { CartProduct } = require('../../models/cart_product');
const { Category } = require('../../models/category');
const { Order } = require('../../models/order');
const { Product } = require('../../models/product');
const { Review } = require('../../models/review');
const { User } = require('../../models/user');
const { Token } = require('../../models/token');
const mediaHelper = require('../../helpers/media_helper')
const util = require('util');

const CategoriesController = {
    addCategory: async function(req, res){
        try{
            const uploadImage = util.promisify(
                mediaHelper.upload.fields([ { name: 'image', maxCount: 1 } ])
            );

            try{
                await uploadImage(req, res);
            }catch (ex){
                return res.status(500).json({ statusCode: 500, success: false, message: `${ex.message} -- ${ex.fields} -- ${ex.storageErrors}` });
            }


            const image = req.files['image'][0];
            if(!image){
                return res.status(404).json({ statusCode: 404, success: false, message: 'No file found.' });
            }

            req.body['image'] = `${req.protocol}://${req.get('host')}/${image.path}`;

            let category = new Category(req.body);

            
            const existItem = await Category.findOne({ 
                name: { 
                    $regex: new RegExp(`^${category.name}$`, 'i') 
                } 
            });

            if(existItem){
                return res.status(400).json({ statusCode: 400, success: false, message: `${existItem.name} is already exist.` });
            }
            
            
            category = await category.save();

            if(!category){
                return res.status(500).json({ statusCode: 500, success: false, message: 'Category cannot be created.' });
            }

            return res.status(200).json({ statusCode: 200, success: true, message: 'Category created success.', data: category });

        }catch(ex){
            return res.status(500).json({ statusCode: 500, success: false, message: ex.message });
        }
    },


    editCategory: async function(req, res){
        try{

            const { name, icon, colour } = req.body;            

            const category = await Category.findByIdAndUpdate(
                req.params.id,
                { name, icon, colour },
                { new: true }
            );

            if(!category){
                return res.status(404).json({ statusCode: 404, success: false, message: 'Category not found.' });
            }

            return res.status(200).json({ statusCode: 200, success: true, message: 'Category updated.' });

        }catch(ex){
            return res.status(500).json({ statusCode: 500, success: false, message: ex.message });
        }
    },

    deleteCategory: async function(req, res){
        try{

            const category = await Category.findById(req.params.id);

            if(!category){
                return res.status(404).json({ statusCode: 404, success: false, message: 'Category not found.' });
            }

            category.markedForDeletion = true;

            await category.save();

            return res.status(200).json({ statusCode: 200, success: true, message: 'Category deleted.' });

        }catch(ex){
            return res.status(500).json({ statusCode: 500, success: false, message: ex.message });
        }
    },

    getCategories: async function(req, res){
        try{

            const categoryies = await Category.find();

            if(!categoryies){
                return res.status(404).json({ statusCode: 404, success: false, message: 'Categories not found.' });
            }

            return res.status(200).json({ statusCode: 200, success: true, message: 'Success', data: categoryies });

        }catch(ex){
            return res.status(500).json({ statusCode: 500, success: false, message: ex.message });
        }
    },


};

module.exports = CategoriesController;