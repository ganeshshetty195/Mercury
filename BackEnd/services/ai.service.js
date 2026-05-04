const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    temperature: 0.2,
  },
});

async function parseSearchQuery(userQuery) {
  const prompt = `
        You are an API that converts user search queries into structured JSON filters for a product database.

        STRICT RULES:
        - Return ONLY valid JSON.
        - Do NOT add explanation.
        - Do NOT wrap response in markdown (no \`\`\`json).
        - Do NOT add extra text.



        DATABASE SCHEMA CONTEXT:
        - category values allowed: "electronics", "clothing", "accessories"
        - product name contains actual item details (e.g., "Nike shoes", "iPhone 14")

        IMPORTANT LOGIC:
        - Ignore words like "cheap", "budget", "affordable" in search
        - If user mentions things like "shoes", "phone", "laptop":
          → DO NOT put it in category unless it matches allowed categories
          → Instead, put it in "search"
        - category must ONLY be from allowed list or null
        - Extract price conditions from the query:
          → "under 5000" → maxPrice = 5000
          → "below 5000" → maxPrice = 5000
          → "above 5000" → minPrice = 5000

        - Remove price-related words from search text

        - Example:
          Input: "HP under 5000"
          Output:
          {
            "category": null,
            "maxPrice": 5000,
            "minPrice": null,
            "search": "HP"
          }

        FIELDS:
        - category (string | null)
        - maxPrice (number | null)
        - minPrice (number | null)
        - search (string | null)

        EXAMPLES:

        Input: "cheap shoes under 2000"
        Output:
        {
          "category": null,
          "maxPrice": 2000,
          "minPrice": null,
          "search": "shoes"
        }

        Input: "electronics under 50000"
        Output:
        {
          "category": "electronics",
          "maxPrice": 50000,
          "minPrice": null,
          "search": null
        }

        Input: "iphone"
        Output:
        {
          "category": null,
          "maxPrice": null,
          "minPrice": null,
          "search": "iphone"
        }

        Now convert:

        "${userQuery}"
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 🧹 Clean markdown
    const cleanText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleanText);

    // 🛡️ Backend validation
    const validCategories = ["electronics", "clothing", "accessories"];

    if (parsed.category && !validCategories.includes(parsed.category)) {
      parsed.search = parsed.category;
      parsed.category = null;
    }

    return parsed;
  } catch (err) {
    console.error("AI Parsing Error:", err.message);

    // 🔥 fallback
    return {
      category: null,
      maxPrice: null,
      minPrice: null,
      search: userQuery,
    };
  }
}

module.exports = { parseSearchQuery };