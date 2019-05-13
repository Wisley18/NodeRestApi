//Framework web
const express = require('express');

const app = express();

const upload = require('express-fileupload');


//Logs
const morgan = require('morgan');

//Parse body json
const bodyParser = require('body-parser');

//RoutePrefix 
const productRoutes = require('./api/routes/products');
const ordersRoutes = require('./api/routes/orders');
const uploadVideo = require('./api/routes/upload');

app.use(upload())


app.use(morgan('dev'));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    if(req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json();
    }
    next();
});

app.use('/products', productRoutes);
app.use('/orders', ordersRoutes);
app.use('/upload', uploadVideo);

app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status = error.status || 500;
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;