# Flutter API Integration & Migration Guide

The My Pharma backend API schemas have been optimized to reduce payload size, prevent bandwidth bloat, and improve query speed. Since the OpenAPI schema has changed, the Flutter app client-side models and APIs will require minor modifications.

This guide outlines the required changes on the Flutter side.

---

## 1. Cart Integration (`/api/cart/`)

### Schema Change
The `GET /api/cart/` endpoint now returns a single **`Cart`** object directly in the response root, rather than a list of carts (`Array[Cart]`).
Additionally, `CartItem` no longer contains the `product_description` field.

### Required Flutter Code Updates

#### A. Fetching and Deserializing the Cart
Update your API client fetch method to parse a single `Cart` object:

```dart
// BEFORE
Future<Cart> getCart() async {
  final response = await httpClient.get(Uri.parse('/api/cart/'));
  final list = response.data as List;
  return Cart.fromJson(list.first as Map<String, dynamic>);
}

// AFTER
Future<Cart> getCart() async {
  final response = await httpClient.get(Uri.parse('/api/cart/'));
  // Directly decode the root Map as a Cart object
  return Cart.fromJson(response.data as Map<String, dynamic>);
}
```

#### B. Cart Item Models
If you are generating Dart models from the OpenAPI file (e.g., using `openapi_generator`), the generator will automatically remove the `productDescription` property from the `CartItem` model class.
* **Action**: If your cart page UI previously rendered `item.productDescription`, remove it. Standard cart cards only need product name, selected dosage, quantity, unit price, and thumbnail.

---

## 2. Order Listings (`/api/orders/`)

### Schema Change
* `GET /api/orders/` (list) now returns a lightweight `OrderList` schema.
* `GET /api/orders/{id}/` (retrieve) continues to return the fully detailed `Order` schema.
* The `OrderList` schema **omits** the nested `items` array, `images` array, and `status_history` list, but introduces an integer **`item_count`** field.

### Required Flutter Code Updates

#### A. Update the Order List Screen
Modify your Order History list view to render data using the new lightweight fields:
* Displays order metadata (order ID, date, status, total, payment status/method, shipping address).
* Shows the count of items in the order using the new `itemCount` integer (e.g. `"3 items"`).
* Avoid referencing nested arrays like `order.items` directly on the listing page.

#### B. Navigating to the Order Detail Screen
When a user taps an order card in the list, fetch the full detailed order payload dynamically:

```dart
class OrderHistoryListScreen extends StatelessWidget {
  Widget build(BuildContext context) {
    return ListView.builder(
      itemBuilder: (context, index) {
        final orderSummary = orderSummaries[index];
        return OrderSummaryCard(
          order: orderSummary,
          onTap: () async {
            // Fetch detailed order payload before navigating or in the detail screen
            final detailedOrder = await apiService.getOrderDetail(orderSummary.id);
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => OrderDetailScreen(order: detailedOrder),
              ),
            );
          },
        );
      },
    );
  }
}
```

---

## 3. Prescription Listings (`/api/prescriptions/`)

### Schema Change
* `GET /api/prescriptions/` (list) now returns a lightweight `PrescriptionList` schema.
* `GET /api/prescriptions/{id}/` (retrieve) returns the fully detailed `Prescription` schema.
* Similar to orders, the `PrescriptionList` schema **omits** nested arrays (`items`, `images`, `status_history`), but adds an integer **`item_count`** representing the number of items prescribed.

### Required Flutter Code Updates
* Adjust your Prescription History screen to render the status, date, and `itemCount`.
* Fetch the full prescription details via `GET /api/prescriptions/{id}/` when the user opens the detail view.

---

## 4. Combo Listings (`/api/combos/`)

### Schema Change
To listing promotional packages, `GET /api/combos/` now uses a lightweight nested serializer for the products inside the combo.
* Instead of the full 29-field product model, the `products` list inside `Combo` in list views only contains:
  - `id` (integer)
  - `name` (string)
  - `slug` (string)
  - `price` (string)
  - `image` (string/URL)

### Required Flutter Code Updates
* If your combo cards render mini-products (e.g., in a grid or horizontal list under the combo card), ensure you only reference `id`, `name`, `slug`, `price`, or `image`.
* Accessing other fields (like unit name, dosage options, low stock status) will cause runtime null-pointer exceptions if not handled as nullable or removed from the list UI.
