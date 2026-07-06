Searched for "createOrder"
Listed directory My-Pharma
Listed directory backend
Listed directory core
Viewed urls.py:1-46
Searched for "class OrderViewSet"
Viewed views.py:1114-1300
Searched for "class OrderWriteSerializer"
Viewed serializers.py:925-1100
Searched for "class OrderItemWriteSerializer"
Viewed serializers.py:800-850
Searched for "class Order("
Viewed models.py:529-600

The **Create Order API** is a Django REST Framework (DRF) endpoint that handles the validation, inventory deduction, and initial creation of orders.

Here is a breakdown of how the API works, including routing, expected payloads, validation rules, and the execution flow.

---

### 1. Endpoint & Access Control
* **URL:** `/api/orders/`
* **Method:** `POST`
* **Route Configuration:** Registered in [urls.py](file:///Users/shihab/Workspace/Web/My-Pharma/backend/core/urls.py#L18) via the `OrderViewSet`.
* **Permissions:** Restricted to **Authenticated & Registered Users only** (`IsAuthenticated`, `IsRegisteredUserOnly`) via [views.py](file:///Users/shihab/Workspace/Web/My-Pharma/backend/core/views.py#L1134-L1135).

---

### 2. Request Payload
The endpoint accepts either standard `JSON` or `multipart/form-data` (which is useful if the user uploads images/prescriptions along with the order).

#### **JSON Fields**
```json
{
  "shipping_address": "123 Main St, Dhaka, Bangladesh",
  "notes": "Deliver in the afternoon",
  "message": "Leave at front desk",
  "delivery_method": 1, 
  "prescription": 12, 
  "items": [
    {
      "product": 5,
      "quantity": 2,
      "dosage": "1-0-1"
    }
  ]
}
```

* **`prescription`**: Required **only** if any ordered product requires a prescription.
* **`items`**: List of items containing:
  * `product` (ID of the product)
  * `quantity` (Integer)
  * `dosage` (String, optional, e.g., frequency/instructions)

---

### 3. Execution Lifecycle & Validation Rules

When a `POST` request is received, the creation goes through the following lifecycle managed in the viewset and the serializer:

#### **A. Multipart Parsing in [views.py](file:///Users/shihab/Workspace/Web/My-Pharma/backend/core/views.py#L1151-L1160)**
If the request is sent as `multipart/form-data` (e.g. including files), the API expects the `items` payload to be a serialized JSON string. It attempts to parse it first before passing the data to the serializer.

#### **B. Serializer Validation in [serializers.py](file:///Users/shihab/Workspace/Web/My-Pharma/backend/core/serializers.py#L951-L981)**
The `OrderWriteSerializer` enforces several checks:
1. **Prescription Check**:
   * It scans the requested products. If any product requires a prescription (`product.requires_prescription == True`):
     * A `prescription` field must be provided.
     * The prescription must belong to the current authenticated user and be in `APPROVED` status.
     * The ordered products must be listed in the prescription items.
     * The requested quantity for those products cannot exceed the prescribed quantity (`quantity_prescribed`).
2. **Stock Check**:
   * It checks each product's current inventory. If `product.quantity_in_stock < requested_quantity`, a validation error is raised.

#### **C. Persistence & Side Effects in [serializers.py](file:///Users/shihab/Workspace/Web/My-Pharma/backend/core/serializers.py#L983-L1017)**
Once validation succeeds, the `create` method performs the following database changes:
1. **Create Order**: Writes the main [Order](file:///Users/shihab/Workspace/Web/My-Pharma/backend/core/models.py#L529) record with status set to `PENDING`.
2. **Sanitize Associated Elements**: Cleans up any potential dangling items (e.g. matching items, history, or image records) for the generated order.
3. **Item Processing & Inventory Deduction**:
   * Inserts an `OrderItem` record for each item.
   * Freezes the product price by storing it as `price_at_order` on the order item.
   * Subtracts the ordered quantity directly from `product.quantity_in_stock`.
   * Calculates the total order cost.
4. **Update Prescription Status**: If a prescription was used, its status is updated to `USED`.

#### **D. Media Attachment & History Logging in [views.py](file:///Users/shihab/Workspace/Web/My-Pharma/backend/core/views.py#L1161-L1170)**
After the order object is saved successfully:
1. **Attach Order Images**: Loops through any uploaded files sent in the request (`request.FILES.getlist("images")`) and saves them as `OrderImage` records linked to the order.
2. **Add History Event**: Appends an entry to the `OrderStatusHistory` marking the order status as `PENDING`.
3. **Response**: Responds with a `201 Created` status containing the full serialized order details (defined by `OrderSerializer`).