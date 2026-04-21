const pool = require('../database/pool');

const addToCart = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({
        message: 'productId and quantity are required'
      });
    }

    const productCheck = await pool.query(
      'SELECT id, name, price, stock_count FROM products WHERE id = $1',
      [productId]
    );

    if (productCheck.rows.length === 0) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    const product = productCheck.rows[0];

    if (product.stock_count <= 0) {
      return res.status(400).json({
        message: 'Product is out of stock'
      });
    }

    const result = await pool.query(
      `
      INSERT INTO cart_items (user_id, product_id, quantity)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [userId, productId, quantity]
    );

    return res.status(201).json({
      message: 'Item added to cart',
      cart_item: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

const getCart = async (req, res, next) => {
  try {
    const {userId} = req.user;

    const result = await pool.query(
      `
      SELECT  
              ci.id AS cart_item_id, ci.user_id, ci.product_id, ci.quantity, ci.created_at, p.name,p.stock_count,
              p.price, p.category, p.instock, (ci.quantity * p.price) AS item_total
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id=$1
      ORDER BY ci.created_at DESC
      `,
      [userId]
    );

    const cartItems = result.rows;

    const total = cartItems.reduce((sum, item) => {
      return sum + Number(item.item_total);
    }, 0);

    return res.json({
      success: true,
      cart: cartItems,
      total
    });
  } catch (error) {
    next(error);
  }
};
const updateCart = async (req, res, next) => {
  try {
    const {userId} = req.user;
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined) {
      return res.status(400).json({
        message: 'productId and quantity are required'
      });
    }

    if (quantity < 0) {
      return res.status(400).json({
        message: 'quantity cannot be negative'
      });
    }

    console.log(quantity === 0)
    if (quantity === 0) {
      const deleteResult = await pool.query(
        'DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2 RETURNING *',
        [userId, productId]
      );


      if (deleteResult.rows.length === 0) {
        return res.status(404).json({
          message: 'Item not found in cart'
        });
      }

      return res.json({
        message: 'Item removed from cart',
        removed_item: deleteResult.rows[0]
      });
    }

    const result = await pool.query(
      `
      UPDATE cart_items
      SET quantity = $1, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $2 AND product_id = $3
      RETURNING *
      `,
      [quantity, userId, productId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Item not found in cart'
      });
    }

    return res.json({
      message: 'Cart updated successfully',
      cart_item: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};
const removeFromCart = async (req, res, next) => {
  try {
        const {userId} = req.user;
    const { productId } = req.body;

    // 1. Validation
    if (!productId) {
      return res.status(400).json({
        message: 'productId is required'
      });
    }

    // 2. Delete item
    const result = await pool.query(
      `
      DELETE FROM cart_items
      WHERE user_id = $1 AND product_id = $2
      RETURNING *
      `,
      [userId, productId]
    );

    // 3. If item not found
    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Item not found in cart'
      });
    }

    // 4. Success response
    return res.json({
      message: 'Item removed from cart',
      removed_item: result.rows[0]
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  addToCart,getCart,updateCart,removeFromCart
};