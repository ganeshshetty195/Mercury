const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/auth.middleware')
const {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/product.controller')

router.get('/', getAllProducts)           // public
router.get('/:id', getProductById)        // public
router.post('/', authMiddleware, createProduct)
router.put('/:id', authMiddleware, updateProduct)
router.delete('/:id', authMiddleware, deleteProduct)

module.exports = router