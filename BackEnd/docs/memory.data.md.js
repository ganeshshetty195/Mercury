const express = require("express")
const app = express();


// top of index.js
const pool = require("./database/index")

// ─── Middleware ───────────────────────────────────────────
app.use(express.json())


// ─── Data ─────────────────────────────────────────────────
let products = [
    { id: 1, name: "iPhone 15", price: 999, category: "electronics", inStock: true },
    { id: 2, name: "Nike Air", price: 120, category: "shoes", inStock: true },
    { id: 3, name: "MacBook Pro", price: 1299, category: "electronics", inStock: false },
    { id: 4, name: "Levi's 501", price: 80, category: "clothing", inStock: true },
    { id: 5, name: "Samsung S24", price: 899, category: "electronics", inStock: true },
    { id: 6, name: "Adidas Ultra", price: 150, category: "shoes", inStock: false },
    { id: 7, name: "iPad Air", price: 749, category: "electronics", inStock: true },
    { id: 8, name: "H&M Jacket", price: 60, category: "clothing", inStock: true },
    { id: 9, name: "Sony Headphones", price: 299, category: "electronics", inStock: false },
    { id: 10, name: "Puma Sneakers", price: 95, category: "shoes", inStock: true },
    { id: 11, name: "Zara Shirt", price: 45, category: "clothing", inStock: true },
    { id: 12, name: "Dell XPS 15", price: 1199, category: "electronics", inStock: true },
    { id: 13, name: "Reebok Classic", price: 85, category: "shoes", inStock: false },
    { id: 14, name: "Uniqlo Hoodie", price: 55, category: "clothing", inStock: true },
    { id: 15, name: "AirPods Pro", price: 249, category: "electronics", inStock: true },
]

let nextId = 16

// ─── Helper ───────────────────────────────────────────────
const findProduct = (id) => products.find(p => p.id === Number(id))

// ─── Routes ───────────────────────────────────────────────

// GET /products
// ?category=electronics
// ?inStock=true
// ?sort=price_asc | price_desc
// ?page=1&limit=5
app.get("/products", (req, res) => {
    const { category, inStock, sort, page = 1, limit, search } = req.query

    // ✅ copy — never mutate original
    let result = [...products]

    // filter by category
    if (category) {
        result = result.filter(p => p.category === category)
    }

    // filter by inStock
    if (inStock !== undefined) {
        const stockBool = inStock === "true"
        result = result.filter(p => p.inStock === stockBool)
    }

    // sort
    if (sort === "price_asc") {
        result = result.sort((a, b) => a.price - b.price)
    }
    if (sort === "price_desc") {
        result = result.sort((a, b) => b.price - a.price)
    }

    // GET /products?search=iphone
    if (search) {
        result = result.filter(p =>
            p.name.toLowerCase().includes(search.toLowerCase())
        )
    }

    // pagination
    if (limit) {
        const startIndex = (Number(page) - 1) * Number(limit)
        const endIndex = startIndex + Number(limit)
        result = result.slice(startIndex, endIndex)
    }

    res.status(200).json({
        total: result.length,
        page: Number(page),
        data: result
    })
})


// GET /products/:id
app.get("/products/:id", async(req, res) => {
    try {
        const {id} = req.params.id;
        const product = findProduct(id);
        
        if (!product) {
            return res.status(404).json({ error: "Product not found" })
        }
        res.status(200).json(product)
    } catch (error) {
           next(err) // pass to global handler ✅ , One handle for all
    }
})

// POST /products
app.post("/products", (req, res) => {
    const { name, price, category, inStock } = req.body

    // validation
    if (!name || !price || !category) {
        return res.status(400).json({ error: "name, price, category are required" })
    }

    const product = {
        id: nextId++,
        name,
        price: Number(price),
        category,
        inStock: inStock ?? false
    }

    products.push(product)
    res.status(201).json(product)
})

// PUT /products/:id
app.put("/products/:id", (req, res) => {
    const index = products.findIndex(p => p.id === Number(req.params.id))

    if (index === -1) {
        return res.status(404).json({ error: "Product not found" })
    }

    // merge existing + new data
    products[index] = { ...products[index], ...req.body }

    res.status(200).json(products[index])
})

// DELETE /products/:id
app.delete("/products/:id", (req, res) => {
    const product = findProduct(req.params.id)

    if (!product) {
        return res.status(404).json({ error: "Product not found" })
    }

    products = products.filter(p => p.id !== Number(req.params.id))

    res.status(200).json(product)
})

// only reached if nothing matched ✅
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
    next()
});

// Global handler catches it
app.use((err, req, res, next) => {
    console.error(err.message)
    res.status(500).json({ error: "Internal server error" })
})

// ─── Start ────────────────────────────────────────────────
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000")
})