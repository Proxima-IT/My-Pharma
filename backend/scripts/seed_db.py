import os
import sys
import django
from decimal import Decimal

# Set up Django environment and add root path to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "my_pharma.settings")
django.setup()

from django.apps import apps
from django.db import models, connection
from django.utils import timezone
from django.utils.text import slugify
from django.core.files.uploadedfile import SimpleUploadedFile

from authentication.models import User, UserAddress, AuditLog
from core.models import (
    SidebarCategory, Category, Ad, Combo, AppLogo, Brand, Ingredient, Unit,
    Product, ProductImage, ProductDosage, DeliveryMethod, Coupon, Prescription,
    Order, OrderItem, OrderImage, OrderStatusHistory, OrderSettlement,
    PaymentTransaction, B2BCustomerProfile, B2BCommissionEntry, ProductReview,
    ProductReviewImage, Cart, CartItem, PrescriptionImage, PrescriptionStatusHistory,
    PrescriptionItem, Consultation, NotificationCampaign, UserNotification,
    UserPushSubscription, NotificationDeliveryLog, UserNotificationPreference,
    BlogCategory, BlogPost, Page, WishlistItem
)
from authentication.constants import UserRole, UserStatus, AuditAction


def dummy_img(filename):
    return SimpleUploadedFile(
        name=filename,
        content=b"dummy image bytes",
        content_type="image/jpeg"
    )


