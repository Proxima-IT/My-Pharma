# Product Search API Documentation

The **Product Search API** (`GET /api/products/search/`) enables frontend developers to implement unified, smart search experiences across the product catalog. The API supports relevance ranking, fuzzy spelling correction, catalog-wide filters, and a dedicated, lightweight autocomplete mode.

---

## 1. Overview & Base Endpoint

- **Endpoint**: `GET /api/products/search/`
- **Access Control**: Public (Accessible to guest users, authenticated standard users, and administrators)
- **Headers**:
  - `Content-Type`: `application/json`
  - `Authorization`: `Bearer <access_token>` *(optional; only needed if accessing user-specific cart or profile details)*

---

## 2. Request Query Parameters

All query parameters are optional but combinations of search queries and filters are highly encouraged.

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `q` or `query` | `string` | — | The search term. Matches against product name, brand name, and generic name (ingredient name). |
| `autocomplete` | `boolean` | `false` | When `true`, returns a lightweight list of suggestions optimized for drop-downs in under 50ms. |
| `category` | `string` | — | Filter search results by Category ID, slug, or name (e.g., `1`, `medicines`, or `Medicines`). |
| `brand_id` | `integer` | — | Filter search results by Brand ID. |
| `ingredient_id` | `integer` | — | Filter search results by Active Ingredient ID (e.g., generic ingredient matching). |
| `min_price` | `number` | — | Filter results by minimum final price (inclusive). |
| `max_price` | `number` | — | Filter results by maximum final price (inclusive). |
| `available` | `boolean` | — | Stock availability. `true` for items in stock (`quantity_in_stock > 0`), `false` for out of stock. |
| `discounted` | `boolean` | — | Filter by discount status. `true` for products with a crossed-out original price (`original_price > price`). |
| `requires_prescription` | `boolean` | — | Filter by prescription status. `true` to list prescription-only medicines. |
| `ordering` | `string` | — | Sort order for results: `price`, `-price` (high to low), `name`, `-name`, `created_at`, `-created_at`. If omitted, defaults to `-search_rank` relevance ranking. |

---

## 3. Full Search Mode

Ideal for rendering full search results on a dedicated "Search Results" page. This mode supports default pagination, filters, and full product details.

### Example Request
```http
GET /api/products/search/?q=napa&min_price=1.00&available=true HTTP/1.1
Host: localhost:8000
Content-Type: application/json
```

### Example Response (200 OK)
```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 12,
      "name": "Napa 500mg",
      "slug": "napa-500mg",
      "category": 3,
      "category_name": "Medicines",
      "brand": 2,
      "brand_name": "Beximco Pharmaceuticals Ltd.",
      "ingredient": 5,
      "ingredient_name": "Paracetamol",
      "requires_prescription": false,
      "is_generic": false,
      "price": "1.20",
      "original_price": "1.50",
      "discount_percentage": 20,
      "image": "http://localhost:8000/media/products/2026/05/napa_500.png",
      "images": [
        "http://localhost:8000/media/products/2026/05/napa_500_side.png"
      ],
      "unit": 1,
      "unit_name": "10 Tablets (1 Strip)",
      "dosage": "500mg",
      "dosages": ["500mg", "665mg"],
      "rating_avg": "4.85",
      "review_count": 1420,
      "quantity_in_stock": 540,
      "low_stock_threshold": 20,
      "is_low_stock": false,
      "is_active": true,
      "is_in_homepage": true,
      "created_at": "2026-05-20T12:00:00Z",
      "updated_at": "2026-05-20T16:00:00Z"
    }
  ]
}
```

---

## 4. Autocomplete Mode

Specifically designed for rendering instant search drop-downs as the user types. This mode returns a streamlined JSON array in under 50ms, skipping pagination and nested object queries.

### Example Request
```http
GET /api/products/search/?q=napa&autocomplete=true HTTP/1.1
Host: localhost:8000
Content-Type: application/json
```

