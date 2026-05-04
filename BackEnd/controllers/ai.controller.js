const { parseSearchQuery } = require("../services/ai.service");
const pool = require("../database/pool");

const aiSearch = async (req, res, next) => {
  try {
    const { query } = req.body;

    // Step 1: Convert user text → filters
    const filters = await parseSearchQuery(query);
    console.log("filters_filters", filters);

    const conditions = [];
    const values = [];

    if (filters.category) {
      conditions.push(`category = $${values.length + 1}`);
      values.push(filters.category);
    }

    if (filters.maxPrice) {
      conditions.push(`price <= $${values.length + 1}`);
      values.push(filters.maxPrice);
    }

    if (filters.minPrice) {
      conditions.push(`price >= $${values.length + 1}`);
      values.push(filters.minPrice);
    }

    if (filters.search) {
      conditions.push(`name ILIKE $${values.length + 1}`);
      values.push(`%${filters.search}%`);
    }

    const whereClause =
      conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";

    const queryText = `SELECT * FROM products ${whereClause}`;

    const result = await pool.query(queryText, values);

    res.json({
      filters,
      data: result.rows,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { aiSearch };