def main():
    print("=== STARTING MY PHARMA DATABASE SEEDING ===")

    # 1. Discover models in authentication and core apps
    app_labels = ("authentication", "core")
    app_models = [
        m for m in apps.get_models() if m._meta.app_label in app_labels
    ]
    print(f"Discovered {len(app_models)} models in apps: {app_labels}")

    # 2. Safely clear all tables by disabling foreign key checks
    print("\n--- Clearing existing database tables ---")
    with connection.cursor() as cursor:
        cursor.execute("SET FOREIGN_KEY_CHECKS = 0;")
        for model in app_models:
            db_table = model._meta.db_table
            print(f"Truncating table: {db_table}")
            cursor.execute(f"TRUNCATE TABLE `{db_table}`;")
        cursor.execute("SET FOREIGN_KEY_CHECKS = 1;")
    print("All target tables cleared successfully.")

    # 3. Seed Users
    print("\n--- Seeding Users ---")
    admin = User.objects.create_superuser(
        email='admin@mypharma.com',
        password='password123',
        username='admin',
        phone='+8801700000001',
        gender=User.Gender.MALE,
        status=UserStatus.ACTIVE
    )
    print("Created Super Admin: admin@mypharma.com")

    pharm_admin = User.objects.create_user(
        email='pharmadmin@mypharma.com',
        password='password123',
        username='pharmadmin',
        phone='+8801700000002',
        role=UserRole.PHARMACY_ADMIN,
        status=UserStatus.ACTIVE,
        email_verified=True,
        phone_verified=True
    )
    print("Created Pharmacy Admin: pharmadmin@mypharma.com")

    doctor = User.objects.create_user(
        email='doctor@mypharma.com',
        password='password123',
        username='doctor',
        phone='+8801700000003',
        role=UserRole.DOCTOR,
        status=UserStatus.ACTIVE,
        email_verified=True,
        phone_verified=True
    )
    print("Created Doctor: doctor@mypharma.com")

    cust1 = User.objects.create_user(
        email='customer1@mypharma.com',
        password='password123',
        username='customer1',
        phone='+8801700000004',
        role=UserRole.REGISTERED_USER,
        status=UserStatus.ACTIVE,
        email_verified=True,
        phone_verified=True
    )
    print("Created Customer 1: customer1@mypharma.com")

    cust2 = User.objects.create_user(
        email='customer2@mypharma.com',
        password='password123',
        username='customer2',
        phone='+8801700000005',
        role=UserRole.REGISTERED_USER,
        status=UserStatus.ACTIVE,
        email_verified=True,
        phone_verified=True
    )
    print("Created Customer 2: customer2@mypharma.com")

    cust3 = User.objects.create_user(
        email='customer3@mypharma.com',
        password='password123',
        username='customer3',
        phone='+8801700000006',
        role=UserRole.REGISTERED_USER,
        status=UserStatus.PENDING_VERIFICATION,
        email_verified=False,
        phone_verified=False
    )
    print("Created Pending Customer 3: customer3@mypharma.com")

    b2b_cust = User.objects.create_user(
        email='b2b_customer@mypharma.com',
        password='password123',
        username='b2bcustomer',
        phone='+8801700000007',
        role=UserRole.REGISTERED_USER,
        status=UserStatus.ACTIVE,
        email_verified=True,
        phone_verified=True
    )
    print("Created B2B Customer: b2b_customer@mypharma.com")

    # 4. Seed UserAddress
    print("\n--- Seeding Addresses ---")
    addr1 = UserAddress.objects.create(
        user=cust1,
        full_name="Shihab Rahman",
        phone="+8801700000004",
        email="customer1@mypharma.com",
        gender=User.Gender.MALE,
        district="Dhaka",
        thana="Gulshan",
        address="House 12, Road 5, Gulshan 2",
        address_type=UserAddress.AddressType.HOME,
        is_default=True
    )
    addr2 = UserAddress.objects.create(
        user=cust1,
        full_name="Shihab Rahman",
        phone="+8801700000004",
        email="customer1@mypharma.com",
        gender=User.Gender.MALE,
        district="Sylhet",
        thana="Zindabazar",
        address="Apartment 4B, Sylhet Plaza",
        address_type=UserAddress.AddressType.OFFICE,
        is_default=False
    )
    addr3 = UserAddress.objects.create(
        user=cust2,
        full_name="Nila Chowdhury",
        phone="+8801700000005",
        email="customer2@mypharma.com",
        gender=User.Gender.FEMALE,
        district="Chattogram",
        thana="Panchlaish",
        address="Flat C1, Nasirabad Heights",
        address_type=UserAddress.AddressType.HOME,
        is_default=True
    )
    addr4 = UserAddress.objects.create(
        user=b2b_cust,
        full_name="Dr. Kamal Hasan",
        phone="+8801700000007",
        email="b2b_customer@mypharma.com",
        gender=User.Gender.MALE,
        district="Dhaka",
        thana="Dhanmondi",
        address="Hasan Pharmacy, House 45, Road 27",
        address_type=UserAddress.AddressType.OFFICE,
        is_default=True
    )
    print("Seeded user addresses.")

    # 5. Seed AuditLog
    print("\n--- Seeding Audit Logs ---")
    AuditLog.objects.create(user=cust1, action=AuditAction.REGISTER_EMAIL, ip_address="127.0.0.1", user_agent="Mozilla/5.0")
    AuditLog.objects.create(user=cust1, action=AuditAction.LOGIN, ip_address="127.0.0.1", user_agent="Mozilla/5.0")
    AuditLog.objects.create(user=cust2, action=AuditAction.REGISTER_PHONE, ip_address="192.168.1.1", user_agent="Mozilla/5.0")
    AuditLog.objects.create(user=b2b_cust, action=AuditAction.LOGIN, ip_address="127.0.0.1", user_agent="Mozilla/5.0")
    print("Seeded audit logs.")

    # 6. Seed B2BCustomerProfile
    print("\n--- Seeding B2BCustomerProfile ---")
    b2b_profile = B2BCustomerProfile.objects.create(
        user=b2b_cust,
        company_name="Kamal's Pharmacy & Clinic",
        commission_rate=Decimal("0.0500"),
        is_active=True
    )
    print("Seeded B2B customer profile.")

    # 7. Seed SidebarCategory
    print("\n--- Seeding SidebarCategory ---")
    sb_all = SidebarCategory.objects.create(title="All Products", image=dummy_img("sb_all.jpg"))
    sb_med = SidebarCategory.objects.create(title="Medicines", image=dummy_img("sb_med.jpg"))
    sb_hc = SidebarCategory.objects.create(title="Healthcare", image=dummy_img("sb_hc.jpg"))
    sb_pc = SidebarCategory.objects.create(title="Personal Care", image=dummy_img("sb_pc.jpg"))
    sb_baby = SidebarCategory.objects.create(title="Baby Care", image=dummy_img("sb_baby.jpg"))
    print("Seeded sidebar categories.")

    # 8. Seed Category (Hierarchical)
    print("\n--- Seeding Categories ---")
    cat_medicine = Category.objects.create(name="Medicines", slug="medicines", sidebar_category=sb_med, show_in_sidebar=True, is_active=True, image=dummy_img("cat_med.jpg"))
    cat_healthcare = Category.objects.create(name="Healthcare", slug="healthcare", sidebar_category=sb_hc, show_in_sidebar=True, is_active=True, image=dummy_img("cat_hc.jpg"))
    cat_personal_care = Category.objects.create(name="Personal Care", slug="personal-care", sidebar_category=sb_pc, show_in_sidebar=True, is_active=True, image=dummy_img("cat_pc.jpg"))
    cat_baby_care = Category.objects.create(name="Baby Care", slug="baby-care", sidebar_category=sb_baby, show_in_sidebar=True, is_active=True, image=dummy_img("cat_baby.jpg"))

    cat_prescription = Category.objects.create(parent=cat_medicine, name="Prescription Medicine", slug="prescription-medicine", is_active=True, is_home_categoery=True)
    cat_otc = Category.objects.create(parent=cat_medicine, name="OTC Medicine", slug="otc-medicine", is_active=True)
    cat_herbal = Category.objects.create(parent=cat_medicine, name="Herbal & Ayurvedic", slug="herbal-ayurvedic", is_active=True)

    cat_vitamins = Category.objects.create(parent=cat_healthcare, name="Vitamins & Supplements", slug="vitamins-supplements", is_active=True, is_featured_home=True, featured_order=1, forth_section=True)
    cat_diabetic = Category.objects.create(parent=cat_healthcare, name="Diabetic Care", slug="diabetic-care", is_active=True, is_featured_home=True, featured_order=2)
    cat_dental = Category.objects.create(parent=cat_healthcare, name="Dental & Oral Care", slug="dental-oral-care", is_active=True)

    cat_hair = Category.objects.create(parent=cat_personal_care, name="Hair Care", slug="hair-care", is_active=True)
    cat_skin = Category.objects.create(parent=cat_personal_care, name="Skin Care", slug="skin-care", is_active=True, is_featured_home=True, featured_order=3)

    cat_diapers = Category.objects.create(parent=cat_baby_care, name="Baby Diapers", slug="baby-diapers", is_active=True)
    cat_baby_food = Category.objects.create(parent=cat_baby_care, name="Baby Food & Formula", slug="baby-food-formula", is_active=True)
    print("Seeded hierarchical categories.")

    # 9. Seed Brand
    print("\n--- Seeding Brands ---")
    brand_square = Brand.objects.create(name="Square Pharmaceuticals")
    brand_incepta = Brand.objects.create(name="Incepta Pharmaceuticals")
    brand_beximco = Brand.objects.create(name="Beximco Pharmaceuticals")
    brand_opsonin = Brand.objects.create(name="Opsonin Pharma")
    brand_renata = Brand.objects.create(name="Renata Limited")
    brand_healthcare = Brand.objects.create(name="Healthcare Pharmaceuticals")
    brand_durex = Brand.objects.create(name="Durex")
    brand_himalaya = Brand.objects.create(name="Himalaya")
    brand_johnson = Brand.objects.create(name="Johnson & Johnson")
    brand_sensodyne = Brand.objects.create(name="Sensodyne")
    brand_acme = Brand.objects.create(name="ACME Laboratories")
    print("Seeded brands.")

    # 10. Seed Ingredient
    print("\n--- Seeding Ingredients ---")
    ing_para = Ingredient.objects.create(name="Paracetamol")
    ing_eso = Ingredient.objects.create(name="Esomeprazole")
    ing_fexo = Ingredient.objects.create(name="Fexofenadine")
    ing_panto = Ingredient.objects.create(name="Pantoprazole")
    ing_mont = Ingredient.objects.create(name="Montelukast")
    ing_azi = Ingredient.objects.create(name="Azithromycin")
    ing_calcium = Ingredient.objects.create(name="Calcium + Vitamin D3")
    print("Seeded active ingredients.")

    # 11. Seed Unit
    print("\n--- Seeding Units ---")
    unit_strip_10_tab = Unit.objects.create(unit_type="Strip", content_type="Tablets", quantity=10)
    unit_box_30_tab = Unit.objects.create(unit_type="Box", content_type="Tablets", quantity=30)
    unit_bottle_100ml = Unit.objects.create(unit_type="Bottle", content_type="ml Liquid", quantity=100)
    unit_tube_15g = Unit.objects.create(unit_type="Tube", content_type="gm Cream", quantity=15)
    unit_box_3_cond = Unit.objects.create(unit_type="Box", content_type="Condoms", quantity=3)
    unit_strip_10_cap = Unit.objects.create(unit_type="Strip", content_type="Capsules", quantity=10)
    print("Seeded packaging units.")

    # 12. Seed Products
    print("\n--- Seeding Products ---")
    p_napa = Product.objects.create(
        category=cat_otc,
        brand=brand_square,
        ingredient=ing_para,
        requires_prescription=False,
        is_generic=False,
        name="Napa 500mg",
        description="Napa is a fast-acting pain reliever and fever reducer containing Paracetamol. It is used for headache, toothache, backache, and other common pains.",
        price=Decimal("12.00"),
        original_price=Decimal("15.00"),
        quantity_in_stock=500,
        low_stock_threshold=20,
        is_active=True,
        is_in_homepage=True,
        unit=unit_strip_10_tab,
        dosage="500mg",
        rating_avg=Decimal("4.80"),
        review_count=124,
        key_benefits=["Effective pain relief", "Fast fever reduction", "Safe for most age groups"],
        specifications={"Drug Class": "Analgesic", "Administration Route": "Oral"},
        indications="Fever, common cold, headache, toothache, muscle pain.",
        therapeutic_class="Non-opioid Analgesics",
        pharmacology="Paracetamol has analgesic and antipyretic properties with weak anti-inflammatory activity.",
        dosage_administration="Adults: 1-2 tablets every 4-6 hours. Maximum 8 tablets in 24 hours.",
        side_effects="Generally safe; rare skin rash or allergic reactions.",
        storage_conditions="Store below 30°C in a dry place, away from sunlight."
    )

    p_napa_extra = Product.objects.create(
        category=cat_otc,
        brand=brand_square,
        ingredient=ing_para,
        requires_prescription=False,
        is_generic=False,
        name="Napa Extra",
        description="Napa Extra combines Paracetamol and Caffeine to provide stronger relief for stubborn headaches and migraines.",
        price=Decimal("25.00"),
        original_price=Decimal("30.00"),
        quantity_in_stock=400,
        low_stock_threshold=20,
        is_active=True,
        is_in_homepage=True,
        unit=unit_strip_10_tab,
        dosage="500mg + 65mg",
        rating_avg=Decimal("4.70"),
        review_count=82,
        key_benefits=["Enhanced pain relief with caffeine", "Fast relief for migraines", "Ideal for tension headaches"],
        specifications={"Drug Class": "Analgesic Combination", "Administration Route": "Oral"},
        indications="Tension headache, migraine, toothache, backache, muscle pain.",
        dosage_administration="Adults: 1-2 tablets every 4-6 hours. Maximum 8 tablets in 24 hours."
    )

    p_ace = Product.objects.create(
        category=cat_otc,
        brand=brand_incepta,
        ingredient=ing_para,
        requires_prescription=False,
        is_generic=True,
        name="Ace 500mg",
        description="Ace is Incepta's brand of Paracetamol, offering high-quality pain relief and fever reduction.",
        price=Decimal("10.00"),
        original_price=Decimal("12.00"),
        quantity_in_stock=600,
        low_stock_threshold=30,
        is_active=True,
        is_in_homepage=False,
        unit=unit_strip_10_tab,
        dosage="500mg",
        rating_avg=Decimal("4.50"),
        review_count=45,
        key_benefits=["Quality pain relief", "Affordable pricing", "Fever reduction"],
        specifications={"Drug Class": "Analgesic", "Administration Route": "Oral"},
        alternative_products="Napa 500mg, Napa Extra"
    )

    p_seclo = Product.objects.create(
        category=cat_otc,
        brand=brand_square,
        ingredient=ing_eso,
        requires_prescription=False,
        is_generic=False,
        name="Seclo 20mg",
        description="Seclo 20 is Esomeprazole, a proton pump inhibitor that reduces stomach acid production, used to treat acid reflux and ulcers.",
        price=Decimal("70.00"),
        original_price=Decimal("70.00"),
        quantity_in_stock=350,
        low_stock_threshold=15,
        is_active=True,
        is_in_homepage=True,
        unit=unit_strip_10_cap,
        dosage="20mg",
        rating_avg=Decimal("4.90"),
        review_count=192,
        key_benefits=["Long-lasting acid control", "Relieves heartburn quickly", "Heals gastric ulcers"],
        specifications={"Drug Class": "Proton Pump Inhibitor (PPI)", "Form": "Capsule"},
        indications="Gastroesophageal reflux disease (GERD), gastric ulcer, acid reflux.",
        dosage_administration="Take 1 capsule 20-30 minutes before meal, once or twice daily."
    )

    p_sergel = Product.objects.create(
        category=cat_otc,
        brand=brand_healthcare,
        ingredient=ing_eso,
        requires_prescription=False,
        is_generic=True,
        name="Sergel 20mg",
        description="Sergel 20 is Esomeprazole in capsule form, manufactured by Healthcare, providing excellent gastric acid suppression.",
        price=Decimal("68.00"),
        original_price=Decimal("70.00"),
        quantity_in_stock=300,
        low_stock_threshold=15,
        is_active=True,
        is_in_homepage=False,
        unit=unit_strip_10_cap,
        dosage="20mg",
        rating_avg=Decimal("4.85"),
        review_count=98,
        key_benefits=["Effective heartburn relief", "Protects stomach lining", "High bio-availability"],
        alternative_products="Seclo 20mg"
    )

    p_fexo = Product.objects.create(
        category=cat_otc,
        brand=brand_square,
        ingredient=ing_fexo,
        requires_prescription=False,
        is_generic=False,
        name="Fexo 120mg",
        description="Fexo 120 is Fexofenadine Hydrochloride, a non-drowsy antihistamine used to relieve allergy symptoms like runny nose, sneezing, and itchy eyes.",
        price=Decimal("90.00"),
        original_price=Decimal("100.00"),
        quantity_in_stock=250,
        low_stock_threshold=10,
        is_active=True,
        is_in_homepage=True,
        unit=unit_strip_10_tab,
        dosage="120mg",
        rating_avg=Decimal("4.60"),
        review_count=76,
        key_benefits=["24-hour allergy relief", "Non-drowsy formula", "Controls sneezing and runny nose"],
        specifications={"Drug Class": "Antihistamine", "Form": "Tablet"},
        indications="Allergic rhinitis, skin allergy, chronic idiopathic urticaria."
    )

    p_fexofast = Product.objects.create(
        category=cat_otc,
        brand=brand_incepta,
        ingredient=ing_fexo,
        requires_prescription=False,
        is_generic=True,
        name="Fexofast 120mg",
        description="Fexofast is Incepta's brand of Fexofenadine, providing quick and non-drowsy relief from environmental allergies.",
        price=Decimal("85.00"),
        original_price=Decimal("90.00"),
        quantity_in_stock=280,
        low_stock_threshold=10,
        is_active=True,
        is_in_homepage=False,
        unit=unit_strip_10_tab,
        dosage="120mg",
        rating_avg=Decimal("4.55"),
        review_count=48,
        key_benefits=["Quick action", "Affordable non-drowsy antihistamine", "Great for seasonal allergies"],
        alternative_products="Fexo 120mg"
    )

    p_pantonix = Product.objects.create(
        category=cat_otc,
        brand=brand_incepta,
        ingredient=ing_panto,
        requires_prescription=False,
        is_generic=False,
        name="Pantonix 20mg",
        description="Pantonix is Pantoprazole, an effective acid reducer used to manage acid reflux, GERD, and stomach ulcers.",
        price=Decimal("60.00"),
        original_price=Decimal("60.00"),
        quantity_in_stock=200,
        low_stock_threshold=15,
        is_active=True,
        is_in_homepage=False,
        unit=unit_strip_10_tab,
        dosage="20mg",
        rating_avg=Decimal("4.65"),
        review_count=52,
        key_benefits=["Reduces stomach acid", "Relieves acid reflux symptoms", "Comfortable oral tablets"]
    )

    p_monas = Product.objects.create(
        category=cat_prescription,
        brand=brand_acme,
        ingredient=ing_mont,
        requires_prescription=True,
        is_generic=False,
        name="Monas 10mg",
        description="Monas 10 contains Montelukast Sodium, which prevents asthma attacks and treats seasonal allergy symptoms in adults and teenagers.",
        price=Decimal("150.00"),
        original_price=Decimal("160.00"),
        quantity_in_stock=180,
        low_stock_threshold=10,
        is_active=True,
        is_in_homepage=True,
        unit=unit_strip_10_tab,
        dosage="10mg",
        rating_avg=Decimal("4.75"),
        review_count=65,
        key_benefits=["Prevents asthma symptoms", "Manages seasonal allergies", "Improves breathing comfort"],
        specifications={"Drug Class": "Leukotriene Receptor Antagonist", "Form": "Tablet"},
        indications="Prophylaxis and chronic treatment of asthma, allergic rhinitis.",
        dosage_administration="Adults: 1 tablet (10mg) daily in the evening."
    )

    p_zimax = Product.objects.create(
        category=cat_prescription,
        brand=brand_square,
        ingredient=ing_azi,
        requires_prescription=True,
        is_generic=False,
        name="Zimax 500mg",
        description="Zimax 500 is Azithromycin, a broad-spectrum macrolide antibiotic used to treat various bacterial infections of the respiratory tract, skin, and ears.",
        price=Decimal("1050.00"),
        original_price=Decimal("1100.00"),
        quantity_in_stock=100,
        low_stock_threshold=5,
        is_active=True,
        is_in_homepage=True,
        unit=unit_box_30_tab,
        dosage="500mg",
        rating_avg=Decimal("4.80"),
        review_count=42,
        key_benefits=["Broad-spectrum antibiotic", "Convenient 3-day or 5-day therapy", "Treats respiratory and throat infections"],
        specifications={"Drug Class": "Macrolide Antibiotic", "Form": "Tablet"},
        indications="Bronchitis, pneumonia, tonsillitis, skin infections.",
        dosage_administration="As directed by the registered physician. Standard dose is 500mg once daily for 3-5 days."
    )

    p_calbo = Product.objects.create(
        category=cat_vitamins,
        brand=brand_square,
        ingredient=ing_calcium,
        requires_prescription=False,
        is_generic=False,
        name="Calbo-D",
        description="Calbo-D is a balanced combination of Calcium and Vitamin D3, essential for bone health, dental strength, and prevention of osteoporosis.",
        price=Decimal("240.00"),
        original_price=Decimal("270.00"),
        quantity_in_stock=300,
        low_stock_threshold=15,
        is_active=True,
        is_in_homepage=True,
        unit=unit_box_30_tab,
        dosage="500mg + 200IU",
        rating_avg=Decimal("4.90"),
        review_count=110,
        key_benefits=["Supports bone density", "Essential Vitamin D3 for absorption", "Prevents joint pain"],
        specifications={"Drug Class": "Calcium Supplement", "Form": "Tablet"},
        indications="Calcium and Vitamin D deficiency, pregnancy, lactation, osteoporosis."
    )

    p_durex = Product.objects.create(
        category=cat_skin,
        brand=brand_durex,
        requires_prescription=False,
        is_generic=False,
        name="Durex Mutual Climax",
        description="Durex Mutual Climax condoms are designed to help both partners achieve a synchronized climax with ribs, dots, and benzocaine lube.",
        price=Decimal("350.00"),
        original_price=Decimal("380.00"),
        quantity_in_stock=150,
        low_stock_threshold=10,
        is_active=True,
        is_in_homepage=True,
        unit=unit_box_3_cond,
        dosage="Standard",
        rating_avg=Decimal("4.60"),
        review_count=55,
        key_benefits=["Ribbed and dotted texture", "Slowing lubricant for him", "Synchronized pleasure"]
    )

    p_shampoo = Product.objects.create(
        category=cat_hair,
        brand=brand_johnson,
        requires_prescription=False,
        is_generic=False,
        name="Johnson's Baby Shampoo",
        description="Johnson's Baby Shampoo is as gentle to the eyes as pure water. Formulated to minimize risk of allergies.",
        price=Decimal("450.00"),
        original_price=Decimal("480.00"),
        quantity_in_stock=120,
        low_stock_threshold=8,
        is_active=True,
        is_in_homepage=False,
        unit=unit_bottle_100ml,
        dosage="200ml",
        rating_avg=Decimal("4.85"),
        review_count=73,
        key_benefits=["No More Tears formula", "Hypoallergenic", "Soap-free and paraben-free"]
    )

    p_facewash = Product.objects.create(
        category=cat_skin,
        brand=brand_himalaya,
        requires_prescription=False,
        is_generic=False,
        name="Himalaya Neem Face Wash",
        description="Himalaya Purifying Neem Face Wash is a soap-free, herbal formulation that cleans impurities and helps clear pimples.",
        price=Decimal("280.00"),
        original_price=Decimal("300.00"),
        quantity_in_stock=200,
        low_stock_threshold=10,
        is_active=True,
        is_in_homepage=True,
        unit=unit_tube_15g,
        dosage="100ml",
        rating_avg=Decimal("4.65"),
        review_count=138,
        key_benefits=["Controls acne and pimples", "Soap-free herbal formula", "Contains Neem and Turmeric"]
    )

    p_toothpaste = Product.objects.create(
        category=cat_dental,
        brand=brand_sensodyne,
        requires_prescription=False,
        is_generic=False,
        name="Sensodyne Fresh Mint",
        description="Sensodyne Fresh Mint toothpaste provides clinically proven sensitivity relief and all-day protection, with a fresh minty taste.",
        price=Decimal("290.00"),
        original_price=Decimal("320.00"),
        quantity_in_stock=180,
        low_stock_threshold=10,
        is_active=True,
        is_in_homepage=False,
        unit=unit_tube_15g,
        dosage="100g",
        rating_avg=Decimal("4.75"),
        review_count=94,
        key_benefits=["Proven sensitivity relief", "Fresh minty breath", "Protects against cavities"]
    )
    print("Created 15 products successfully.")

    # 13. Seed ProductImage
    print("\n--- Seeding ProductImage ---")
    ProductImage.objects.create(product=p_napa, image=dummy_img("napa_1.jpg"), order=1)
    ProductImage.objects.create(product=p_seclo, image=dummy_img("seclo_1.jpg"), order=1)
    ProductImage.objects.create(product=p_fexo, image=dummy_img("fexo_1.jpg"), order=1)
    ProductImage.objects.create(product=p_monas, image=dummy_img("monas_1.jpg"), order=1)
    print("Seeded product images.")

    # 14. Seed ProductDosage
    print("\n--- Seeding ProductDosage ---")
    ProductDosage.objects.create(product=p_napa, dosage_label="500mg", order=1)
    ProductDosage.objects.create(product=p_napa, dosage_label="650mg", order=2)
    ProductDosage.objects.create(product=p_seclo, dosage_label="20mg", order=1)
    ProductDosage.objects.create(product=p_seclo, dosage_label="40mg", order=2)
    ProductDosage.objects.create(product=p_fexo, dosage_label="120mg", order=1)
    ProductDosage.objects.create(product=p_fexo, dosage_label="180mg", order=2)
    print("Seeded product dosages.")

    # 15. Seed DeliveryMethod
    print("\n--- Seeding DeliveryMethod ---")
    dm_std = DeliveryMethod.objects.create(name="Standard Delivery", delivery_type=DeliveryMethod.DeliveryType.STANDARD, amount=Decimal("60.00"), duration="24-48 Hours", price=Decimal("60.00"), is_active=True, order=1)
    dm_exp = DeliveryMethod.objects.create(name="Express Delivery", delivery_type=DeliveryMethod.DeliveryType.EXPRESS, amount=Decimal("150.00"), duration="2-4 Hours", price=Decimal("150.00"), is_active=True, order=2)
    dm_pickup = DeliveryMethod.objects.create(name="Store Pickup", delivery_type=DeliveryMethod.DeliveryType.STANDARD, amount=Decimal("0.00"), duration="Immediate", price=Decimal("0.00"), is_active=True, order=3)
    print("Seeded delivery methods.")

    # 16. Seed Combos
    print("\n--- Seeding Combos ---")
    combo_fever = Combo.objects.create(
        title="Fever Relief Combo",
        description="A basic relief pack containing Napa 500mg, Napa Extra, and supplementary OTC needs for fever.",
        image=dummy_img("combo_fever.jpg"),
        price=Decimal("70.00"),
        original_price=Decimal("85.00"),
        custom_price=Decimal("68.00"),
        discount_price=Decimal("65.00"),
        bg_color="bg-red-50",
        order=1,
        is_active=True
    )
    combo_fever.products.add(p_napa, p_napa_extra)

    combo_gastric = Combo.objects.create(
        title="Gastric Care Pack",
        description="A comprehensive monthly protection pack for acid reflux, containing Seclo 20mg and Pantonix 20mg.",
        image=dummy_img("combo_gastric.jpg"),
        price=Decimal("130.00"),
        original_price=Decimal("150.00"),
        custom_price=Decimal("120.00"),
        discount_price=Decimal("110.00"),
        bg_color="bg-blue-50",
        order=2,
        is_active=True
    )
    combo_gastric.products.add(p_seclo, p_pantonix)
    print("Seeded product combos.")

    # 17. Seed Ads
    print("\n--- Seeding Ads ---")
    Ad.objects.create(image=dummy_img("ad_1.jpg"), link="http://localhost:3000/shop?category=prescription-medicine", order=1, is_active=True)
    Ad.objects.create(image=dummy_img("ad_2.jpg"), link="http://localhost:3000/shop?brand=square-pharmaceuticals", order=2, is_active=True)
    print("Seeded promotional ads.")

    # 18. Seed AppLogo
    print("\n--- Seeding AppLogo ---")
    AppLogo.objects.create(slug="header", image=dummy_img("logo_header.jpg"))
    AppLogo.objects.create(slug="footer", image=dummy_img("logo_footer.jpg"))
    print("Seeded app logos.")

    # 19. Seed Coupon
    print("\n--- Seeding Coupon ---")
    cp_save10 = Coupon.objects.create(code="SAVE10", discount_type=Coupon.DiscountType.PERCENT, discount_value=Decimal("10.00"), min_order_amount=Decimal("500.00"), is_active=True)
    cp_free50 = Coupon.objects.create(code="FREE50", discount_type=Coupon.DiscountType.FIXED, discount_value=Decimal("50.00"), min_order_amount=Decimal("300.00"), is_active=True)
    cp_welcome = Coupon.objects.create(code="WELCOME100", discount_type=Coupon.DiscountType.FIXED, discount_value=Decimal("100.00"), min_order_amount=Decimal("1000.00"), is_active=True)
    print("Seeded discount coupons.")

    # 20. Seed Prescription
    print("\n--- Seeding Prescriptions ---")
    rx_pending = Prescription.objects.create(
        user=cust1,
        shipping_address=addr1,
        medicine_supply_duration=Prescription.MedicineSupplyDuration.FIFTEEN_DAYS,
        prescription_note="Need Monas 10mg and Zimax 500mg according to this prescription.",
        status=Prescription.Status.PENDING,
        patient_name_on_rx="Shihab Rahman",
        is_seen=False
    )
    PrescriptionImage.objects.create(prescription=rx_pending, image=dummy_img("rx_pending.jpg"), order_display=1)
    PrescriptionStatusHistory.objects.create(prescription=rx_pending, status=Prescription.Status.PENDING)

    rx_approved = Prescription.objects.create(
        user=cust1,
        shipping_address=addr1,
        medicine_supply_duration=Prescription.MedicineSupplyDuration.ONE_MONTH,
        prescription_note="Please approve this long term prescription.",
        status=Prescription.Status.APPROVED,
        patient_name_on_rx="Shihab Rahman",
        doctor_name="Dr. Rafiqul Islam",
        doctor_reg_number="BMDC-12345",
        has_signature=True,
        verified_by=doctor,
        verified_at=timezone.now(),
        is_seen=True
    )
    PrescriptionImage.objects.create(prescription=rx_approved, image=dummy_img("rx_approved.jpg"), order_display=1)
    PrescriptionStatusHistory.objects.create(prescription=rx_approved, status=Prescription.Status.PENDING)
    PrescriptionStatusHistory.objects.create(prescription=rx_approved, status=Prescription.Status.APPROVED)
    PrescriptionItem.objects.create(prescription=rx_approved, product=p_monas, quantity_prescribed=30)
    PrescriptionItem.objects.create(prescription=rx_approved, product=p_zimax, quantity_prescribed=30)
    print("Seeded prescriptions (Pending and Approved).")

    # 21. Seed Orders, OrderItems, OrderSettlements, and PaymentTransactions
    print("\n--- Seeding Orders ---")
    
    # Order 1: Pending, COD
    o1 = Order.objects.create(
        user=cust1,
        delivery_method=dm_std,
        status=Order.Status.PENDING,
        subtotal_before_discount=Decimal("152.00"),
        discount_amount=Decimal("0.00"),
        delivery_fee=Decimal("60.00"),
        total=Decimal("212.00"),
        shipping_address="House 12, Road 5, Gulshan 2, Dhaka",
        notes="Please call before delivery"
    )
    OrderItem.objects.create(order=o1, product=p_napa, quantity=1, price_at_order=Decimal("12.00"), dosage="500mg")
    OrderItem.objects.create(order=o1, product=p_seclo, quantity=2, price_at_order=Decimal("70.00"), dosage="20mg")
    OrderStatusHistory.objects.create(order=o1, status=Order.Status.PENDING)
    OrderSettlement.objects.create(
        order=o1,
        payment_method=OrderSettlement.PaymentMethod.COD,
        payment_status=OrderSettlement.PaymentStatus.PENDING,
        commission_rate=Decimal("0.0500"),
        commission_amount=Decimal("7.60"),
        gross_amount=Decimal("152.00"),
        net_payable=Decimal("144.40"),
        status=OrderSettlement.Status.PENDING
    )

    # Order 2: Delivered, Online (SSLCommerz)
    o2 = Order.objects.create(
        user=cust2,
        delivery_method=dm_exp,
        status=Order.Status.DELIVERED,
        subtotal_before_discount=Decimal("570.00"),
        discount_amount=Decimal("50.00"),
        coupon=cp_free50,
        delivery_fee=Decimal("150.00"),
        total=Decimal("670.00"),
        shipping_address="Flat C1, Nasirabad Heights, Chattogram",
    )
    OrderItem.objects.create(order=o2, product=p_calbo, quantity=2, price_at_order=Decimal("240.00"), dosage="500mg + 200IU")
    OrderItem.objects.create(order=o2, product=p_fexo, quantity=1, price_at_order=Decimal("90.00"), dosage="120mg")
    OrderStatusHistory.objects.create(order=o2, status=Order.Status.PENDING)
    OrderStatusHistory.objects.create(order=o2, status=Order.Status.CONFIRMED)
    OrderStatusHistory.objects.create(order=o2, status=Order.Status.PROCESSING)
    OrderStatusHistory.objects.create(order=o2, status=Order.Status.SHIPPED)
    OrderStatusHistory.objects.create(order=o2, status=Order.Status.DELIVERED)

    OrderSettlement.objects.create(
        order=o2,
        payment_method=OrderSettlement.PaymentMethod.ONLINE,
        payment_status=OrderSettlement.PaymentStatus.PAID,
        commission_rate=Decimal("0.0500"),
        commission_amount=Decimal("28.50"),
        gross_amount=Decimal("570.00"),
        net_payable=Decimal("541.50"),
        status=OrderSettlement.Status.SETTLED,
        settled_at=timezone.now(),
        payout_reference="PAY-OUT-77889"
    )

    PaymentTransaction.objects.create(
        user=cust2,
        order=o2,
        method=PaymentTransaction.Method.ONLINE,
        amount=Decimal("670.00"),
        tran_id="TRANS_ORDER2_1",
        status=PaymentTransaction.Status.SUCCESS,
        verified_at=timezone.now()
    )

    # Order 3: Prescription Order, Approved Rx
    o3 = Order.objects.create(
        user=cust1,
        prescription=rx_approved,
        delivery_method=dm_std,
        status=Order.Status.CONFIRMED,
        subtotal_before_discount=Decimal("1200.00"),
        discount_amount=Decimal("100.00"),
        coupon=cp_welcome,
        delivery_fee=Decimal("60.00"),
        total=Decimal("1160.00"),
        shipping_address="House 12, Road 5, Gulshan 2, Dhaka"
    )
    OrderItem.objects.create(order=o3, product=p_zimax, quantity=1, price_at_order=Decimal("1050.00"), dosage="500mg")
    OrderItem.objects.create(order=o3, product=p_monas, quantity=1, price_at_order=Decimal("150.00"), dosage="10mg")
    OrderStatusHistory.objects.create(order=o3, status=Order.Status.PENDING)
    OrderStatusHistory.objects.create(order=o3, status=Order.Status.CONFIRMED)
    OrderImage.objects.create(order=o3, image=dummy_img("o3_rx_proof.jpg"), order_display=1)

    rx_approved.status = Prescription.Status.USED
    rx_approved.save()

    # Order 4: Bulk B2B Order
    o_b2b = Order.objects.create(
        user=b2b_cust,
        delivery_method=dm_std,
        status=Order.Status.DELIVERED,
        subtotal_before_discount=Decimal("5250.00"),
        discount_amount=Decimal("0.00"),
        delivery_fee=Decimal("60.00"),
        total=Decimal("5310.00"),
        shipping_address="Hasan Pharmacy, House 45, Road 27, Dhanmondi, Dhaka"
    )
    OrderItem.objects.create(order=o_b2b, product=p_zimax, quantity=5, price_at_order=Decimal("1050.00"), dosage="500mg")
    OrderStatusHistory.objects.create(order=o_b2b, status=Order.Status.PENDING)
    OrderStatusHistory.objects.create(order=o_b2b, status=Order.Status.CONFIRMED)
    OrderStatusHistory.objects.create(order=o_b2b, status=Order.Status.PROCESSING)
    OrderStatusHistory.objects.create(order=o_b2b, status=Order.Status.DELIVERED)

    b2b_comm = B2BCommissionEntry.objects.create(
        customer=b2b_profile,
        order=o_b2b,
        commission_rate=Decimal("0.0500"),
        commission_amount=Decimal("262.50"),
        status=B2BCommissionEntry.Status.PENDING,
        note="Bulk purchase commission"
    )

    print("Seeded orders (Pending, Delivered, B2B, Prescription-linked).")

    # 22. Seed ProductReviews
    print("\n--- Seeding ProductReviews ---")
    pr1 = ProductReview.objects.create(user=cust1, product=p_napa, rating=5, title="Excellent", comment="Very effective and fast pain relief.")
    pr2 = ProductReview.objects.create(user=cust2, product=p_napa, rating=4, title="Good", comment="Standard Paracetamol, does the job.")
    pr3 = ProductReview.objects.create(user=cust1, product=p_seclo, rating=5, title="Instant Heartburn Relief", comment="Best medicine for gastric acidity.")
    ProductReviewImage.objects.create(review=pr1, image=dummy_img("review_img.jpg"), order=1)
    print("Seeded product reviews.")

    # 23. Seed Wishlist
    print("\n--- Seeding Wishlist ---")
    WishlistItem.objects.create(user=cust1, product=p_fexo)
    WishlistItem.objects.create(user=cust1, product=p_calbo)
    WishlistItem.objects.create(user=cust2, product=p_napa)
    print("Seeded wishlist items.")

    # 24. Seed Carts
    print("\n--- Seeding Carts ---")
    cart_cust1 = Cart.objects.create(user=cust1)
    CartItem.objects.create(cart=cart_cust1, product=p_toothpaste, quantity=1, original_price_at_order=Decimal("290.00"), price_at_order=Decimal("290.00"), dosage="100g")
    CartItem.objects.create(cart=cart_cust1, combo=combo_fever, quantity=1, original_price_at_order=Decimal("85.00"), price_at_order=Decimal("65.00"), dosage="Standard")
    print("Seeded carts.")

    # 25. Seed Consultations
    print("\n--- Seeding Consultations ---")
    Consultation.objects.create(
        user=cust1,
        doctor=doctor,
        subject="Fever and Sore Throat",
        message="I have been suffering from fever (102°F) and sore throat for 2 days. What should I take?",
        response="Please take Napa 500mg (1 tablet after meal, 3 times a day) and gargle with warm salt water. If fever persists after 3 days, see a doctor.",
        status=Consultation.Status.CLOSED
    )
    Consultation.objects.create(
        user=cust2,
        subject="Skin Rash",
        message="I have developed red itchy spots on my hands after eating shrimp. Please advise.",
        status=Consultation.Status.PENDING
    )
    print("Seeded doctor-patient consultations.")

    # 26. Seed Push Notifications & Campaign
    print("\n--- Seeding Notifications ---")
    campaign_eid = NotificationCampaign.objects.create(
        title="Eid Special Offer!",
        message="Get 10% discount on all vitamins & healthcare supplements using coupon SAVE10.",
        audience_mode=NotificationCampaign.AudienceMode.ALL_ACTIVE,
        status=NotificationCampaign.Status.COMPLETED,
        recipient_count=4
    )
    UserNotification.objects.create(campaign=campaign_eid, user=cust1, title=campaign_eid.title, message=campaign_eid.message, is_read=True, read_at=timezone.now())
    UserNotification.objects.create(campaign=campaign_eid, user=cust2, title=campaign_eid.title, message=campaign_eid.message, is_read=False)

    UserNotificationPreference.objects.create(user=cust1, browser_permission=UserNotificationPreference.BrowserPermission.GRANTED, is_enabled=True)
    sub = UserPushSubscription.objects.create(user=cust1, fcm_token="fcm_token_cust1_placeholder_12345", is_active=True)
    
    NotificationDeliveryLog.objects.create(
        campaign=campaign_eid,
        user=cust1,
        subscription=sub,
        fcm_token="fcm_token_cust1_placeholder_12345",
        status=NotificationDeliveryLog.DeliveryStatus.SUCCESS,
        provider_message_id="msg_id_9900"
    )
    print("Seeded notification preference, subscription, campaign and delivery log.")

    # 27. Seed Blog
    print("\n--- Seeding Blog Posts ---")
    b_cat_wellness = BlogCategory.objects.create(name="Health & Wellness", order=1)
    b_cat_guide = BlogCategory.objects.create(name="Medicine Guide", order=2)

    BlogPost.objects.create(
        title="How to Manage High Blood Pressure",
        category=b_cat_wellness,
        short_description="Learn about lifestyle changes and daily habits that can help you keep your blood pressure in a healthy range.",
        content="<h3>Lifestyle Tips for Hypertension</h3><p>High blood pressure, or hypertension, is a common condition that affects millions of people. You can manage it by: <ul><li>Eating a balanced low-sodium diet</li><li>Exercising at least 30 minutes a day</li><li>Reducing stress</li><li>Monitoring your blood pressure at home regularly</li></ul></p>",
        is_published=True,
        article_image=dummy_img("blog_bp.jpg")
    )

    BlogPost.objects.create(
        title="Understanding Antibiotics: Dos and Don'ts",
        category=b_cat_guide,
        short_description="Why finishing your full antibiotic course is crucial, and the dangers of self-medication.",
        content="<h3>Antibiotic Safety Guidelines</h3><p>Antibiotics are powerful medicines that fight bacterial infections. However, misuse leads to antibiotic resistance. Remember: <ol><li>Never take antibiotics without a doctor's prescription.</li><li>Always complete the full course even if you feel better.</li><li>Never share antibiotics or use leftover ones.</li></ol></p>",
        is_published=True,
        article_image=dummy_img("blog_antibiotics.jpg")
    )
    print("Seeded blog category and health articles.")

    # 28. Seed Page (CMS)
    print("\n--- Seeding Pages (CMS) ---")
    Page.objects.create(slug="about-us", title="About My Pharma", content="My Pharma is a premier online pharmacy platform in Bangladesh dedicated to providing authentic medicines, healthcare items, and personal care products directly to your doorstep.", is_published=True)
    Page.objects.create(slug="privacy-policy", title="Privacy Policy", content="We take your privacy seriously. All prescription uploads and personal information are encrypted and protected securely.", is_published=True)
    Page.objects.create(slug="terms-and-conditions", title="Terms & Conditions", content="By using our platform, you agree to our terms of service. Prescriptions are verified by registered pharmacists before orders are processed.", is_published=True)
    print("Seeded static CMS pages.")

    # 29. Dynamic Fallback Seeding for remaining models
    print("\n--- Dynamic fallback seeding for any unseeded models ---")
    
    # A dictionary of models that were already seeded explicitly
    explicitly_seeded = {
        User, UserAddress, AuditLog, SidebarCategory, Category, Brand, Ingredient,
        Unit, Product, ProductImage, ProductDosage, DeliveryMethod, Combo, Ad,
        AppLogo, Coupon, Prescription, PrescriptionImage, PrescriptionStatusHistory,
        PrescriptionItem, Order, OrderItem, OrderImage, OrderStatusHistory,
        OrderSettlement, PaymentTransaction, B2BCustomerProfile, B2BCommissionEntry,
        ProductReview, ProductReviewImage, Cart, CartItem, Consultation,
        NotificationCampaign, UserNotification, UserPushSubscription,
        NotificationDeliveryLog, UserNotificationPreference, BlogCategory,
        BlogPost, Page, WishlistItem
    }

    # Custom static sets/constants to make choices valid
    bd_districts = ["Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna"]

    # We need to sort dynamically for any models in app_models not explicitly seeded
    unseeded_models = [m for m in app_models if m not in explicitly_seeded]
    
    if unseeded_models:
        print(f"Discovered {len(unseeded_models)} models that were not seeded explicitly. Seeding now...")
        # Topological sorting
        dependencies = {}
        for model in app_models:
            deps = set()
            for field in model._meta.fields:
                if isinstance(field, (models.ForeignKey, models.OneToOneField)):
                    related_model = field.remote_field.model
                    if related_model in app_models and related_model != model:
                        deps.add(related_model)
            dependencies[model] = deps

        sorted_models = []
        visited = set()
        temp_visited = set()

        def visit(m):
            if m in temp_visited:
                return
            if m not in visited:
                temp_visited.add(m)
                for dep in dependencies[m]:
                    visit(dep)
                temp_visited.remove(m)
                visited.add(m)
                sorted_models.append(m)

        for m in app_models:
            visit(m)

        # Filter sorted order down to only the unseeded ones
        sorted_unseeded = [m for m in sorted_models if m in unseeded_models]

        seeded_instances = {model: list(model.objects.all()) for model in app_models}

        for model in sorted_unseeded:
            model_name = model.__name__
            print(f"Fallback seeding model: {model._meta.app_label}.{model_name}...")

            for i in range(2):
                attrs = {}
                for field in model._meta.fields:
                    if isinstance(field, models.AutoField) or getattr(field, 'primary_key', False) or field.name == 'id':
                        continue

                    if isinstance(field, (models.ForeignKey, models.OneToOneField)):
                        related_model = field.remote_field.model
                        field_names = [f.name for f in model._meta.fields]
                        if 'product' in field_names and 'combo' in field_names:
                            if field.name == 'product' and i == 1:
                                attrs[field.name] = None
                                continue
                            if field.name == 'combo' and i == 0:
                                attrs[field.name] = None
                                continue

                        if related_model == model:
                            if i == 0:
                                attrs[field.name] = None
                            else:
                                attrs[field.name] = seeded_instances[model][0] if seeded_instances[model] else None
                        else:
                            rel_instances = seeded_instances.get(related_model, [])
                            if not rel_instances:
                                attrs[field.name] = None
                            else:
                                attrs[field.name] = rel_instances[i] if i < len(rel_instances) else rel_instances[0]
                        continue

                    if field.choices:
                        choices_list = list(field.choices)
                        choice_val = choices_list[i][0] if len(choices_list) > i else choices_list[0][0]
                        attrs[field.name] = choice_val
                        continue

                    if isinstance(field, models.EmailField):
                        attrs[field.name] = f"{model_name.lower()}_{i}@mypharma.com"
                    elif isinstance(field, models.SlugField):
                        slug_str = f"{field.name[:10]}-slug-{i}"
                        attrs[field.name] = slug_str[:field.max_length]
                    elif isinstance(field, models.CharField):
                        if field.name == 'phone':
                            attrs[field.name] = f"+88017000000{i+20}"
                        elif field.name == 'username':
                            attrs[field.name] = f"user_{model_name.lower()}_{i}"
                        elif field.name == 'district':
                            attrs[field.name] = bd_districts[i]
                        elif field.name == 'tran_id':
                            attrs[field.name] = f"TRANS_{model_name.lower().upper()}_{i}"
                        else:
                            val_str = f"{field.name[:15]}_{i}"
                            if field.max_length:
                                val_str = val_str[:field.max_length]
                            attrs[field.name] = val_str
                    elif isinstance(field, models.TextField):
                        attrs[field.name] = f"This is mock text for {field.name} in model {model_name} (instance {i})."
                    elif isinstance(field, models.DecimalField):
                        integer_digits = field.max_digits - field.decimal_places
                        val_int = 1 + i
                        integer_part = str(val_int)
                        if len(integer_part) > integer_digits:
                            integer_part = "0"
                        decimal_part = f"{i}5"[:field.decimal_places].ljust(field.decimal_places, "0")
                        attrs[field.name] = Decimal(f"{integer_part}.{decimal_part}")
                    elif isinstance(field, (models.IntegerField, models.PositiveIntegerField, models.PositiveSmallIntegerField, models.SmallIntegerField)):
                        attrs[field.name] = 10 + i
                    elif isinstance(field, models.FloatField):
                        attrs[field.name] = 1.5 + i
                    elif isinstance(field, models.BooleanField):
                        if field.name in ("is_active", "is_published", "email_verified", "phone_verified", "is_staff", "is_superuser"):
                            attrs[field.name] = True
                        else:
                            attrs[field.name] = (i == 0)
                    elif isinstance(field, (models.DateTimeField, models.DateField)):
                        attrs[field.name] = timezone.now() if isinstance(field, models.DateTimeField) else timezone.now().date()
                    elif isinstance(field, models.JSONField):
                        attrs[field.name] = {"mock_key": f"mock_value_{i}"}
                    elif isinstance(field, (models.ImageField, models.FileField)):
                        if field.null or field.blank:
                            attrs[field.name] = None
                        else:
                            attrs[field.name] = SimpleUploadedFile(
                                name=f"dummy_{i}.jpg",
                                content=b"mock content",
                                content_type="image/jpeg"
                            )

                try:
                    if model_name == 'User':
                        user = model(**attrs)
                        user.set_password("password123")
                        user.save()
                        instance = user
                    else:
                        instance = model.objects.create(**attrs)
                    seeded_instances[model].append(instance)
                except Exception as e:
                    print(f"Error fallback seeding {model_name} (instance {i}): {e}")
                    raise e
    else:
        print("All discovered models are explicitly handled!")

    # 30. Verification report
    print("\n=== SEEDING COMPLETE. VERIFICATION REPORT ===")
    all_correct = True
    for model in app_models:
        count = model.objects.count()
        status = "OK" if count > 0 else "EMPTY (0)"
        if count == 0:
            all_correct = False
        print(f"Model: {model.__name__:<30} | Table: {model._meta.db_table:<35} | Count: {count:<3} | Status: {status}")

    if all_correct:
        print("\nSUCCESS: All tables seeded successfully with realistic data and working relationships!")
    else:
        print("\nWARNING: Some tables do not have records. Please check the logs above.")


if __name__ == "__main__":
    main()
