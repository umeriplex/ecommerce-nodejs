const cron = require('node-cron');
const { Category } = require('../models/category');
const { Product } = require('../models/product');
const { CartProduct } = require('../models/cart_product');
const { mongoose } = require('mongoose');


cron.schedule('0 0 * * *', async function() {
    try{
        
        const categoryToBeDeleted =  await Category.find({ markedForDeletion: true });

        for(const category of categoryToBeDeleted){
            const categoryProducCount = await Product.countDocuments({ category: category.id });

            if(categoryProducCount < 1) await category.deleteOne();
        }

        console.log('CRON job completed at', new Date());
        

    }catch (ex){
        console.log(`CRON job error: `, ex);
    }
});

cron.schedule('*/30 * * * *', async function() {
    const sessions = await mongoose.startSession();
    sessions.startTransaction();
    try{
        console.log(`Reservation release CRON JOB started at ${new Date()}`);

        const expiredReservations = await CartProduct.find({
            reserved: true,
            reservationExpiry: { $lte: new Date() }
        }).session(sessions);

        for (const cartProduct of expiredReservations){
            const product = await Product.findById(cartProduct.product).session(sessions);

            if(product){
                const updatedProduct = await Product.findByIdAndUpdate(
                    product._id,
                    { $inc: { countInStock: cartProduct.quantity } },
                    { new: true, runValidators: true },
                ).session(sessions);

                if(!updatedProduct){
                    console.log(`Error occurred: Product update failed. Potential concurrancy. Please warn your admin to stop touching buttons!`);
                    await sessions.abortTransaction();
                    return;
                }
            }

            await CartProduct.findByIdAndUpdate(
                cartProduct._id,
                { reserved: false },
                { sessions },
            );
        }
        await sessions.commitTransaction();
        console.log(`Reservation release CRON JOB completed at ${new Date()}`);
    }catch (ex){
        await sessions.abortTransaction();
        console.log(`CRON job error: `, ex);
    }finally {
        await sessions.endSession();
    }
});