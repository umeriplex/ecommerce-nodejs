const { unlink } = require('fs/promises');
const { Promise } = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ALLOWED_ECTENSIONS = {
    'image/png' : 'png',
    'image/jpeg' : 'jpeg',
    'image/jpg' : 'jpg',

};

const storage = multer.diskStorage({ 
    destination: function (_, _, cb) {
        const dir = 'public/uploads';
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function(_, file, cb){
        const fileName = file.originalname
        .replace(' ', '-')
        .replace('.png', '')
        .replace('.jpg','')
        .replace('.jpeg','');

        const extension = ALLOWED_ECTENSIONS[file.mimetype];

        cb(null, `${fileName}-${Date.now()}.${extension}`)
    },
 });

exports.upload = multer({ 
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 },
    fileFilter: (_, file, cb) => {
        const isValid = ALLOWED_ECTENSIONS[file.mimetype];

        let uploadError = new Error(`Bhai yeh type\n${file.mimetype} is not allowed. Ajeeb!`);

        if(!isValid) return cb(uploadError);

        return cb(null, true);
    },
 },
);

exports.deleteImages = async function(imageUrls, continueOnErrorName) {
    await Promise.all(
        imageUrls.map(async (eachUrl) => {
            const imagePath = path.resolve(
                __dirname,
                '..',
                'public',
                'uploads',
                path.basename(eachUrl),
            );

            try{
                await unlink(imagePath);
            }catch(ex){
                if(ex.code == continueOnErrorName){
                    console.error(`Continuing with the next image ${ex.message}`);
                }else{
                    console.error(`Error deleting image ${ex.message}`);
                    throw ex;
                }
            }
        }),
    );
}