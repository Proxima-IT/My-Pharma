import Image from "next/image";
import React from "react";

const PaymentMethodCard = () => {
  return (
    <div>
      <div className="bg-white rounded-[20px] border border-[#EEEFF2] p-6 shadow-sm w-full max-w-lg">
        {/* Header */}
        <div className="">
          <h2 className="text-2xl font-semibold text-[#0D0E10]">
            Payment Method
          </h2>
          <h2 className="text-xl font-semibold text-gray-800 mt-6">
            Payment options
          </h2>
          <div className="grid grid-cols-4 gap-4 mt-5">
            <div className="border border-gray-100 rounded-lg shadow flex flex-col justify-center items-center py-[14px] px-5">
              <Image
                src="/assets/images/nagad.png"
                alt="Visa"
                width={80}
                height={50}
                className="object-contain p-2"
              />
              <h1 className="text-base font-medium ">Nagad</h1>
            </div>
            <div className="border border-gray-100 rounded-lg shadow flex flex-col justify-center items-center py-[14px] px-5">
              <Image
                src="/assets/images/bkash.png"
                alt="Visa"
                width={80}
                height={50}
                className="object-contain p-2"
              />
              <h1 className="text-base font-medium ">Bkash</h1>
            </div>
            <div className="border border-gray-100 rounded-lg shadow flex flex-col justify-center items-center py-[14px] px-5">
              <Image
                src="/assets/images/rocket.png"
                alt="Visa"
                width={80}
                height={50}
                className="object-contain p-2"
              />
              <h1 className="text-base font-medium ">Rocket</h1>
            </div>
            <div className="border border-gray-100 rounded-lg shadow flex flex-col justify-center items-center py-[14px] px-5">
              <Image
                src="/assets/images/upay.png"
                alt="Visa"
                width={80}
                height={50}
                className="object-contain p-2"
              />
              <h1 className="text-base font-medium ">Upay</h1>
            </div>
            <div className="border border-gray-100 rounded-lg shadow flex flex-col justify-center items-center py-[14px] px-5">
              <Image
                src="/assets/images/ssl.png"
                alt="Visa"
                width={80}
                height={50}
                className="object-contain p-2"
              />
              <h1 className="text-base font-medium text-center">SSL Commerz</h1>
            </div>
            <div className="border border-gray-100 rounded-lg shadow flex flex-col justify-center items-center py-[14px] px-5">
              <Image
                src="/assets/images/card.png"
                alt="Visa"
                width={80}
                height={50}
                className="object-contain p-2"
              />
              <h1 className="text-base font-medium ">Card</h1>
            </div>
            <div className="border border-gray-100 rounded-lg shadow flex flex-col justify-center items-center py-[14px] px-5">
              <Image
                src="/assets/images/cod.png"
                alt="Visa"
                width={80}
                height={50}
                className="object-contain p-2"
              />
              <h1 className="text-base font-medium ">COD</h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodCard;
