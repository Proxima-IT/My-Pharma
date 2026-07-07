from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APITestCase

from authentication.constants import UserRole, UserStatus
from authentication.models import User

from .models import (
    NotificationCampaign,
    UserPushSubscription,
    Product,
    Category,
    Brand,
    Ingredient,
    WishlistItem,
)



class NotificationApiSmokeTests(APITestCase):
    def setUp(self):
        self.admin_user = User.objects.create_user(
            email="admin@example.com",
            password="StrongPass123!",
            role=UserRole.SUPER_ADMIN,
            status=UserStatus.ACTIVE,
            is_staff=True,
            is_superuser=True,
            email_verified=True,
        )
        self.customer = User.objects.create_user(
            email="customer@example.com",
            password="StrongPass123!",
            role=UserRole.REGISTERED_USER,
            status=UserStatus.ACTIVE,
            email_verified=True,
        )
        UserPushSubscription.objects.create(
            user=self.customer,
            fcm_token="test-fcm-token",
            is_active=True,
            platform="test",
        )
        self.client.force_authenticate(user=self.admin_user)

    def test_notification_health_endpoint(self):
        response = self.client.get("/api/notifications/health/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("firebase_initialized", response.data)
        self.assertIn("active_subscriptions", response.data)

    def test_campaign_create_and_detail_flow(self):
        payload = {
            "title": "Smoke Test",
            "message": "Campaign smoke run",
            "audience_mode": "USER_IDS",
            "user_ids": [self.customer.id],
            "send_to_opted_in_only": False,
        }
        create_response = self.client.post("/api/notifications/campaigns/", payload, format="json")
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        campaign_id = create_response.data.get("campaign_id")
        self.assertTrue(NotificationCampaign.objects.filter(pk=campaign_id).exists())

        detail_response = self.client.get(f"/api/notifications/campaigns/{campaign_id}/")
        self.assertEqual(detail_response.status_code, status.HTTP_200_OK)
        self.assertEqual(detail_response.data["campaign"]["id"], campaign_id)


class ProductSearchApiTests(APITestCase):
    def setUp(self):
        # 1. Create categories
        self.category_meds = Category.objects.create(name="Medicines", slug="medicines")
        self.category_devs = Category.objects.create(name="Devices", slug="devices")

        # 2. Create brands
        self.brand_beximco = Brand.objects.create(name="Beximco Pharmaceuticals Ltd.", slug="beximco")
        self.brand_square = Brand.objects.create(name="Square Pharmaceuticals Ltd.", slug="square")

        # 3. Create ingredients
        self.ing_para = Ingredient.objects.create(name="Paracetamol", slug="paracetamol")
        self.ing_ibu = Ingredient.objects.create(name="Ibuprofen", slug="ibuprofen")

        # 4. Create products
        self.p_napa = Product.objects.create(
            name="Napa 500mg",
            slug="napa-500mg",
            category=self.category_meds,
            brand=self.brand_beximco,
            ingredient=self.ing_para,
            price=1.20,
            original_price=1.50,
            quantity_in_stock=100,
            is_active=True,
            rating_avg=4.8,
            dosage="500mg"
        )
        self.p_napa_extra = Product.objects.create(
            name="Napa Extra",
            slug="napa-extra",
            category=self.category_meds,
            brand=self.brand_beximco,
            ingredient=self.ing_para,
            price=2.00,
            quantity_in_stock=50,
            is_active=True,
            rating_avg=4.5,
            dosage="665mg"
        )
        self.p_ace = Product.objects.create(
            name="Ace 500mg",
            slug="ace-500mg",
            category=self.category_meds,
            brand=self.brand_square,
            ingredient=self.ing_para,
            price=1.10,
            quantity_in_stock=200,
            is_active=True,
            rating_avg=4.2,
            dosage="500mg"
        )
        self.p_ibu = Product.objects.create(
            name="Ibuprofen 400mg",
            slug="ibuprofen-400mg",
            category=self.category_meds,
            brand=self.brand_square,
            ingredient=self.ing_ibu,
            price=3.00,
            quantity_in_stock=10,
            is_active=True,
            requires_prescription=True,
            rating_avg=4.0,
            dosage="400mg"
        )
        self.p_inactive = Product.objects.create(
            name="Napa Inactive",
            slug="napa-inactive",
            category=self.category_meds,
            brand=self.brand_beximco,
            ingredient=self.ing_para,
            price=1.00,
            quantity_in_stock=100,
            is_active=False
        )

    def test_search_exact_and_partial_name(self):
        # Searching for exact name "Napa 500mg"
        response = self.client.get("/api/products/search/?q=Napa 500mg")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Results should be paginated
        self.assertIn("results", response.data)
        results = response.data["results"]
        # The exact match should be first
        self.assertGreater(len(results), 0)
        self.assertEqual(results[0]["name"], "Napa 500mg")

        # Searching for partial name "Napa"
        response = self.client.get("/api/products/search/?q=napa")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data["results"]
        product_names = [p["name"] for p in results]
        # Should return active Napa products
        self.assertIn("Napa 500mg", product_names)
        self.assertIn("Napa Extra", product_names)
        # Inactive product should NOT be in the results
        self.assertNotIn("Napa Inactive", product_names)

    def test_search_brand_and_ingredient(self):
        # Search by Brand "Square"
        response = self.client.get("/api/products/search/?q=Square")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data["results"]
        # Should return "Ace 500mg" and "Ibuprofen 400mg"
        product_names = [p["name"] for p in results]
        self.assertIn("Ace 500mg", product_names)
        self.assertIn("Ibuprofen 400mg", product_names)

        # Search by Ingredient "Paracetamol"
        response = self.client.get("/api/products/search/?q=Paracetamol")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data["results"]
        product_names = [p["name"] for p in results]
        # Should return all active products with ingredient Paracetamol
        self.assertEqual(len(results), 3)
        self.assertIn("Napa 500mg", product_names)
        self.assertIn("Napa Extra", product_names)
        self.assertIn("Ace 500mg", product_names)

        # They should be ranked by rating_avg descending under the same query score
        # Rating average: Napa 500mg (4.8) > Napa Extra (4.5) > Ace 500mg (4.2)
        self.assertEqual(results[0]["name"], "Napa 500mg")
        self.assertEqual(results[1]["name"], "Napa Extra")
        self.assertEqual(results[2]["name"], "Ace 500mg")

    def test_search_filtering(self):
        # Search for "Napa" and filter by min_price = 1.50
        response = self.client.get("/api/products/search/?q=napa&min_price=1.50")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data["results"]
        product_names = [p["name"] for p in results]
        # Napa 500mg (price=1.20) should be filtered out. Napa Extra (price=2.00) should remain.
        self.assertIn("Napa Extra", product_names)
        self.assertNotIn("Napa 500mg", product_names)

        # Search for "Ibuprofen" and filter by requires_prescription = true
        response = self.client.get("/api/products/search/?q=ibuprofen&requires_prescription=true")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data["results"]
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["name"], "Ibuprofen 400mg")

        # Search for "Ibuprofen" and filter by requires_prescription = false
        response = self.client.get("/api/products/search/?q=ibuprofen&requires_prescription=false")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data["results"]
        self.assertEqual(len(results), 0)

    def test_autocomplete_mode(self):
        # Call autocomplete mode
        response = self.client.get("/api/products/search/?q=napa&autocomplete=true")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should be a list, not a paginated dict
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 2)  # Napa 500mg and Napa Extra (active)
        
        # Verify autocomplete payload schema matches optimized fields
        first_item = response.data[0]
        expected_keys = {
            "id", "name", "slug", "price", "original_price",
            "discount_percentage", "image_url", "brand_name",
            "category_name", "generic_name", "ingredient_name",
            "dosage", "requires_prescription", "quantity_in_stock"
        }
        self.assertTrue(expected_keys.issubset(first_item.keys()))
        self.assertEqual(first_item["brand_name"], "Beximco Pharmaceuticals Ltd.")
        self.assertEqual(first_item["category_name"], "Medicines")
        self.assertEqual(first_item["generic_name"], "Paracetamol")
        self.assertEqual(first_item["ingredient_name"], "Paracetamol")

    def test_fuzzy_spelling_correction(self):
        # Search for misspelled ingredient "paracitamol"
        # This has no exact/contains/starts matches, so it triggers Levenshtein distance <= 2 fallback
        response = self.client.get("/api/products/search/?q=paracitamol")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data["results"]
        product_names = [p["name"] for p in results]
        
        # Should correctly correct to "Paracetamol" products
        self.assertEqual(len(results), 3)
        self.assertIn("Napa 500mg", product_names)
        self.assertIn("Napa Extra", product_names)
        self.assertIn("Ace 500mg", product_names)

    def test_short_and_fuzzy_word_matching(self):
        # 1. Search for short term "na" using search API
        response = self.client.get("/api/products/search/?q=na")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data["results"]
        product_names = [p["name"] for p in results]
        self.assertIn("Napa 500mg", product_names)
        self.assertIn("Napa Extra", product_names)

        # 2. Autocomplete search for word-level typo "npa"
        response = self.client.get("/api/products/search/?q=npa&autocomplete=true")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        product_names = [p["name"] for p in response.data]
        self.assertIn("Napa 500mg", product_names)
        self.assertIn("Napa Extra", product_names)



