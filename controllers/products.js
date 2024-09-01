const { Product } = require('../models/product');
const mongoose = require('mongoose');


const ProductController = {
    
    getProducts : async function(req, res){
        try{
            let products;
            const page = req.query.page || 1;
            const pageSize = 10;

            if(req.query.criteria){
                let query = {};
                if(req.query.category){
                    query['category'] = req.query.category;
                }
                switch (req.query.criteria){
                    case 'newArrivals': {
                        const twoWeeksAgo = new Date();
                        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
                        query['dateAdded'] = { $gte: twoWeeksAgo };
                        break;
                    }

                    case 'popular': 
                        query['rating'] = { $gte: 4.5 };
                        break;
                    
                    default:
                        break;
                }

                products = await Product
                .find(query)
                .select('-images -reviews -sizes')
                .skip((page - 1) * pageSize)
                .limit(pageSize);
                
            }
            else if (req.query.category){
                 products = await Product
                 .find({ category: req.query.category })
                 .select('-images -reviews -sizes')
                 .skip((page - 1) * pageSize)
                 .limit(pageSize);
            }
            else{
                products = await Product
                 .find()
                 .select('-images -reviews -sizes')
                 .skip((page - 1) * pageSize)
                 .limit(pageSize);
            }

            if(!products){
                return res.status(404).json({ statusCode: 404, success: false, message: 'Products not found!'});
            }

            return res.status(200).json({ statusCode: 200, success: true, message: 'Success', data: products });

        }catch(ex){
            return res.status(500).json({ statusCode: 500, success: false, message: ex.message });
        }
    },


    getProductById : async function(req, res){
        try{
           
            if(!mongoose.isValidObjectId(req.params.id)){
                return res.status(404).json({ statusCode: 404, success: false, message: 'Invalid id!'});
            }

            const product = await Product.findById(req.params.id).select('-reviews');

            if(!product){
                return res.status(404).json({ statusCode: 404, success: false, message: 'Product not found!'});
            }

            return res.status(200).json({ statusCode: 200, success: true, message: 'Success', data: product });

        }catch(ex){
            return res.status(500).json({ statusCode: 500, success: false, message: ex.message });
        }
    },


    searchProduct : async function(req, res){
        try{
            let products;
            const page = req.query.page || 1;
            const pageSize = 10;

            const searchTerm = req.query.q;

            // Searching tips.
            // const simpleSearchText = { name : {$regex : searchTerm, $options: 'i'} };

            // const indexTextSearch = { 
            //     $text: {
            //         $search: searchTerm,
            //         $language: 'english',
            //         $caseSensitive: false
            //     },
            //  };

            let searchResults;
            let query = {};

            if(req.query.category){
                query = { category: req.query.category };

                if(req.query.genderAgeCategory){
                    query['genderAgeCategory'] = req.query.genderAgeCategory.toLowerCase();
                }
            }

            else if(req.query.genderAgeCategory){
                query = { genderAgeCategory: req.query.genderAgeCategory.toLowerCase() };
            }

            if(searchTerm){
                query = { ...query, $text: {
                    $search: searchTerm,
                    $language: 'english',
                    $caseSensitive: false,
                },
            };
            }
            searchResults = await Product.find(query).skip((page - 1) * pageSize).limit(pageSize);

            if(!searchResults){
                return res.status(404).json({ statusCode: 404, success: false, message: 'No search result.'});
            }

            return res.status(200).json({ statusCode: 200, success: true, message: 'Success', data: searchResults });

        }catch(ex){
            return res.status(500).json({ statusCode: 500, success: false, message: ex.message });
        }
    },

};


module.exports = ProductController;