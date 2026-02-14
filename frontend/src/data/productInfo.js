import { resolve } from "styled-jsx/css";

export const PRODUCTS = [
  {
    id: "prod_001",
    slug: "nutricost-korean-ginseng-1000mg",
    name: "Nutricost Korean Ginseng 1000mg",
    category: "supplement",
    brand: "Nutricost",
    image: "/assets/images/popularproduct1.png",
    pricing: {
      currency: "BDT",
      price: 1250,
      originalPrice: 1790,
      discountPercent: -27,
    },
    rating: {
      average: 5.0,
      totalReviews: 1200,
    },
    stock: { inStock: true },
    badge: { type: "discount", label: "-27% off" },
    cart: { canAddToCart: true },
  },

  {
    id: "prod_002",
    slug: "cetaphil-moisturising-cream-450gm",
    name: "Cetaphil Moisturising Cream - 450 gm",
    category: "beauty",
    brand: "Cetaphil",
    image: "/assets/images/popularproduct2.png",
    pricing: {
      currency: "BDT",
      price: 1250,
      originalPrice: 1790,
      discountPercent: 27,
    },
    rating: {
      average: 5.0,
      totalReviews: 1200,
    },
    stock: { inStock: true },
    badge: { type: "discount", label: "-27% off" },
    cart: { canAddToCart: true },
  },

  {
    id: "prod_003",
    slug: "omron-digital-blood-pressure-monitor",
    name: "Omron Digital Blood Pressure Monitor",
    category: "healthcare",
    brand: "Omron",
   image: "/assets/images/popularproduct3.png",
    pricing: {
      currency: "BDT",
      price: 2950,
      originalPrice: 3890,
      discountPercent: 24,
    },
    rating: {
      average: 4.8,
      totalReviews: 860,
    },
    stock: { inStock: true },
    badge: { type: "discount", label: "-24% off" },
    cart: { canAddToCart: true },
  },

  {
    id: "prod_004",
    slug: "ensure-original-nutrition-powder-400gm",
    name: "Ensure Original Nutrition Powder - 400 gm",
    category: "nutrition",
    brand: "Ensure",
    image: "/assets/images/popularproduct4.png",
    pricing: {
      currency: "BDT",
      price: 1890,
      originalPrice: 2250,
      discountPercent: 16,
    },
    rating: {
      average: 4.9,
      totalReviews: 540,
    },
    stock: { inStock: true },
    badge: { type: "discount", label: "-16% off" },
    cart: { canAddToCart: true },
  },

  {
    id: "prod_005",
    slug: "himalaya-baby-lotion-200ml",
    name: "Himalaya Baby Lotion - 200 ml",
    category: "baby-care",
    brand: "Himalaya",
   image: "/assets/images/popularproduct1.png",
    pricing: {
      currency: "BDT",
      price: 420,
      originalPrice: 520,
      discountPercent: 19,
    },
    rating: {
      average: 4.7,
      totalReviews: 310,
    },
    stock: { inStock: true },
    badge: { type: "discount", label: "-19% off" },
    cart: { canAddToCart: true },
  },

  {
    id: "prod_006",
    slug: "seven-seas-cod-liver-oil-capsules",
    name: "Seven Seas Cod Liver Oil Capsules",
    category: "supplement",
    brand: "Seven Seas",
    image: "/assets/images/popularproduct1.png",
    pricing: {
      currency: "BDT",
      price: 990,
      originalPrice: 1250,
      discountPercent: 21,
    },
    rating: {
      average: 4.8,
      totalReviews: 430,
    },
    stock: { inStock: true },
    badge: { type: "discount", label: "-21% off" },
    cart: { canAddToCart: true },
  },

  {
    id: "prod_007",
    slug: "savlon-antiseptic-liquid-500ml",
    name: "Savlon Antiseptic Liquid - 500 ml",
    category: "healthcare",
    brand: "Savlon",
    image: "/assets/images/popularproduct1.png",
    pricing: {
      currency: "BDT",
      price: 390,
      originalPrice: 480,
      discountPercent: 19,
    },
    rating: {
      average: 4.9,
      totalReviews: 780,
    },
    stock: { inStock: true },
    badge: { type: "discount", label: "-19% off" },
    cart: { canAddToCart: true },
  },

  {
    id: "prod_008",
    slug: "dabur-honey-1kg",
    name: "Dabur Pure Honey - 1 kg",
    category: "nutrition",
    brand: "Dabur",
    image: "/assets/images/popularproduct1.png",
    pricing: {
      currency: "BDT",
      price: 820,
      originalPrice: 980,
      discountPercent: 16,
    },
    rating: {
      average: 4.8,
      totalReviews: 670,
    },
    stock: { inStock: true },
    badge: { type: "discount", label: "-16% off" },
    cart: { canAddToCart: true },
  },

  {
    id: "prod_009",
    slug: "aci-herbal-face-wash",
    name: "ACI Herbal Face Wash",
    category: "beauty",
    brand: "ACI",
    image: "/assets/images/popularproduct1.png",
    pricing: {
      currency: "BDT",
      price: 320,
      originalPrice: 390,
      discountPercent: 18,
    },
    rating: {
      average: 4.6,
      totalReviews: 250,
    },
    stock: { inStock: true },
    badge: { type: "discount", label: "-18% off" },
    cart: { canAddToCart: true },
  },

  {
    id: "prod_010",
    slug: "pedigree-adult-dog-food-3kg",
    name: "Pedigree Adult Dog Food - 3 kg",
    category: "pet-care",
    brand: "Pedigree",
    image: "/assets/images/popularproduct1.png",
    pricing: {
      currency: "BDT",
      price: 2150,
      originalPrice: 2590,
      discountPercent: 17,
    },
    rating: {
      average: 4.9,
      totalReviews: 410,
    },
    stock: { inStock: true },
    badge: { type: "discount", label: "-17% off" },
    cart: { canAddToCart: true },
  },
];


export const getProducts = async () => {
  return new Promise((resolve) =>{
    setTimeout(() => {
      resolve(PRODUCTS);
    }, 500); 
  })
}