class BuyNowApiTests(APITestCase):
    def setUp(self):
        from decimal import Decimal
        from authentication.models import UserAddress
        from .models import Coupon, Prescription, PrescriptionItem, DeliveryMethod

        # Create categories, brands, products
        self.category = Category.objects.create(name="Medicines", slug="meds")
        self.product = Product.objects.create(
            name="Buy Now Napa",
            slug="bn-napa",
            category=self.category,
            price=Decimal("150.00"),
            original_price=Decimal("200.00"),
            quantity_in_stock=50,
            is_active=True,
        )
        self.rx_product = Product.objects.create(
            name="Rx Napa Extra",
            slug="rx-napa-extra",
            category=self.category,
            price=Decimal("300.00"),
            quantity_in_stock=30,
            is_active=True,
            requires_prescription=True,
        )

        # Create user
        self.user = User.objects.create_user(
            email="buyer@example.com",
            password="StrongPass123!",
            role=UserRole.REGISTERED_USER,
            status=UserStatus.ACTIVE,
            email_verified=True,
        )
        # Create address
        self.address = UserAddress.objects.create(
            user=self.user,
            full_name="John Doe",
            email="john@example.com",
            phone="01711111111",
            district="Dhaka",
            thana="Dhanmondi",
            address="House 12, Road 5",
        )
        # Create standard delivery method for the tests
        self.delivery_method = DeliveryMethod.objects.create(
            name="Standard Delivery",
            delivery_type="STANDARD",
            price=Decimal("50.00"),
            is_active=True
        )
        self.client.force_authenticate(user=self.user)

    def test_buy_now_preview_success(self):
        payload = {
            "product": self.product.id,
            "quantity": 2,
            "shipping_address_id": self.address.id,
        }
        response = self.client.post("/api/orders/buy-now-preview/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # 150.00 * 2 = 300.00 subtotal. Base delivery fee for Dhaka is 50.00.
        # Total payable = 300.00 + 50.00 = 350.00 BDT.
        self.assertEqual(float(response.data["subtotal"]), 300.00)
        self.assertEqual(float(response.data["total_payable"]), 350.00)

    def test_buy_now_preview_coupon(self):
        from decimal import Decimal
        from .models import Coupon

        # Create coupon
        coupon = Coupon.objects.create(
            code="DIRECT10",
            discount_type=Coupon.DiscountType.PERCENT,
            discount_value=Decimal("10.00"),
            is_active=True,
            min_order_amount=Decimal("100.00"),
        )
        payload = {
            "product": self.product.id,
            "quantity": 2,
            "shipping_address_id": self.address.id,
            "coupon_code": "DIRECT10",
        }
        response = self.client.post("/api/orders/buy-now-preview/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # 150.00 * 2 = 300.00. 10% of 300.00 = 30.00 discount.
        # Delivery = 50.00.
        # Total payable = 300.00 - 30.00 + 50.00 = 320.00 BDT.
        self.assertEqual(float(response.data["total_payable"]), 320.00)
        self.assertEqual(float(response.data["discount_amount"]), 130.00)  # Catalog (100) + Coupon (30)

    def test_buy_now_place_order_cod(self):
        from decimal import Decimal
        from .models import Order, OrderItem

        payload = {
            "product": self.product.id,
            "quantity": 1,
            "shipping_address_id": self.address.id,
            "payment_method": "COD",
        }
        response = self.client.post("/api/orders/buy-now/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertFalse(response.data["payment_required"])
        
        # Verify DB records
        order = Order.objects.get(pk=response.data["id"])
        self.assertEqual(order.user, self.user)
        self.assertEqual(order.total, Decimal("200.00")) # 150 + 50 delivery
        self.assertEqual(OrderItem.objects.filter(order=order).count(), 1)
        
        # Verify inventory stock reduction
        self.product.refresh_from_db()
        self.assertEqual(self.product.quantity_in_stock, 49)

    def test_buy_now_prescription_enforcement(self):
        from .models import Prescription, PrescriptionItem, Order

        # Attempting buy now for Rx product without prescription
        payload = {
            "product": self.rx_product.id,
            "quantity": 1,
            "shipping_address_id": self.address.id,
            "payment_method": "COD",
        }
        response = self.client.post("/api/orders/buy-now/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("prescription", response.data)

        # Create approved prescription
        prescription = Prescription.objects.create(
            user=self.user,
            status=Prescription.Status.APPROVED,
            shipping_address=self.address,
        )
        PrescriptionItem.objects.create(
            prescription=prescription,
            product=self.rx_product,
            quantity_prescribed=5,
        )

        payload["prescription"] = prescription.id
        response = self.client.post("/api/orders/buy-now/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify order contains prescription
        order = Order.objects.get(pk=response.data["id"])
        self.assertEqual(order.prescription, prescription)

    def test_buy_now_cleans_dangling_records(self):
        from decimal import Decimal
        from .models import Order, OrderItem, OrderStatusHistory, OrderImage, OrderSettlement
        
        # Predict next order ID
        dummy = Order.objects.create(
            user=self.user,
            total=Decimal("0.00"),
            shipping_address="Temp",
        )
        next_order_id = dummy.id + 1
        dummy.delete()
        
        # Create dangling records
        _create_dangling_records(next_order_id, self.product)
        
        # Verify dangling records exist
        self.assertEqual(OrderItem.objects.filter(order_id=next_order_id).count(), 1)
        self.assertEqual(OrderStatusHistory.objects.filter(order_id=next_order_id).count(), 1)
        self.assertEqual(OrderImage.objects.filter(order_id=next_order_id).count(), 1)
        self.assertEqual(OrderSettlement.objects.filter(order_id=next_order_id).count(), 1)
        
        # Place order via buy now API
        payload = {
            "product": self.product.id,
            "quantity": 1,
            "shipping_address_id": self.address.id,
            "payment_method": "COD",
        }
        response = self.client.post("/api/orders/buy-now/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["id"], next_order_id)
        
        # Verify dangling records were cleaned up and new correct ones created
        self.assertEqual(OrderItem.objects.filter(order_id=next_order_id, dosage="Dangling Dosage").count(), 0)
        self.assertEqual(OrderItem.objects.filter(order_id=next_order_id).count(), 1)
        self.assertEqual(OrderStatusHistory.objects.filter(order_id=next_order_id, status="DELIVERED").count(), 0)
        self.assertEqual(OrderImage.objects.filter(order_id=next_order_id).count(), 0)
        
        settlement = OrderSettlement.objects.get(order_id=next_order_id)
        self.assertEqual(settlement.payment_method, OrderSettlement.PaymentMethod.COD)
        self.assertEqual(settlement.payment_status, OrderSettlement.PaymentStatus.PENDING)


class WishlistApiTests(APITestCase):
    def setUp(self):
        # 1. Create categories and brand
        self.category = Category.objects.create(name="Medicines", slug="meds")
        self.brand = Brand.objects.create(name="Square", slug="square")

        # 2. Create products
        self.p_active = Product.objects.create(
            name="Active Napa",
            slug="active-napa",
            category=self.category,
            brand=self.brand,
            price=15.00,
            quantity_in_stock=100,
            is_active=True,
        )
        self.p_inactive = Product.objects.create(
            name="Inactive Napa",
            slug="inactive-napa",
            category=self.category,
            brand=self.brand,
            price=12.00,
            quantity_in_stock=50,
            is_active=False,
        )

        # 3. Create users
        self.user = User.objects.create_user(
            email="registered@example.com",
            password="StrongPass123!",
            role=UserRole.REGISTERED_USER,
            status=UserStatus.ACTIVE,
            email_verified=True,
        )
        self.guest_user = User.objects.create_user(
            email="guest@example.com",
            password="StrongPass123!",
            role=UserRole.GUEST_USER,
            status=UserStatus.ACTIVE,
            email_verified=True,
        )

    def test_unauthenticated_request_is_unauthorized(self):
        response = self.client.get("/api/wishlist/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_guest_user_is_forbidden(self):
        self.client.force_authenticate(user=self.guest_user)
        response = self.client.get("/api/wishlist/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_wishlist_list_and_add_success(self):
        self.client.force_authenticate(user=self.user)
        
        # Initially empty list
        response = self.client.get("/api/wishlist/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get("results") if isinstance(response.data, dict) else response.data
        self.assertEqual(len(results), 0)

        # Add active product to wishlist
        payload = {"product": self.p_active.id}
        response = self.client.post("/api/wishlist/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["product"], self.p_active.id)
        self.assertEqual(response.data["product_name"], "Active Napa")
        self.assertEqual(response.data["is_in_stock"], True)

        # Retrieve wishlist list again
        response = self.client.get("/api/wishlist/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get("results") if isinstance(response.data, dict) else response.data
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["product_id"], self.p_active.id)

    def test_add_duplicate_product_fails(self):
        self.client.force_authenticate(user=self.user)
        payload = {"product": self.p_active.id}
        
        response = self.client.post("/api/wishlist/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Add duplicate
        response = self.client.post("/api/wishlist/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("product", response.data)

    def test_add_inactive_product_fails(self):
        self.client.force_authenticate(user=self.user)
        payload = {"product": self.p_inactive.id}
        
        response = self.client.post("/api/wishlist/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_remove_by_id_success(self):
        self.client.force_authenticate(user=self.user)
        # Create wishlist item
        item = WishlistItem.objects.create(user=self.user, product=self.p_active)
        
        # Remove by item ID
        response = self.client.delete(f"/api/wishlist/{item.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(WishlistItem.objects.filter(pk=item.id).exists())

    def test_remove_by_product_id_success(self):
        self.client.force_authenticate(user=self.user)
        # Create wishlist item
        item = WishlistItem.objects.create(user=self.user, product=self.p_active)

        # Remove by custom POST action
        payload = {"product": self.p_active.id}
        response = self.client.post("/api/wishlist/remove/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(WishlistItem.objects.filter(pk=item.id).exists())

    def test_remove_non_existent_product_fails(self):
        self.client.force_authenticate(user=self.user)
        payload = {"product": self.p_active.id}
        response = self.client.post("/api/wishlist/remove/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["detail"], "Product is not in your wishlist.")


class OrderApiTests(APITestCase):
    def setUp(self):
        from decimal import Decimal
        from authentication.models import User
        from authentication.constants import UserRole, UserStatus
        from .models import Order

        # Create admin and customer
        self.admin_user = User.objects.create_user(
            email="order_admin@example.com",
            password="StrongPass123!",
            role=UserRole.SUPER_ADMIN,
            status=UserStatus.ACTIVE,
            is_staff=True,
            is_superuser=True,
            email_verified=True,
        )
        self.customer = User.objects.create_user(
            email="order_customer@example.com",
            password="StrongPass123!",
            role=UserRole.REGISTERED_USER,
            status=UserStatus.ACTIVE,
            email_verified=True,
        )

        # Create a sample order
        self.order = Order.objects.create(
            user=self.customer,
            status=Order.Status.PENDING,
            total=Decimal("150.00"),
            shipping_address="Dhaka, Bangladesh",
        )

    def test_order_creation_defaults_is_seen_false(self):
        self.assertFalse(self.order.is_seen)

    def test_admin_can_patch_is_seen(self):
        self.client.force_authenticate(user=self.admin_user)
        payload = {"is_seen": True}
        response = self.client.patch(f"/api/orders/{self.order.id}/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["is_seen"])
        
        self.order.refresh_from_db()
        self.assertTrue(self.order.is_seen)

    def test_customer_cannot_patch_is_seen(self):
        self.client.force_authenticate(user=self.customer)
        payload = {"is_seen": True}
        response = self.client.patch(f"/api/orders/{self.order.id}/", payload, format="json")
        # Regular user PATCH on /api/orders/<id>/ returns 403 Forbidden because of ViewSet permission checks
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_generate_invoice_pdf_success(self):
        from .models import OrderItem, Product, Category
        from core.invoice_generator import generate_invoice_pdf
        
        # Create a product and add as an order item
        category = Category.objects.create(name="Test Category", slug="test-category")
        product = Product.objects.create(
            name="Test Product",
            slug="test-product",
            category=category,
            price=50.00,
            quantity_in_stock=100
        )
        OrderItem.objects.create(
            order=self.order,
            product=product,
            quantity=2,
            price_at_order=50.00
        )
        
        pdf_bytes = generate_invoice_pdf(self.order)
        self.assertIsInstance(pdf_bytes, bytes)
        self.assertTrue(pdf_bytes.startswith(b"%PDF"))

        # Test with standard 6-part comma shipping address format
        self.order.shipping_address = "John Doe, john@example.com, +8801700000000, Dhaka, Dhanmondi, 123 Street Name"
        self.order.save()
        pdf_bytes = generate_invoice_pdf(self.order)
        self.assertIsInstance(pdf_bytes, bytes)
        self.assertTrue(pdf_bytes.startswith(b"%PDF"))

        # Test with PAID settlement
        from core.models import OrderSettlement
        settlement = OrderSettlement.objects.create(
            order=self.order,
            payment_method=OrderSettlement.PaymentMethod.ONLINE,
            payment_status=OrderSettlement.PaymentStatus.PAID,
            gross_amount=100.00
        )
        pdf_bytes = generate_invoice_pdf(self.order)
        self.assertIsInstance(pdf_bytes, bytes)
        self.assertTrue(pdf_bytes.startswith(b"%PDF"))

        # Test with PENDING settlement
        settlement.payment_status = OrderSettlement.PaymentStatus.PENDING
        settlement.save()
        pdf_bytes = generate_invoice_pdf(self.order)
        self.assertIsInstance(pdf_bytes, bytes)
        self.assertTrue(pdf_bytes.startswith(b"%PDF"))

    def test_invoice_download_by_owner(self):
        self.client.force_authenticate(user=self.customer)
        response = self.client.get(f"/api/orders/{self.order.id}/invoice/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.headers["Content-Type"], "application/pdf")
        self.assertTrue(response.content.startswith(b"%PDF"))

    def test_invoice_download_by_admin(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(f"/api/orders/{self.order.id}/invoice/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.headers["Content-Type"], "application/pdf")

    def test_invoice_download_by_other_customer(self):
        from authentication.models import User
        from authentication.constants import UserRole, UserStatus
        other_customer = User.objects.create_user(
            email="other_customer@example.com",
            password="StrongPass123!",
            role=UserRole.REGISTERED_USER,
            status=UserStatus.ACTIVE,
            email_verified=True,
        )
        self.client.force_authenticate(user=other_customer)
        response = self.client.get(f"/api/orders/{self.order.id}/invoice/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_invoice_download_unauthorized(self):
        self.client.logout()
        response = self.client.get(f"/api/orders/{self.order.id}/invoice/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_order_confirmed_triggers_email(self):
        from unittest.mock import patch
        from .models import Order
        
        with patch("authentication.tasks.send_order_invoice_email.delay") as mock_task:
            self.order.status = Order.Status.CONFIRMED
            self.order.save()
            mock_task.assert_called_once_with(self.order.id)

    def test_public_track_order_by_email_success(self):
        self.client.logout()
        payload = {
            "order_id": self.order.id,
            "email_or_phone": "order_customer@example.com"
        }
        response = self.client.post("/api/orders/track/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], self.order.id)
        self.assertEqual(response.data["status"], self.order.status)

    def test_public_track_order_by_phone_success(self):
        self.client.logout()
        self.customer.phone = "+880-1711-223344"
        self.customer.save()

        payload = {
            "order_id": self.order.id,
            "email_or_phone": "+880-1711-223344"
        }
        response = self.client.post("/api/orders/track/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        payload = {
            "order_id": self.order.id,
            "email_or_phone": "8801711223344"
        }
        response = self.client.post("/api/orders/track/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_public_track_order_not_found(self):
        self.client.logout()
        payload = {
            "order_id": 99999,
            "email_or_phone": "order_customer@example.com"
        }
        response = self.client.post("/api/orders/track/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["detail"], "Order not found or invalid credentials.")

    def test_public_track_order_invalid_credentials(self):
        self.client.logout()
        payload = {
            "order_id": self.order.id,
            "email_or_phone": "wrong_email@example.com"
        }
        response = self.client.post("/api/orders/track/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["detail"], "Order not found or invalid credentials.")

    def test_public_track_order_missing_parameters(self):
        self.client.logout()
        payload = {
            "order_id": self.order.id
        }
        response = self.client.post("/api/orders/track/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_order_cleans_dangling_records(self):
        from decimal import Decimal
        from .models import Order, OrderItem, OrderStatusHistory, OrderImage, OrderSettlement, DeliveryMethod
        
        # Predict next order ID
        dummy = Order.objects.create(
            user=self.customer,
            total=Decimal("0.00"),
            shipping_address="Temp",
        )
        next_order_id = dummy.id + 1
        dummy.delete()
        
        # Set up data
        delivery_method = DeliveryMethod.objects.create(
            name="Express",
            delivery_type="EXPRESS",
            price=Decimal("60.00"),
            is_active=True
        )
        # Create active product
        from .models import Category
        category, _ = Category.objects.get_or_create(name="Medicines", slug="meds")
        product = Product.objects.create(
            name="Test Napa",
            slug="test-napa",
            category=category,
            price=Decimal("150.00"),
            quantity_in_stock=50,
            is_active=True,
        )
        
        # Create dangling records
        _create_dangling_records(next_order_id, product)
        
        self.client.force_authenticate(user=self.customer)
        payload = {
            "shipping_address": "Test address, Dhaka",
            "notes": "Test notes",
            "delivery_method": delivery_method.id,
            "items": [
                {
                    "product": product.id,
                    "quantity": 2,
                    "dosage": "500mg"
                }
            ]
        }
        response = self.client.post("/api/orders/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["id"], next_order_id)
        
        # Verify dangling records were cleaned up and new correct ones created
        self.assertEqual(OrderItem.objects.filter(order_id=next_order_id, dosage="Dangling Dosage").count(), 0)
        self.assertEqual(OrderItem.objects.filter(order_id=next_order_id).count(), 1)
        self.assertEqual(OrderStatusHistory.objects.filter(order_id=next_order_id, status="DELIVERED").count(), 0)
        self.assertEqual(OrderImage.objects.filter(order_id=next_order_id).count(), 0)

    def test_cart_checkout_cleans_dangling_records(self):
        from decimal import Decimal
        from .models import Order, OrderItem, OrderStatusHistory, OrderImage, OrderSettlement, DeliveryMethod, Cart, CartItem
        from authentication.models import UserAddress
        
        # Predict next order ID
        dummy = Order.objects.create(
            user=self.customer,
            total=Decimal("0.00"),
            shipping_address="Temp",
        )
        next_order_id = dummy.id + 1
        dummy.delete()
        
        # Set up data
        delivery_method = DeliveryMethod.objects.create(
            name="Express",
            delivery_type="EXPRESS",
            price=Decimal("60.00"),
            is_active=True
        )
        from .models import Category
        category, _ = Category.objects.get_or_create(name="Medicines", slug="meds")
        product = Product.objects.create(
            name="Test Napa",
            slug="test-napa-cart",
            category=category,
            price=Decimal("150.00"),
            quantity_in_stock=50,
            is_active=True,
        )
        
        # Create dangling records
        _create_dangling_records(next_order_id, product)
        
        address = UserAddress.objects.create(
            user=self.customer,
            full_name="Jane Doe",
            phone="01712222222",
            district="Dhaka",
            thana="Tejgaon",
            address="Some Address"
        )
        
        cart, _ = Cart.objects.get_or_create(user=self.customer)
        CartItem.objects.create(cart=cart, product=product, quantity=1, price_at_order=Decimal("150.00"))
        
        self.client.force_authenticate(user=self.customer)
        payload = {
            "shipping_address_id": address.id,
            "delivery_method_id": delivery_method.id,
            "payment_method": "COD"
        }
        response = self.client.post("/api/cart/place-order/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["id"], next_order_id)
        
        # Verify dangling records were cleaned up
        self.assertEqual(OrderItem.objects.filter(order_id=next_order_id, dosage="Dangling Dosage").count(), 0)
        self.assertEqual(OrderItem.objects.filter(order_id=next_order_id).count(), 1)
        self.assertEqual(OrderStatusHistory.objects.filter(order_id=next_order_id, status="DELIVERED").count(), 0)
        self.assertEqual(OrderImage.objects.filter(order_id=next_order_id).count(), 0)
        
        settlement = OrderSettlement.objects.get(order_id=next_order_id)
        self.assertEqual(settlement.payment_method, OrderSettlement.PaymentMethod.COD)
        self.assertEqual(settlement.payment_status, OrderSettlement.PaymentStatus.PENDING)


class PrescriptionOrderApiTests(APITestCase):
    def setUp(self):
        self.customer = User.objects.create_user(
            email="rx_customer@example.com",
            password="StrongPass123!",
            role=UserRole.REGISTERED_USER,
            status=UserStatus.ACTIVE,
            email_verified=True,
        )
        self.client.force_authenticate(user=self.customer)

    def test_prescription_order_creation_defaults_is_seen_false(self):
        payload = {
            "prescription_note": "Please review quickly.",
            "file": SimpleUploadedFile("rx.pdf", b"%PDF-1.4 test content", content_type="application/pdf"),
        }
        response = self.client.post("/api/prescription-orders/", payload, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("is_seen", response.data)
        self.assertFalse(response.data["is_seen"])

    def test_prescription_approval_cleans_dangling_records(self):
        from decimal import Decimal
        from .models import Prescription, PrescriptionItem, Order, OrderItem, OrderStatusHistory, OrderImage, OrderSettlement, Product, Category
        from .views import _create_order_from_prescription
        
        # Predict next order ID
        dummy = Order.objects.create(
            user=self.customer,
            total=Decimal("0.00"),
            shipping_address="Temp",
        )
        next_order_id = dummy.id + 1
        dummy.delete()
        
        # Set up prescription and items
        prescription = Prescription.objects.create(
            user=self.customer,
            status=Prescription.Status.APPROVED
        )
        category, _ = Category.objects.get_or_create(name="Medicines", slug="meds")
        product = Product.objects.create(
            name="Prescription Napa",
            slug="rx-napa-test",
            category=category,
            price=Decimal("150.00"),
            quantity_in_stock=50,
            is_active=True,
            requires_prescription=True
        )
        PrescriptionItem.objects.create(
            prescription=prescription,
            product=product,
            quantity_prescribed=3
        )
        
        # Create dangling records
        _create_dangling_records(next_order_id, product)
        
        # Verify dangling records exist
        self.assertEqual(OrderItem.objects.filter(order_id=next_order_id).count(), 1)
        self.assertEqual(OrderStatusHistory.objects.filter(order_id=next_order_id).count(), 1)
        self.assertEqual(OrderImage.objects.filter(order_id=next_order_id).count(), 1)
        self.assertEqual(OrderSettlement.objects.filter(order_id=next_order_id).count(), 1)
        
        # Call function directly
        _create_order_from_prescription(prescription)
        
        # Verify order was created with next_order_id
        order = Order.objects.get(prescription=prescription)
        self.assertEqual(order.id, next_order_id)
        
        # Verify dangling records were cleaned up
        self.assertEqual(OrderItem.objects.filter(order_id=next_order_id, dosage="Dangling Dosage").count(), 0)
        self.assertEqual(OrderItem.objects.filter(order_id=next_order_id).count(), 1)
        self.assertEqual(OrderStatusHistory.objects.filter(order_id=next_order_id, status="DELIVERED").count(), 0)
        self.assertEqual(OrderImage.objects.filter(order_id=next_order_id).count(), 0)


def _create_dangling_records(order_id, product):
    from django.db import connection
    from decimal import Decimal
    from .models import OrderItem, OrderStatusHistory, OrderImage, OrderSettlement
    
    with connection.cursor() as cursor:
        if connection.vendor == 'mysql':
            cursor.execute("SET FOREIGN_KEY_CHECKS=0;")
        elif connection.vendor == 'sqlite':
            cursor.execute("PRAGMA foreign_keys = OFF;")
            
    try:
        OrderItem.objects.create(
            order_id=order_id,
            product=product,
            quantity=5,
            price_at_order=Decimal("50.00"),
            dosage="Dangling Dosage"
        )
        OrderStatusHistory.objects.create(
            order_id=order_id,
            status="DELIVERED"
        )
        OrderImage.objects.create(
            order_id=order_id,
            image="dangling_image.jpg",
            order_display=0
        )
        OrderSettlement.objects.create(
            order_id=order_id,
            payment_method="ONLINE",
            payment_status="PAID",
            gross_amount=Decimal("250.00"),
            net_payable=Decimal("250.00"),
            status="SETTLED"
        )
    finally:
        with connection.cursor() as cursor:
            if connection.vendor == 'mysql':
                cursor.execute("SET FOREIGN_KEY_CHECKS=1;")
            elif connection.vendor == 'sqlite':
                cursor.execute("PRAGMA foreign_keys = ON;")