### Example Response (200 OK)
```json
[
  {
    "id": 12,
    "name": "Napa 500mg",
    "slug": "napa-500mg",
    "price": "1.20",
    "original_price": "1.50",
    "discount_percentage": 20,
    "image_url": "http://localhost:8000/media/products/2026/05/napa_500.png",
    "brand_name": "Beximco Pharmaceuticals Ltd.",
    "category_name": "Medicines",
    "generic_name": "Paracetamol",
    "ingredient_name": "Paracetamol",
    "dosage": "500mg",
    "requires_prescription": false,
    "quantity_in_stock": 540
  }
]
```

---

## 5. Under the Hood: Matching & Ranking Logic

The backend executes a multi-layer evaluation algorithm to calculate relevance:

### 5.1 Relevance Weight Score Matrix
Every database row returned is scored using a `Case`/`When` annotation. The rows are sorted by `search_rank` descending:

| Match Category | Applied Score | Detail / Example |
| :--- | :--- | :--- |
| **Exact Name Match** | `10` | The query exactly matches `product.name` (case-insensitive). |
| **Name Starts With** | `8` | The product name begins with the query. |
| **Brand Exact Match** | `7` | The query matches the manufacturer's brand name exactly. |
| **Ingredient Exact Match** | `7` | The query matches the active generic ingredient name exactly. |
| **Name Contains** | `5` | The query is a substring of the product name. |
| **Ingredient Contains** | `4` | The query is a substring of the ingredient name. |
| **Brand Contains** | `4` | The query is a substring of the brand name. |

### 5.2 Fuzzy Spelling Correction (Levenshtein Fallback)
If direct database text matching yields **0 results** and the query contains at least **3 characters**, the backend automatically triggers fuzzy matching:
- Measures the Levenshtein distance between the query and all active product names, brand names, and generic ingredient names in the database.
- Products with a Levenshtein distance **$\le$ 2** are captured, scored with a baseline relevance (`Score = 2`), and returned.
- *Example*: Searching for `"paracitamol"` (incorrect spelling) will successfully yield products containing `"Paracetamol"`.

---

## 6. Frontend Integration Code Examples

### 6.1 JavaScript Fetch API (Autocomplete Suggest)
```javascript
async function fetchProductSuggestions(query) {
  if (query.trim().length < 2) return [];

  const url = `http://localhost:8000/api/products/search/?q=${encodeURIComponent(query)}&autocomplete=true`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Search request failed');
    const suggestions = await response.json();
    return suggestions; // Returns lightweight Array of products
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return [];
  }
}
```

### 6.2 Axios (Full Paginated Search)
```javascript
import axios from 'axios';

async function performSearch(query, filters = {}, page = 1) {
  const url = 'http://localhost:8000/api/products/search/';
  
  const params = {
    q: query,
    page: page,
    ...filters // e.g., { category: 'medicines', min_price: 10 }
  };

  try {
    const response = await axios.get(url, { params });
    return response.data; // Returns paginated object: { count, next, previous, results }
  } catch (error) {
    console.error('Search API error:', error.response?.data || error.message);
    throw error;
  }
}
```

---

## 7. Integration Best Practices

1. **Debounce User Input**: Avoid sending API requests on every single keystroke. When implementing an instant autocomplete dropdown, debounce input by **250ms - 300ms** to minimize network traffic and server CPU load.
2. **Min Minimum Characters**: Do not make API calls for queries of less than **2 characters** to save bandwidth and prevent noisy suggestion lists.
3. **Display Prescription Warnings**: Check the `requires_prescription` boolean flag returned in the payloads. If `true`, display a clean "Rx Required" badge on the UI and require prescription upload during checkout.
4. **Out of Stock Styling**: Inspect the `quantity_in_stock` value. If it is `0`, render an "Out of Stock" badge on the card and disable the "Add to Cart" button, offering a "Notify Me" option instead.
