const pool = require('../database/pool');
const { broadcastStockUpdate } = require('../services/stockStream.js');
const { publisher } = require('../database/redisPubSub');

const checkout = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const {userId} = req.user;

    const { paymentMethod } = req.body;

    // 1. Validation
    if (!paymentMethod) {
      return res.status(400).json({
        message: 'paymentMethod is required'
      });
    }

    await client.query('BEGIN');

     // 1. check cart items / products / stock
    // 2. create order
    // 3. create order_items
    // 4. reduce stock_count in products
    // 5. commit transaction


    // 2. Get cart items with product details
    const cartResult = await client.query(
      `
      SELECT 
        ci.product_id,
        ci.quantity,
        p.name,
        p.price
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = $1
      `,
      [userId]
    );

    const cartItems = cartResult.rows;
    

    if (cartItems.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        message: 'Cart is empty'
      });
    }

    // 3. Calculate total
    const totalAmount = cartItems.reduce((sum, item) => {
      return sum + Number(item.price) * Number(item.quantity);
    }, 0);

    // 4. Create order
    const orderResult = await client.query(
      `
      INSERT INTO orders (user_id, total_amount, payment_method, status)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [userId, totalAmount, paymentMethod, 'placed']
    );

    const order = orderResult.rows[0];


    // 5. Insert order items +  + reduce stock
    const stockUpdates = [];
    for (const item of cartItems) {
      await client.query(
        `
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES ($1, $2, $3, $4)
        `,
        [order.id, item.product_id, item.quantity, item.price]
      );
    
     const updatedProduct = await client.query(
        `
        UPDATE products
        SET stock_count = stock_count - $1
        WHERE id = $2 AND stock_count >= $1
        RETURNING id, stock_count
        `,
        [item.quantity, item.product_id]
      );

       if (updatedProduct.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          message: `Not enough stock for product ${item.name}`,
        });
      }

       stockUpdates.push({
        productId: updatedProduct.rows[0].id,
        stockCount: updatedProduct.rows[0].stock_count,
      });
    }


    // 6. Clear cart
    await client.query(
      'DELETE FROM cart_items WHERE user_id = $1',
      [userId]
    );

    await client.query('COMMIT');

    // 7) Broadcast after commit without Redis
    
    // for (const update of stockUpdates) {
    //   broadcastStockUpdate(update);
    // };


    // 7 Publish stock update after commit
   for (const update of stockUpdates) {
    await publisher.publish(
      'stock-updates',
      JSON.stringify({
        type: 'stock_update',
        productId: update.productId,
        stockCount: update.stockCount,
        instock: update.stockCount > 0,
        changedBy: 'order',
        timestamp: new Date().toISOString(),
      })
    );
}


    return res.status(201).json({
      message: 'Order placed successfully',
      order: {
        id: order.id,
        total_amount: order.total_amount,
        payment_method: order.payment_method,
        status: order.status
      },
      items: cartItems
    });

  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

const getOrders = async (req, res, next) => {
  try {
    const {userId} = req.user;

    const result = await pool.query(
      `
      SELECT 
        id,
        total_amount,
        payment_method,
        status,
        created_at
      FROM orders
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [userId]
    );

    return res.json({
      message: 'Orders fetched successfully',
      orders: result.rows
    });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const {userId} = req.user;
    const orderId = req.params.id;

    // 1. Get order (with auth check)
    const orderResult = await pool.query(
      `
      SELECT 
        id,
        user_id,
        total_amount,
        payment_method,
        status,
        created_at
      FROM orders
      WHERE id = $1 AND user_id = $2
      `,
      [orderId, userId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }

    const order = orderResult.rows[0];

    // 2. Get order items
    const itemsResult = await pool.query(
      `
      SELECT 
        oi.product_id,
        oi.quantity,
        oi.price,
        p.name,
        (oi.quantity * oi.price) AS item_total
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
      `,
      [orderId]
    );

    // 3. Send response
    return res.json({
      message: 'Order fetched successfully',
      order,
      items: itemsResult.rows
    });

  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    // 1. Validate status
    const validStatuses = ['placed', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status value'
      });
    }

    // 2. Update status
    const result = await pool.query(
      `
      UPDATE orders
      SET status = $1
      WHERE id = $2
      RETURNING *
      `,
      [status, orderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }

    return res.json({
      message: 'Order status updated successfully',
      order: result.rows[0]
    });

  } catch (error) {
    next(error);
  }
};


module.exports = {
  checkout,getOrders,getOrderById,updateOrderStatus
};