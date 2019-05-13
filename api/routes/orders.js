const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    res.status(200).json({
        message: 'Handling GET requests to /orders'
    });
});

router.post('/', (req, res, next) => {
    const order = {
        productId: req.body.productId,
        quantity: req.body.quantity
    }
    res.status(201).json({
        message: 'Handling POST requests to /orders',
        order: order
    });
});

router.get('/:ordersId', (req, res, next) => {
    const id = req.params.ordersId;
    if(id === 'special'){
        res.status(200).json({
            message: 'This is a special id',
            id: id
        });
    } else {
        res.status(200).json({
            message: 'simple id'
        });
    }
});

module.exports = router;