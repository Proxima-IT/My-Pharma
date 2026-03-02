import Link from "next/link";
import React from "react";
import { MdKeyboardArrowLeft } from "react-icons/md";
import ShippingAddressCard from "../cart/components/ShippingAddressCard";
import PrescriptionOrderForm from "./components/PrescriptionOrderForm";
import Upload from "./components/Upload";

const UploadPrescription = () => {
  return (
    <div className="px-7 pt-7 pb-28">
      {/* page heading  */}
      <div className="flex items-center gap-5">
        <Link href="/products">
          <button className="border border-info-500/10 bg-white rounded-[90px] px-3 lg:px-6 py-2 lg:py-1.5 text-center text-primary-500 flex gap-2 items-center text-sm font-semibold cursor-pointer">
            <span>
              <MdKeyboardArrowLeft />
            </span>
            Back
          </button>
        </Link>
        <h1 className="text-3xl font-semibold">Upload Prescription</h1>
      </div>

      {/* upload prescription box */}
      <div className="mt-6 w-full flex gap-7 items-start">
        <div className="w-[55%] grid grid-cols-1 gap-4">
          <Upload></Upload>
        </div>
        <div className="w-[45%] flex flex-col gap-7 ">
          <ShippingAddressCard></ShippingAddressCard>
          <PrescriptionOrderForm></PrescriptionOrderForm>
        </div>
      </div>
    </div>
  );
};

export default UploadPrescription;
