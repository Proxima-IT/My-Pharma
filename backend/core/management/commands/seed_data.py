"""
Management command to seed the database with realistic Bangladeshi pharmacy data.
Usage: python manage.py seed_data
"""
import random
import json
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from core.models import Brand, Ingredient, Unit, Category, Product, ProductDosage


# ── Raw Data ──────────────────────────────────────────────────────────────────

BRANDS = [
    "Square Pharmaceuticals", "Beximco Pharmaceuticals", "Incepta Pharmaceuticals",
    "Renata Limited", "Opsonin Pharma", "ACI Limited", "Eskayef Pharmaceuticals",
    "Aristopharma", "ACME Laboratories", "Healthcare Pharmaceuticals",
    "Drug International", "Globe Pharmaceuticals", "Jayson Pharmaceuticals",
    "Navana Pharmaceuticals", "Popular Pharmaceuticals", "Radiant Pharmaceuticals",
    "Sanofi Bangladesh", "UniMed UniHealth", "General Pharmaceuticals", "Ibn Sina Pharmaceuticals",
]

INGREDIENTS = [
    "Paracetamol", "Amoxicillin", "Azithromycin", "Ciprofloxacin", "Metformin",
    "Omeprazole", "Losartan", "Amlodipine", "Atorvastatin", "Montelukast",
    "Cetirizine", "Diclofenac Sodium", "Esomeprazole", "Pantoprazole", "Rabeprazole",
    "Clopidogrel", "Metoprolol", "Ramipril", "Domperidone", "Ranitidine",
    "Fluconazole", "Ibuprofen", "Levofloxacin", "Doxycycline", "Cefixime",
    "Cefuroxime", "Salbutamol", "Fluticasone", "Calcium Carbonate", "Vitamin D3",
    "Folic Acid", "Iron (Ferrous Sulfate)", "Zinc Sulfate", "Desloratadine",
    "Fexofenadine", "Sildenafil", "Tadalafil", "Lisinopril", "Valsartan",
    "Rosuvastatin",
]

UNITS_DATA = [
    ("Strip", "Tablets", 10), ("Strip", "Tablets", 14), ("Strip", "Tablets", 20),
    ("Strip", "Tablets", 30), ("Strip", "Capsules", 10), ("Strip", "Capsules", 14),
    ("Bottle", "ml Syrup", 60), ("Bottle", "ml Syrup", 100), ("Bottle", "ml Syrup", 200),
    ("Bottle", "ml Suspension", 60), ("Bottle", "ml Suspension", 100),
    ("Tube", "gm Cream", 10), ("Tube", "gm Cream", 15), ("Tube", "gm Cream", 30),
    ("Tube", "gm Ointment", 15), ("Tube", "gm Gel", 20),
    ("Box", "Sachets", 10), ("Box", "Sachets", 20),
    ("Vial", "ml Injection", 1), ("Vial", "ml Injection", 5),
    ("Inhaler", "Doses", 120), ("Inhaler", "Doses", 200),
    ("Bottle", "ml Eye Drops", 5), ("Bottle", "ml Eye Drops", 10),
    ("Bottle", "ml Nasal Spray", 15),
]

CATEGORIES = [
    {"name": "Medicines", "children": [
        "Pain & Fever", "Antibiotics", "Antacids & Gastric", "Diabetes",
        "Heart & Blood Pressure", "Allergy & Asthma", "Vitamins & Supplements",
        "Skin Care", "Eye & ENT", "Mental Health",
    ]},
    {"name": "Healthcare Devices", "children": [
        "Blood Pressure Monitors", "Glucometers", "Thermometers", "Nebulizers",
    ]},
    {"name": "Personal Care", "children": [
        "Oral Care", "Hair Care", "Feminine Hygiene",
    ]},
    {"name": "Baby Care", "children": [
        "Baby Food", "Diapers", "Baby Skin Care",
    ]},
]

