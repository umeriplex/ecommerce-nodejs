const { Category } = require('../models/category');
const mongoose = require('mongoose');


const CategoryController = {
    
    grtCategories : async function(req, res){
        try{
            const categories = await Category.find();

            if(!categories){
                return res.status(404).json({ statusCode: 404, success: false, message: 'Categories not found!'});
            }

            return res.status(200).json({ statusCode: 200, success: true, message: 'Success', data: categories });

        }catch(ex){
            return res.status(500).json({ statusCode: 500, success: false, message: ex.message });
        }
    },


    grtCategoriesById : async function(req, res){
        try{

            if(!mongoose.isValidObjectId(req.params.id)){
                return res.status(404).json({ statusCode: 404, success: false, message: 'Invalid id!'});
            }

            const category = await Category.findById(req.params.id)
            ;

            if(!category){
                return res.status(404).json({ statusCode: 404, success: false, message: 'Category not found!'});
            }

            return res.status(200).json({ statusCode: 200, success: true, message: 'Success', data: category });

        }catch(ex){
            return res.status(500).json({ statusCode: 500, success: false, message: ex.message });
        }
    },

};


module.exports = CategoryController;