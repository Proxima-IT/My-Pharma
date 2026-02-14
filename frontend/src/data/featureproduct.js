// This file simulates a real backend response

export const FeaturedProduct = [
  {
    id: "01",
    slug: "Haircare",
    name: "Haircare",
    image: "/assets/images/prod1.png",
    quantity: 100,
  },
  {
    id: "02",
    slug: "Herb Care",
    name: "Herb Care",
    image: "/assets/images/prod2.png",
    quantity: 25,
  },
  {
    id: "03",
    slug: "Medical Devices",
    name: "Medical Devices",
    image: "/assets/images/prod3.png",
    quantity: 15,
  },
  {
    id: "04",
    slug: "Supplement",
    name: "Supplement",
    image: "/assets/images/prod4.png",
    quantity: 40,
  },
  {
    id: "05",
    slug: "Healthcare",
    name: "Healthcare",
    image: "/assets/images/prod5.png",
    quantity: 5,
  },
  {
    id: "06",
    slug: "Veterinary",
    name: "Veterinary",
    image: "/assets/images/prod7.png",
    quantity: 120,
  },
  {
    id: "07",
    slug: "clearance-sale",
    name: "Clearance Sale",
   image: "/assets/images/prod7.png",
    quantity: 85,
  },
  {
    id: "08",
    slug: "electronics",
    name: "Electronics",
    image: "/assets/images/prod7.png",
    quantity: 30,
  },
  {
    id: "09",
    slug: "home-decor",
    name: "Home Decor",
    image: "/assets/images/prod7.png",
    quantity: 55,
  },
  {
    id: "10",
    slug: "gift-cards",
    name: "Gift Cards",
    image: "/assets/images/prod7.png",
    quantity: 200,
  },
];

export const getFeaturedProducts = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(FeaturedProduct);
    }, 500);
  });
};
