
"use client";

import { useState } from "react";
import Image from "next/image";

const slides = [
  {
    title: "Genuine ,",
    highlight: "Medicines",
    title2: "Delivered with Care",
    description:
      "Order authentic prescription and over-the-counter medicines from licensed pharmacies fast, safe, and right to your doorstep.",
    button: "Explore All Medicine",
    image: "/assets/images/hero1.png",
  },
  {
    title: "Fast & Safe",
    highlight: "Medicine Delivery",
    description:
      "We ensure proper storage, handling, and timely delivery of all medicines.",
    button: "Order Now",
    image: "/assets/images/hero1.png",
  },
  {
    title: "Trusted Pharmacies,",
    highlight: "Real Products",
    description:
      "All medicines are sourced directly from verified pharmacies.",
    button: "View Products",
    image: "/assets/images/hero1.png",
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  const prev = () =>
    setCurrent(current === 0 ? slides.length - 1 : current - 1);

  const next = () =>
    setCurrent(current === slides.length - 1 ? 0 : current + 1);

  return (
    <div className="relative overflow-hidden  rounded-3xl bg-linear-to-r from-sky-400 to-blue-600">
      {/* Slides */}
      <div
        className="flex transition-transform duration-500"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            className="min-w-full grid grid-cols-1 lg:grid-cols-2 items-center gap-6 px-6 py-10 lg:px-10 lg:py-16"
          >
            {/* Image box */}
            <div className="order-1 lg:order-0 flex justify-center ">
              <Image
                src={slide.image}
                alt="Medicine"
                width={420}
                height={420}
                className="w-64 sm:w-72 lg:w-full max-w-md object-contain"
              />
            </div>

            {/* Content */}
            <div className="text-white">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
                {slide.title}{" "}
                <span className=" font-semibold font-playfair italic">
                  {slide.highlight} 
                </span> <br />
                {slide.title2}{" "}
              </h1>

              <p className="mt-3 sm:mt-4 text-white/90 max-w-lg text-sm sm:text-base">
                {slide.description}
              </p>

              <button className="mt-5 sm:mt-6 cursor-pointer rounded-full bg-white px-6 py-3 text-blue-600 text-sm sm:text-base font-semibold hover:bg-blue-50 transition">
                {slide.button}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Arrows */}
      <button
        onClick={prev}
        className="absolute right-14 bottom-4 sm:bottom-6 text-white text-3xl"
      >
        ‹
      </button>
      <button
        onClick={next}
        className="absolute right-6 bottom-4 sm:bottom-6 text-white text-3xl"
      >
        ›
      </button>

      {/* Indicators */}
      <div className="absolute left-6 bottom-4 sm:bottom-6 flex gap-2">
        {slides.map((_, i) => (
          <span
            key={i}
            className={`h-1 w-12 sm:w-16 rounded-full ${
              current === i ? "bg-white" : "bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}