# (name, ingredient_key, dosages, category_child, unit_indices, base_price, is_generic, therapeutic, storage, description)
PRODUCTS = [
    ("Napa 500mg", "Paracetamol", ["500mg"], "Pain & Fever", [0], 18, False, "Analgesic & Antipyretic", "Below 30°C", "Effective relief from mild to moderate pain and fever. Widely trusted paracetamol formulation."),
    ("Napa Extra", "Paracetamol", ["500mg+65mg"], "Pain & Fever", [0], 35, False, "Analgesic & Antipyretic", "Below 30°C", "Enhanced pain relief with added caffeine for faster absorption."),
    ("Napa Syrup", "Paracetamol", ["120mg/5ml"], "Pain & Fever", [7], 45, False, "Analgesic & Antipyretic", "Below 25°C", "Paracetamol oral suspension for children. Pleasant orange flavor."),
    ("Ace 500mg", "Paracetamol", ["500mg"], "Pain & Fever", [0], 15, True, "Analgesic & Antipyretic", "Below 30°C", "Generic paracetamol tablet for effective fever and pain management."),
    ("Moxacil 500", "Amoxicillin", ["250mg", "500mg"], "Antibiotics", [4], 80, False, "Penicillin Antibiotic", "Below 25°C", "Broad-spectrum penicillin antibiotic for bacterial infections."),
    ("Amoxil 250", "Amoxicillin", ["250mg"], "Antibiotics", [9], 55, False, "Penicillin Antibiotic", "Below 25°C", "Amoxicillin suspension for pediatric bacterial infections."),
    ("Zimax 500", "Azithromycin", ["250mg", "500mg"], "Antibiotics", [0, 2], 120, False, "Macrolide Antibiotic", "Below 30°C", "Azithromycin for respiratory, skin and soft tissue infections."),
    ("Azicin 500", "Azithromycin", ["500mg"], "Antibiotics", [0], 95, True, "Macrolide Antibiotic", "Below 30°C", "Generic azithromycin for short-course antibiotic therapy."),
    ("Ciprocin 500", "Ciprofloxacin", ["250mg", "500mg"], "Antibiotics", [0], 70, False, "Fluoroquinolone Antibiotic", "Below 30°C", "Ciprofloxacin for urinary tract and gastrointestinal infections."),
    ("Metformin SR", "Metformin", ["500mg", "850mg", "1000mg"], "Diabetes", [2], 65, False, "Biguanide Antidiabetic", "Below 30°C", "Sustained-release metformin for type 2 diabetes management."),
    ("Comet 500", "Metformin", ["500mg"], "Diabetes", [0], 40, True, "Biguanide Antidiabetic", "Below 30°C", "Generic metformin for blood sugar control in type 2 diabetes."),
    ("Seclo 20", "Omeprazole", ["20mg", "40mg"], "Antacids & Gastric", [0, 5], 50, False, "Proton Pump Inhibitor", "Below 25°C", "Omeprazole capsules for GERD, peptic ulcers, and acid reflux."),
    ("Losectil 20", "Omeprazole", ["20mg"], "Antacids & Gastric", [4], 35, True, "Proton Pump Inhibitor", "Below 25°C", "Generic omeprazole for gastric acid suppression."),
    ("Nexum 20", "Esomeprazole", ["20mg", "40mg"], "Antacids & Gastric", [0], 90, False, "Proton Pump Inhibitor", "Below 25°C", "Esomeprazole for severe GERD and erosive esophagitis."),
    ("Pantonix 40", "Pantoprazole", ["20mg", "40mg"], "Antacids & Gastric", [0], 60, False, "Proton Pump Inhibitor", "Below 30°C", "Pantoprazole for acid-related gastrointestinal disorders."),
    ("Cozaar 50", "Losartan", ["25mg", "50mg", "100mg"], "Heart & Blood Pressure", [2], 85, False, "Angiotensin II Receptor Blocker", "Below 30°C", "Losartan for hypertension and diabetic nephropathy."),
    ("Amlopin 5", "Amlodipine", ["5mg", "10mg"], "Heart & Blood Pressure", [0], 30, False, "Calcium Channel Blocker", "Below 30°C", "Amlodipine for hypertension and chronic stable angina."),
    ("Atova 10", "Atorvastatin", ["10mg", "20mg", "40mg"], "Heart & Blood Pressure", [2], 75, False, "HMG-CoA Reductase Inhibitor", "Below 30°C", "Atorvastatin for cholesterol management and cardiovascular risk."),
    ("Rosuva 10", "Rosuvastatin", ["5mg", "10mg", "20mg"], "Heart & Blood Pressure", [2], 95, False, "HMG-CoA Reductase Inhibitor", "Below 30°C", "Rosuvastatin for high cholesterol and triglyceride levels."),
    ("Monalast 10", "Montelukast", ["4mg", "5mg", "10mg"], "Allergy & Asthma", [2], 55, False, "Leukotriene Receptor Antagonist", "Below 30°C", "Montelukast for asthma prophylaxis and allergic rhinitis."),
    ("Alocet 10", "Cetirizine", ["5mg", "10mg"], "Allergy & Asthma", [2], 25, False, "Antihistamine", "Below 30°C", "Cetirizine for seasonal allergies, urticaria, and rhinitis."),
    ("Fexo 120", "Fexofenadine", ["60mg", "120mg", "180mg"], "Allergy & Asthma", [2], 65, False, "Non-sedating Antihistamine", "Below 30°C", "Fexofenadine for chronic urticaria without drowsiness."),
    ("Deslora 5", "Desloratadine", ["5mg"], "Allergy & Asthma", [0], 45, False, "Non-sedating Antihistamine", "Below 25°C", "Desloratadine for long-acting allergy relief."),
    ("Ventolin Inhaler", "Salbutamol", ["100mcg/puff"], "Allergy & Asthma", [20], 180, False, "Bronchodilator", "Below 30°C", "Salbutamol metered-dose inhaler for acute asthma relief."),
    ("Flixotide Inhaler", "Fluticasone", ["125mcg/puff", "250mcg/puff"], "Allergy & Asthma", [21], 350, False, "Inhaled Corticosteroid", "Below 30°C", "Fluticasone inhaler for long-term asthma control."),
    ("Voltalin 50", "Diclofenac Sodium", ["25mg", "50mg"], "Pain & Fever", [0], 28, False, "NSAID", "Below 30°C", "Diclofenac for inflammation, pain, and musculoskeletal conditions."),
    ("A-Fenac Gel", "Diclofenac Sodium", ["1%"], "Skin Care", [15], 60, False, "Topical NSAID", "Below 30°C", "Topical diclofenac gel for localized pain and inflammation."),
    ("Ibufen 400", "Ibuprofen", ["200mg", "400mg"], "Pain & Fever", [0], 22, False, "NSAID", "Below 30°C", "Ibuprofen for mild-to-moderate pain, fever, and inflammation."),
    ("Cef-3 200", "Cefixime", ["200mg", "400mg"], "Antibiotics", [4], 150, False, "3rd Gen Cephalosporin", "Below 25°C", "Cefixime for UTI, pharyngitis, and respiratory infections."),
    ("Cefotil 500", "Cefuroxime", ["250mg", "500mg"], "Antibiotics", [0], 180, False, "2nd Gen Cephalosporin", "Below 25°C", "Cefuroxime for sinusitis, otitis media, and skin infections."),
    ("Doxicap 100", "Doxycycline", ["100mg"], "Antibiotics", [4], 40, False, "Tetracycline Antibiotic", "Below 30°C", "Doxycycline for acne, respiratory, and tick-borne infections."),
    ("Levoflox 500", "Levofloxacin", ["250mg", "500mg"], "Antibiotics", [0], 110, False, "Fluoroquinolone Antibiotic", "Below 30°C", "Levofloxacin for community-acquired pneumonia and UTI."),
    ("Flucon 150", "Fluconazole", ["50mg", "150mg"], "Antibiotics", [0], 55, False, "Antifungal", "Below 30°C", "Fluconazole for fungal infections including candidiasis."),
    ("Clopid 75", "Clopidogrel", ["75mg"], "Heart & Blood Pressure", [2], 70, False, "Antiplatelet", "Below 30°C", "Clopidogrel for prevention of thrombotic cardiovascular events."),
    ("Metocard 50", "Metoprolol", ["25mg", "50mg", "100mg"], "Heart & Blood Pressure", [2], 35, False, "Beta-Blocker", "Below 30°C", "Metoprolol succinate for hypertension and heart failure."),
    ("Ramace 5", "Ramipril", ["2.5mg", "5mg", "10mg"], "Heart & Blood Pressure", [2], 45, False, "ACE Inhibitor", "Below 25°C", "Ramipril for hypertension and post-MI cardiac protection."),
    ("Valsart 80", "Valsartan", ["40mg", "80mg", "160mg"], "Heart & Blood Pressure", [2], 80, False, "Angiotensin II Receptor Blocker", "Below 30°C", "Valsartan for hypertension and chronic heart failure."),
    ("Domperon 10", "Domperidone", ["10mg"], "Antacids & Gastric", [0], 20, False, "Prokinetic", "Below 30°C", "Domperidone for nausea, vomiting, and gastroparesis."),
    ("Ranidin 150", "Ranitidine", ["150mg"], "Antacids & Gastric", [0], 18, False, "H2 Receptor Antagonist", "Below 30°C", "Ranitidine for peptic ulcers and GERD symptom relief."),
    ("Rabet 20", "Rabeprazole", ["10mg", "20mg"], "Antacids & Gastric", [0], 55, False, "Proton Pump Inhibitor", "Below 25°C", "Rabeprazole for duodenal ulcers and GERD."),
    ("Calbo D", "Calcium Carbonate", ["500mg+200IU"], "Vitamins & Supplements", [2], 120, False, "Calcium Supplement", "Below 30°C", "Calcium with Vitamin D3 for bone health and osteoporosis prevention."),
    ("D-Rise 20000", "Vitamin D3", ["20000IU", "40000IU"], "Vitamins & Supplements", [4], 30, False, "Vitamin Supplement", "Below 25°C", "High-dose Vitamin D3 capsule for deficiency correction."),
    ("Folison 5", "Folic Acid", ["5mg"], "Vitamins & Supplements", [2], 15, False, "B-Vitamin Supplement", "Below 30°C", "Folic acid for pregnancy support and megaloblastic anemia."),
    ("Ferogen XT", "Iron (Ferrous Sulfate)", ["100mg+0.5mg"], "Vitamins & Supplements", [0], 55, False, "Iron Supplement", "Below 30°C", "Iron with folic acid for iron-deficiency anemia."),
    ("Zinc 20", "Zinc Sulfate", ["20mg"], "Vitamins & Supplements", [2], 25, False, "Mineral Supplement", "Below 30°C", "Zinc supplementation for immune support and diarrhea management."),
    ("Topcef DS", "Cefixime", ["100mg/5ml"], "Antibiotics", [10], 160, False, "3rd Gen Cephalosporin", "Below 25°C", "Cefixime dry suspension for pediatric bacterial infections."),
    ("Lisoril 5", "Lisinopril", ["5mg", "10mg", "20mg"], "Heart & Blood Pressure", [2], 40, False, "ACE Inhibitor", "Below 30°C", "Lisinopril for hypertension and congestive heart failure."),
    ("Sildena 50", "Sildenafil", ["25mg", "50mg", "100mg"], "Medicines", [0], 60, False, "PDE-5 Inhibitor", "Below 30°C", "Sildenafil for erectile dysfunction management."),
    ("Tadora 20", "Tadalafil", ["5mg", "10mg", "20mg"], "Medicines", [0], 80, False, "PDE-5 Inhibitor", "Below 30°C", "Tadalafil for ED with extended duration of action."),
    ("Eye Mo", "Cetirizine", [], "Eye & ENT", [22], 45, False, "Ophthalmic", "Below 25°C", "Sterile eye drops for allergic conjunctivitis relief."),
]


