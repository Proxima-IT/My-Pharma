import Sidebar from "@/app/(public)/components/Sidebar";
import React from "react";
import ProductSummaryCard from "./components/ProductSummaryCard";
import BundleSlider from "../../home/components/BundleSlider";
import CartCard from "../../cart/components/CartCard";
import PopularProduct from "../../home/components/PopularProduct";
import UploadPrescriptionBanner from "../../home/components/UploadPrescriptionBanner";

const ProductSingle = () => {
  return (
    <div>
      <div className="flex gap-5 px-7 pt-7 pb-20">
        {/* sidebar  */}
        <div className="">
          <Sidebar></Sidebar>
        </div>
        {/* middle content */}
        <div className="w-5/12">
          <div>breadcrumb</div>
          <div>carousel</div>
          <div>3 tabs</div>
        </div>
        {/* right content  */}
        <div className="w-4/12 flex flex-col gap-5">
          <ProductSummaryCard></ProductSummaryCard>
          <BundleSlider cardsToShow={1}></BundleSlider>
          <CartCard></CartCard>
        </div>
      </div>
      <PopularProduct></PopularProduct>
      <UploadPrescriptionBanner></UploadPrescriptionBanner>
    </div>
  );
};

export default ProductSingle;
