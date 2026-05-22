# Wishlist CRUD API Guide

The Wishlist CRUD API allows authenticated registered users to save, manage, and retrieve their favorite products. Guest users are not permitted to manage wishlists; they must register or log in first.

---

## Architecture & Permissions

- **Model:** `WishlistItem` database table maps a `user` (ForeignKey) and a `product` (ForeignKey).
- **Constraints:** A unique constraint on `(user, product)` guarantees that a user cannot add a duplicate product to their wishlist.
- **Permissions:** Lock-down using DRF permission classes: `[IsAuthenticated, IsRegisteredUser]`. Anonymous/guest accounts receive `401 Unauthorized` / `403 Forbidden`.
- **Eager Loading:** Querysets are optimized using `.select_related('product', 'product__unit')` to eliminate N+1 query overhead during listing.

---

## API Endpoints Reference

### 1. List Wishlist Items
Retrieve all wishlist items for the authenticated user, ordered by creation date descending (newest first).

- **URL:** `/api/wishlist/`
- **Method:** `GET`
- **Headers:**
  - `Authorization: Bearer <JWT_ACCESS_TOKEN>`
- **Response Status:** `200 OK`
- **Response Payload (Paginated):**
  ```json
  {
    "count": 1,
    "next": null,
    "previous": null,
    "results": [
      {
        "id": 1,
        "product": 10,
        "product_id": 10,
        "product_name": "Napa Extra",
        "product_slug": "napa-extra",
        "product_description": "Paracetamol 500mg + Caffeine 65mg for pain relief.",
        "product_price": "2.00",
        "product_original_price": "2.50",
        "product_unit_name": "Pcs",
        "product_dosage": "665mg",
        "image_url": "http://localhost:8000/media/products/2026/03/napa_extra.png",
        "quantity_in_stock": 50,
        "is_in_stock": true,
        "created_at": "2026-05-22T22:45:00+06:00"
      }
    ]
  }
  ```

---

### 2. Add Product to Wishlist
Add a product to the authenticated user's wishlist.

- **URL:** `/api/wishlist/`
- **Method:** `POST`
- **Headers:**
  - `Authorization: Bearer <JWT_ACCESS_TOKEN>`
  - `Content-Type: application/json`
- **Request Payload:**
  ```json
  {
    "product": 10
  }
  ```
- **Response Status:** `201 Created`
- **Response Payload:** Same as a single item in the list response.
- **Validation Errors:**
  - **Inactive Product:** Adding an inactive product returns a `400 Bad Request`.
    ```json
    {
      "product": [
        "This product is currently inactive."
      ]
    }
    ```
  - **Duplicate Product:** Adding a product that is already present in the user's wishlist returns a `400 Bad Request`.
    ```json
    {
      "product": [
        "This product is already in your wishlist."
      ]
    }
    ```

---

### 3. Remove Item by Wishlist Item ID
Delete an entry from the wishlist using its unique Wishlist Item ID (`id` from the listing/details payload).

- **URL:** `/api/wishlist/{id}/`
- **Method:** `DELETE`
- **Headers:**
  - `Authorization: Bearer <JWT_ACCESS_TOKEN>`
- **Response Status:** `204 No Content`

---

### 4. Remove Product by Product ID (Custom Toggle Action)
A convenient POST endpoint allowing clients to remove a product directly using the **Product ID**, without needing to look up the Wishlist Item ID first. Ideal for toggling wishlist buttons on product cards.

- **URL:** `/api/wishlist/remove/`
- **Method:** `POST`
- **Headers:**
  - `Authorization: Bearer <JWT_ACCESS_TOKEN>`
  - `Content-Type: application/json`
- **Request Payload:**
  ```json
  {
    "product": 10
  }
  ```
- **Response Status:** `200 OK`
- **Response Payload:**
  ```json
  {
    "detail": "Product removed from wishlist."
  }
  ```
- **Validation Errors:**
  - **Product Not in Wishlist:** If the user attempts to remove a product that is not currently in their wishlist, a `400 Bad Request` is returned.
    ```json
    {
      "detail": "Product is not in your wishlist."
    }
    ```

---

## References

- [API_REFERENCE.md](API_REFERENCE.md) – Single master list of all application APIs.
- [RBAC.md](RBAC.md) – Role-based Access Control details.