class Command(BaseCommand):
    help = "Seed database with realistic Bangladeshi pharmacy data"

    def handle(self, *args, **options):
        self.stdout.write("🔄 Seeding pharmacy data...\n")

        # 1. Brands
        brand_map = {}
        for name in BRANDS:
            obj, created = Brand.objects.get_or_create(
                slug=slugify(name), defaults={"name": name}
            )
            brand_map[name] = obj
        self.stdout.write(f"  ✅ {len(BRANDS)} brands ready")

        # 2. Ingredients
        ing_map = {}
        for name in INGREDIENTS:
            obj, created = Ingredient.objects.get_or_create(
                slug=slugify(name), defaults={"name": name}
            )
            ing_map[name] = obj
        self.stdout.write(f"  ✅ {len(INGREDIENTS)} ingredients ready")

        # 3. Units
        unit_list = []
        for ut, ct, qty in UNITS_DATA:
            slug = slugify(f"{ut} of {qty} {ct}")
            obj, created = Unit.objects.get_or_create(
                unit_type=ut, content_type=ct, quantity=qty,
                defaults={"slug": slug},
            )
            unit_list.append(obj)
        self.stdout.write(f"  ✅ {len(UNITS_DATA)} units ready")

        # 4. Categories
        cat_map = {}
        for group in CATEGORIES:
            parent, _ = Category.objects.get_or_create(
                slug=slugify(group["name"]),
                defaults={"name": group["name"], "is_active": True, "is_featured_home": True},
            )
            cat_map[group["name"]] = parent
            for child_name in group["children"]:
                child, _ = Category.objects.get_or_create(
                    slug=slugify(child_name),
                    defaults={"name": child_name, "parent": parent, "is_active": True},
                )
                cat_map[child_name] = child
        self.stdout.write(f"  ✅ {len(cat_map)} categories ready")

        # 5. Products
        brand_names = list(brand_map.keys())
        created_count = 0
        for (name, ing_key, dosages, cat_key, unit_idxs, base_price,
             is_generic, therapeutic, storage, desc) in PRODUCTS:
            slug = slugify(name)
            if Product.objects.filter(slug=slug).exists():
                continue

            brand = brand_map[random.choice(brand_names)]
            ingredient = ing_map.get(ing_key)
            category = cat_map.get(cat_key)
            unit = unit_list[unit_idxs[0]] if unit_idxs else None

            # Price with realistic variation
            price = Decimal(str(base_price))
            original_price = price * Decimal(str(random.choice([1.0, 1.10, 1.15, 1.20, 1.25])))
            original_price = original_price.quantize(Decimal("0.01"))

            product = Product.objects.create(
                name=name,
                slug=slug,
                brand=brand,
                ingredient=ingredient,
                category=category,
                unit=unit,
                price=price,
                original_price=original_price if original_price > price else None,
                quantity_in_stock=random.randint(20, 500),
                low_stock_threshold=random.choice([5, 10, 15]),
                is_active=True,
                is_generic=is_generic,
                requires_prescription=random.choice([True, False, False, False]),
                dosage=dosages[0] if dosages else "",
                description=desc,
                therapeutic_class=therapeutic,
                storage_conditions=storage,
                rating_avg=Decimal(str(round(random.uniform(3.5, 5.0), 2))),
                review_count=random.randint(10, 2000),
                indications=f"Indicated for conditions treated by {ing_key}.",
                mode_of_action=f"Works by the pharmacological mechanism of {therapeutic.lower()}.",
                faq=json.dumps([
                    {"question": f"What is {name} used for?", "answer": desc},
                    {"question": f"How should I take {name}?", "answer": "Follow your doctor's instructions. Typically taken with water."},
                ]),
            )

            # Create dosage options
            for idx, d in enumerate(dosages):
                ProductDosage.objects.get_or_create(
                    product=product, dosage_label=d,
                    defaults={"order": idx},
                )

            created_count += 1

        self.stdout.write(f"  ✅ {created_count} products created")
        self.stdout.write(self.style.SUCCESS(f"\n🎉 Seeding complete! Total: {Brand.objects.count()} brands, {Ingredient.objects.count()} ingredients, {Unit.objects.count()} units, {Category.objects.count()} categories, {Product.objects.count()} products"))
