"use client";

import Link from "next/link";

import { useEffect, useState } from "react";

import { getCategories } from "@/data/categories";

import DealsSection from "./(public)/(pages)/home/components/DealsSection";
import Sponsors from "./(public)/(pages)/home/components/Sponsors";
import PopularProduct from "./(public)/(pages)/home/components/PopularProduct";
import UploadPrescriptionBanner from "./(public)/(pages)/home/components/UploadPrescriptionBanner";
import BookTestBanner from "./(public)/(pages)/home/components/BookTestBanner";
import FeaturedCategory from "./(public)/(pages)/home/components/FeaturedCategory";
import SmartHealthBundle from "./(public)/(pages)/home/components/SmartHealthBundle";
import HeroCarousel from "./(public)/(pages)/home/components/HeroCarousel";
import Sidebar from "./(public)/components/Sidebar";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("All Product Category");

  useEffect(() => {
    const loadCategories = async () => {
      const data = await getCategories();
      console.log(data);
      setCategories(data);
    };
    loadCategories();
  }, []);

  console.log(categories);
  // className="flex gap-8 w-full px-2.5 lg:px-7 py-6"

  return (
    <main className="lg:flex lg:gap-8 w-full px-2.5 lg:px-7 py-6">
      <div className="w-3/12 sticky top-0 h-screen overflow-y-auto">
        <Sidebar></Sidebar>
      </div>

      {/* Main content */}
      <section className="flex-1 min-w-0">
        <section>
          <HeroCarousel />
          <Sponsors></Sponsors>
          <PopularProduct></PopularProduct>
          <UploadPrescriptionBanner></UploadPrescriptionBanner>
          <PopularProduct></PopularProduct>
          <BookTestBanner></BookTestBanner>
          <FeaturedCategory></FeaturedCategory>
          <SmartHealthBundle></SmartHealthBundle>
          <DealsSection></DealsSection>
        </section>

        {activeCategory ? <div>{activeCategory.name}</div> : ""}
      </section>
    </main>
  );
}
