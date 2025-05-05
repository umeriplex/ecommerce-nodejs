const bodyParser = require('body-parser');
const axios = require('axios');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
const AuthJwt = require('./middle_wares/jwt'); 
const errorHendler = require('./helpers/error_handler')
require('dotenv/config');
var multer = require('multer');

console.log("1");


const app = express();
const env =  process.env;
const API = env.VERSION;
const authorizedPostResquest = require('./middle_wares/authorization');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('tiny'));
app.use(cors());
app.use(AuthJwt.expJwt);
app.use(authorizedPostResquest);
app.use(errorHendler)


// Routes
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const adminRouter = require('./routes/admin');
const categoriesRouter = require('./routes/categories');
const productsRouter = require('./routes/product');
const checkoutRouter =  require('./routes/checkout');



app.post(`${API}/chat`, async (req, res) => {
    const question = req.body.question;
  
    try {
      const response = await axios.post('http://localhost:5005/webhooks/rest/webhook', {
        sender: 'user',
        message: question
      });
  
      const rasaResponse = response.data.map((item) => item.text).join('\n');
      res.json({ answer: rasaResponse });
    } catch (error) {
      res.status(500).send('Error communicating with Rasa server.');
    }});



app.use(`${API}/auth`, authRouter);
app.use(`${API}/users`, usersRouter);
app.use(`${API}/admin`, adminRouter);
app.use(`${API}/categories`, categoriesRouter);
app.use(`${API}/products`, productsRouter);
app.use(`${API}/checkout`, checkoutRouter);


app.use('/public', express.static(__dirname + '/public'));







const PORT = env.PORT;
const HOSTNAME = env.HOST;
const DATABASE = env.DATABASE_STRING;

require('./helpers/cron_job');

mongoose.connect(DATABASE).then(() => {
    console.log('DATA BASE CONNECTED!');
}).catch((ex) => {
    console.log(`DATA BASE CONNECTION ERROR ${ex}`);
});

app.listen(PORT, HOSTNAME, () => {
    console.log(`Server Started At http://${HOSTNAME}:${PORT} `)
});