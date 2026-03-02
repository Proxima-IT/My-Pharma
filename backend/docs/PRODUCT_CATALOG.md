# 4. Product Catalog Business Logic

Business logic for the product catalog: category hierarchy and search/filter behavior. Aligned with [ADMIN_API.md](ADMIN_API.md) (Manage Products & Categories).

---

## Product Category Hierarchy

The catalog is organized under a single root **PRODUCT CATALOG** with three main branches:

```
PRODUCT CATALOG
▼
├── MEDICINES
│   └── Prescription & OTC
│
├── SUPPLEMENTS
│   └── Vitamins & Nutrition
│
└── DEVICES
    └── Medical Equipment
```

| Branch         | Subcategory          | Description / Use                          |
|----------------|----------------------|--------------------------------------------|
| **MEDICINES**  | Prescription & OTC   | Prescription and over-the-counter medicines |
| **SUPPLEMENTS**| Vitamins & Nutrition | Vitamins and nutritional supplements       |
| **DEVICES**    | Medical Equipment    | Medical devices and equipment              |

**Backend implementation:**

- **Category** model has `parent` (self-referential FK). Root categories have `parent=None`; children have `parent` set to the root.
- **Endpoints:**  
  - `GET /api/categories/` – list categories (filter: `parent`, `is_active`; search: `name`, `slug`).  
  - `GET /api/categories/tree/` – category hierarchy (roots with nested `children`).  
  - CRUD: `POST/GET/PUT/PATCH/DELETE /api/categories/{slug}/`.

Categories are managed via the above; products are linked via `category` and exposed at `/api/products/`.

---

## Search & Filter Logic

Catalog search and filters are applied when listing products: `GET /api/products/`. Implementation follows the rules below.

| Search Type          | Implementation Logic |
|----------------------|------------------------|
| **Name Search**      | Full-text search with fuzzy matching (Levenshtein distance ≤ 2) |
| **Brand Search**     | Exact match on `brand_id` with autocomplete suggestions |
| **Generic Search**   | Maps generic names to all branded equivalents via `ingredient_id` |
| **Price Filter**     | Range slider with min/max; results sorted by price ASC/DESC |
| **Prescription Filter** | Boolean filter: `requires_prescription = true` / `false` |

### Query parameters (product list)

| Parameter               | Type    | Description |
|-------------------------|---------|--------------|
| `search`                | string  | Name search: `name` / `description` contains term; then fuzzy match (Levenshtein ≤ 2) on `name`. |
| `brand_id`              | integer | Exact match on product’s `brand_id`. |
| `ingredient_id`         | integer | Exact match on product’s `ingredient_id` (generic → all branded products with that ingredient). |
| `price_min`             | number  | Minimum price (>=). |
| `price_max`             | number  | Maximum price (<=). |
| `requires_prescription` | boolean | `true` / `false`. |
| `ordering`              | string  | Sort: `price`, `-price`, `name`, `-name`, `created_at`, `-created_at`. |
| `category`              | integer | Category ID. |
| `is_active`             | boolean | Filter by active flag. |

### Supporting endpoints

- **Brand autocomplete:** `GET /api/brands/?search=...` – list brands (search by name/slug). Use result `id` as `brand_id` in product list.
- **Generic (ingredient) list:** `GET /api/ingredients/?search=...` – list ingredients. Use result `id` as `ingredient_id` in product list.

### Notes

- **Name Search:** Uses `icontains` on name/description, then refines with Levenshtein distance ≤ 2 on product name (requires `Levenshtein` package).
- **Brand Search:** Filter by `brand_id`; autocomplete via `/api/brands/?search=...`.
- **Generic Search:** Resolve generic/ingredient to `ingredient_id`, then filter products by that `ingredient_id` (branded equivalents).
- **Price Filter:** Use `price_min` / `price_max`; sort with `ordering=price` or `ordering=-price`.
- **Prescription Filter:** Use query param `requires_prescription=true` or `requires_prescription=false`.

---

## References

- [ADMIN_API.md](ADMIN_API.md) – Manage Products, Categories, Brands, Ingredients
- [RBAC.md](RBAC.md) – User hierarchy and permissions
