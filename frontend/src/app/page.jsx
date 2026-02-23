"use client";

import Link from "next/link";

import { useEffect, useState } from "react";

import Image from "next/image";
import HeroCarousel from "./(public)/components/HeroCarousel";
import { getCategories } from "@/data/categories";
import Sponsors from "./(public)/components/Sponsors";

import PopularProduct from "./(public)/components/PopularProduct";
import UploadPrescriptionBanner from "./(public)/components/UploadPrescriptionBanner";
import BookTestBanner from "./(public)/components/BookTestBanner";
import FeaturedCategory from "./(public)/components/FeaturedCategory";

import SmartHealthBundle from "./(public)/components/SmartHealthBundle";
import DealsSection from "./(public)/components/DealsSection";
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
    <main className="">
      {/* <div className="w-full!">
        <Sidebar ></Sidebar>
      </div> */}

      {/* Main content */}
      <section>
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
