"use client";

import React, { useEffect, useState } from "react";
import { IoCloseSharp } from "react-icons/io5";

import { AiOutlineMenu } from "react-icons/ai";
import Link from "next/link";
import Logo from "./Logo";
import { FaFacebook, FaLinkedin } from "react-icons/fa6";
import { BsInstagram } from "react-icons/bs";
import Image from "next/image";
import { getCategories } from "@/data/categories";
import { LuUpload } from "react-icons/lu";

const MobileDrawer = () => {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
  }, [open]);

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
    <div>
      <button onClick={() => setOpen(true)}>
        <AiOutlineMenu className="font-bold text-2xl" />
      </button>

      <aside>
        {/* overlay while menu open  */}

        {open && (
          <div
            onClick={() => {
              setOpen(false);
            }}
            className="fixed top-0 left-0 w-full h-screen bg-black/60 z-40"
          ></div>
        )}

        <div
          className={`fixed top-0 left-0 w-5/6 overflow-y-scroll  h-full text-black font-bold text-lg text-center bg-imageBG shadow-lg transform ${
            open ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-500 ease-in-out z-50`}
        >
          <div className="py-4">
            <div className="flex justify-between items-center px-4">
              <Link
                href="/"
                className=" block hover:opacity-80 transition-opacity duration-300"
              >
                <Logo className="h-16 w-4/5" />
              </Link>

              <button onClick={() => setOpen(false)} className="">
                <IoCloseSharp className="text-3xl text-primary-500 font-bold" />
              </button>
            </div>
            <div className="flex items-center gap-5 text-xl mt-3 justify-start px-4">
              <FaFacebook />
              <div className="h-6 w-0.5 bg-black/10" />
              <FaLinkedin />
              <div className="h-6 w-0.5 bg-black/10" />
              <BsInstagram />
            </div>

            <div className="flex text-xs mt-3 text-primary-500 px-4">
              <span>Call Us: 01755697233, 09677333000</span>
            </div>
            <hr className=" mt-3 border border-primary-50" />

            {/* Upload button – fixed width-ish */}
            <div className="shrink-0 mt-3">
              <label
                htmlFor="prescription-upload"
                className="inline-flex w-4/5 justify-center items-center gap-2 whitespace-nowrap px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-black shadow-sm cursor-pointer hover:shadow-md hover:bg-gray-50 transition"
              >
                <LuUpload className=" text-sm lg:text-lg text-info-800" />
                Upload Prescription
                <input
                  id="prescription-upload"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                />
              </label>
            </div>

            {/* product categories  */}
            <div className="space-y-3.5 mt-4 p-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => {
                    setActiveCategory(category);
                  }}
                  className={`border-b-2 border-gray-100 text-gray-600 flex  justify-between rounded-[35px] w-full px-3 py-2 text-sm cursor-pointer  transition-all ease-in-out duration-500  ${activeCategory.id === category.id ? "bg-primary-500 text-white" : "bg-white hover:bg-primary-50"}`}
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src={category.icon}
                      alt="icon"
                      width={100}
                      height={100}
                      className="w-3 h-3"
                    />
                    {category.name}
                  </div>
                  <span
                    className={`${activeCategory.id === category.id ? "bg-white/10 rounded-full px-2 py-1" : "bg-none"}`}
                  >
                    {category.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default MobileDrawer;
