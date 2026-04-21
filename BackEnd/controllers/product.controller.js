const pool = require('../database/pool');
const redisCache=require('../database/redis');

// ─── GET /products ────────────────────────────────────────
const getAllProducts = async (req, res, next) => {
    try {
        const { category, inStock, sort, page = 1, limit, search } = req.query

        const conditions = []
        const values = []

        if (category) {
            conditions.push(`category = $${values.length + 1}`)
            values.push(category)
        }

        if (inStock !== undefined) {
            conditions.push(`instock = $${values.length + 1}`)
            values.push(inStock === "true")
        }

        if (search) {
            conditions.push(`name ILIKE $${values.length + 1}`)
            values.push(`%${search}%`)
        }

        const whereClause = conditions.length > 0
            ? 'WHERE ' + conditions.join(' AND ')
            : ''

        let orderBy = ''
        if (sort === "price_asc") orderBy = 'ORDER BY price ASC'
        else if (sort === "price_desc") orderBy = 'ORDER BY price DESC'

        let paginationClause = ''
        if (limit) {
            const offset = (Number(page) - 1) * Number(limit)
            paginationClause = `LIMIT ${Number(limit)} OFFSET ${offset}`
        }

        const query = `SELECT * FROM products ${whereClause} ${orderBy} ${paginationClause}`;
        const result = await pool.query(query, values)

        const countQuery = `SELECT COUNT(*) FROM products ${whereClause}`
        const countResult = await pool.query(countQuery, values)
        const total = parseInt(countResult.rows[0].count)

        res.status(200).json({ total, page: Number(page), data: result.rows })
    } catch (error) {
        next(error)
    }
}

// ─── GET /products/:id ────────────────────────────────────
const getProductById = async (req, res, next) => {
    const { id } = req.params;
    const cacheKey = `product:${id}`;

    try {
        // Step 1: Check Redis cache
        const cached = await redisCache.get(cacheKey);

        if (cached) {
            console.log(`✅ Cache HIT for product ${id}`);
            return res.json(JSON.parse(cached));
        };
        
        console.log(`❌ Cache MISS for product ${id} — querying DB`);

        const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
       
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Product not found" })
        };

        const product = result.rows[0];
         // Store in Redis (1 hour TTL)
        await redisCache.setEx(
            cacheKey,
            60,  // 1 min
            JSON.stringify(product)
        );

        console.log(`💾 Cached product ${id} for 1 hour`);

        res.status(200).json(product)
    } catch (error) {
        next(error)
    }
}

// ─── POST /products ───────────────────────────────────────
const createProduct = async (req, res, next) => {
    try {
        const { name, price, category, inStock } = req.body

        if (!name || !price || !category) {
            return res.status(400).json({ error: "name, price, category are required" })
        }

        const result = await pool.query(
            'INSERT INTO products (name, price, category, instock) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, Number(price), category, inStock ?? false]
        )

        res.status(201).json(result.rows[0])
    } catch (error) {
        next(error)
    }
}

// ─── PUT /products/:id ────────────────────────────────────
const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params
        const { name, price, category, inStock } = req.body

        const result = await pool.query(
            'UPDATE products SET name = $1, price = $2, category = $3, instock = $4 WHERE id = $5 RETURNING *',
            [name, Number(price), category, inStock, id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Product not found" })
        }

        res.status(200).json(result.rows[0])
    } catch (error) {
        next(error)
    }
}

// ─── DELETE /products/:id ─────────────────────────────────
const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params

        const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id])

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Product not found" })
        }

        res.status(200).json(result.rows[0])
    } catch (error) {
        next(error)
    }
}

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct }