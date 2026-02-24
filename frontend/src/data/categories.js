// This file simulates a real backend response

const CATEGORIES = [
  {
    id: "cat_000",
    slug: "all-product",
    name: "All Product",
    icon: "/assets/images/icon2.png",
    count: 20,
    order: 0,
    isActive: true,
  },
  {
    id: "cat_001",
    slug: "medicine",
    name: "Medicine",
    icon: "/assets/images/icon1.png",
    count: 1221,
    order: 1,
    isActive: true,
  },
  {
    id: "cat_002",
    slug: "healthcare",
    name: "Healthcare",
    icon: "/assets/images/icon3.png",
    count: 114,
    order: 2,
    isActive: true,
  },
  {
    id: "cat_003",
    slug: "lab-test",
    name: "Lab Test",
    icon: "/assets/images/icon1.png",
    count: 316,
    order: 3,
    isActive: true,
  },
  {
    id: "cat_004",
    slug: "beauty",
    name: "Beauty",
    icon: "/assets/images/icon1.png",
    count: 96,
    order: 4,
    isActive: true,
  },
  {
    id: "cat_005",
    slug: "sexual-wellness",
    name: "Sexual Wellness",
    icon: "/assets/images/icon1.png",
    count: 24,
    order: 5,
    isActive: true,
  },
  {
    id: "cat_006",
    slug: "baby-care",
    name: "Baby Care",
    icon: "/assets/images/icon1.png",
    count: 57,
    order: 6,
    isActive: true,
  },
  {
    id: "cat_007",
    slug: "herbal",
    name: "Herbal",
    icon: "/assets/images/icon1.png",
    count: 75,
    order: 7,
    isActive: true,
  },
  {
    id: "cat_008",
    slug: "home-care",
    name: "Home Care",
    icon: "/assets/images/icon1.png",
    count: 5,
    order: 8,
    isActive: true,
  },
  {
    id: "cat_009",
    slug: "supplement",
    name: "Supplement",
    icon: "/assets/images/icon1.png",
    count: 241,
    order: 9,
    isActive: true,
  },
  {
    id: "cat_010",
    slug: "pet-care",
    name: "Pet Care",
    icon: "/assets/images/icon1.png",
    count: 103,
    order: 10,
    isActive: true,
  },
  {
    id: "cat_011",
    slug: "nutrition",
    name: "Nutrition",
    icon: "/assets/images/icon1.png",
    count: 125,
    order: 11,
    isActive: true,
  },
];

export const getCategories = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        CATEGORIES.filter((cat) => cat.isActive).sort(
          (a, b) => a.order - b.order,
        ),
      );
    }, 300);
  });
};
