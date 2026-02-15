"use client";

import Link from "next/link";

import { useEffect, useState } from "react";

import Image from "next/image";
import HeroCarousel from "./(public)/components/HeroCarousel";
import { getCategories } from "@/data/categories";
import Sponsors from "./(public)/components/Sponsors";
import { IoSearchOutline } from "react-icons/io5";
import { MdKeyboardCommandKey } from "react-icons/md";
import PopularProduct from "./(public)/components/PopularProduct";
import UploadPrescriptionBanner from "./(public)/components/UploadPrescriptionBanner";
import BookTestBanner from "./(public)/components/BookTestBanner";
import FeaturedCategory from "./(public)/components/FeaturedCategory";
import { LuShieldCheck } from "react-icons/lu";
import { FiTruck } from "react-icons/fi";
import SmartHealthBundle from "./(public)/components/SmartHealthBundle";
import DealsSection from "./(public)/components/DealsSection";

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

  return (
    <main className="flex gap-8 w-full px-2.5 lg:px-7 py-6">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col  items-center gap-3  w-3/12   shrink-0  text-black">
        {/* top dropdown container  */}
        <div className="w-full bg-white text-black rounded-2xl shadow p-4 relative">
          {/* Button */}
          <div
            onClick={() => setOpen(!open)}
            className=" flex items-center justify-between rounded-full bg-white text-gray-800  transition cursor-pointer"
          >
            <h3 className="font-bold">{selected}</h3>
            <div>
              <svg
                className={`w-5 h-5 transition-transform ${
                  open ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          {/* Dropdown */}
          {open && (
            <ul className="absolute z-10 mt-2 w-full top-14 left-0 rounded-xl bg-white shadow-lg overflow-hidden p-3 text-gray-600 text-base">
              {categories.map((category) => (
                <li
                  key={category.id}
                  onClick={() => {
                    setSelected(category.name);
                    setActiveCategory(category);
                    setOpen(false);
                  }}
                  className={`border-b-2 border-gray-100 text-gray-600 flex  justify-between rounded-[35px] w-full px-3 py-2 text-lg cursor-pointer transition-all ease-in-out duration-500  ${activeCategory.id === category.id ? "bg-primary-500 text-white" : "bg-white"}`}
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src={category.icon}
                      alt="icon"
                      width={100}
                      height={100}
                      className="w-5 h-5"
                    />
                    {category.name}
                  </div>
                  <span>{category.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Search + categories */}
        <div className="w-full bg-white text-black rounded-2xl shadow p-4 mt-3 ">
          <div className="relative w-full max-w-xl mx-auto mb-5">
            {/* Search Icon */}
            <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-gray-400" />

            {/* Search Input */}
            <input
              type="text"
              placeholder="Search"
              className=" w-full h-12 sm:h-14 pl-12 pr-28 rounded-full border border-gray-200 text-sm sm:text-base text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-100"
            />

            {/* Cmd Button */}
            <button className="absolute right-16 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
              <MdKeyboardCommandKey className="text-lg sm:text-xl text-gray-500" />
            </button>

            {/* K Button */}
            <button className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition">
              <span className="text-sm sm:text-base font-medium">K</span>
            </button>
          </div>

          <div className="space-y-3.5">
            {categories.map((category) => (
              <div
                key={category.id}
                onClick={() => {
                  setActiveCategory(category);
                }}
                className={`border-b-2 border-gray-100 text-gray-600 flex  justify-between rounded-[35px] w-full px-3 py-2 text-lg cursor-pointer hover:bg-primary-50 transition-all ease-in-out duration-500  ${activeCategory.id === category.id ? "bg-primary-500 text-white" : "bg-white"}`}
              >
                <div className="flex items-center gap-3">
                  <Image
                    src={category.icon}
                    alt="icon"
                    width={100}
                    height={100}
                    className="w-5 h-5"
                  />
                  {category.name}
                </div>
                <span>{category.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* app image  */}

        <div className="relative w-full  aspect-[3/4] sm:aspect-[4/5]">
          <Image
            src="/assets/images/applogo.png"
            alt="App Banner"
            fill
            className="w-full "
            priority
          />
        </div>

        <div className="w-full max-w-xl space-y-4">
          {/* Card 1 */}
          <div className="flex items-center gap-4 rounded-lg bg-white px-5 py-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
              <LuShieldCheck className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900">
                Genuine Medicine
              </p>
              <p className="text-sm text-[#6B7280]">100% authentic products</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="flex items-center gap-4 rounded-lg bg-white px-5 py-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
              <FiTruck className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900">
                Fast Delivery
              </p>
              <p className="text-sm text-[#6B7280]">Within Dhaka City</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <section>
        <section className="flex-1 ">
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
