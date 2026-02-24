import Image from "next/image";
import React from "react";
import { MdArrowForwardIos } from "react-icons/md";
import { TbCurrencyTaka } from "react-icons/tb";
import BundleSlider from "./BundleSlider";

const SmartHealthBundle = () => {
  return (
    <div className="  pt-[70px] px-4 ">
      <BundleSlider />
    </div>
  );
};

export default SmartHealthBundle;

// "use client";

// import Image from "next/image";
// import React, { useRef, useState } from "react";
// import { MdArrowForwardIos } from "react-icons/md";
// import { TbCurrencyTaka } from "react-icons/tb";

// const SmartHealthBundle = () => {
//   // ====== SLIDER STATE & REF ======
//   const scrollContainerRef = useRef(null);
//   const [canScrollLeft, setCanScrollLeft] = useState(false);
//   const [canScrollRight, setCanScrollRight] = useState(true);

//   // ====== SLIDER DATA (your cards as data) ======
//   const bundles = [
//     {
//       id: 1,
//       title: "Health Combo Packages",
//       description: "Designed for daily and long-term care",
//       price: "1,250",
//       oldPrice: "1,250",
//       bgColor: "bg-[#B0E5C7]",
//       image: "/assets/images/bundle1.png",
//       imageClass: "max-w-[75%] max-h-[75%]",
//     },
//     {
//       id: 2,
//       title: "Baby Care Combo Packages",
//       description: "Designed for daily and long-term care",
//       price: "5,250",
//       oldPrice: "1,790",
//       bgColor: "bg-[#B0B0FD]",
//       image: "/assets/images/bundle2.png",
//       imageClass: "max-w-[75%] max-h-[75%]",
//     },
//     {
//       id: 3,
//       title: "Handwash Combo Packages",
//       description: "Designed for daily and long-term care",
//       price: "4,250",
//       oldPrice: "1,790",
//       bgColor: "bg-[#B0E5C7]",
//       image: "/assets/images/bundle3.png",
//       imageClass: "max-w-[75%] max-h-[45%]",
//     },
//     // ====== ADD MORE CARDS HERE IF NEEDED ======
//     {
//       id: 4,
//       title: "Baby Care Combo Packages",
//       description: "Designed for daily and long-term care",
//       price: "5,250",
//       oldPrice: "1,790",
//       bgColor: "bg-[#B0B0FD]",
//       image: "/assets/images/bundle2.png",
//       imageClass: "max-w-[75%] max-h-[75%]",
//     },
//     {
//       id: 5,
//       title: "Health Combo Packages",
//       description: "Designed for daily and long-term care",
//       price: "1,250",
//       oldPrice: "1,250",
//       bgColor: "bg-[#B0E5C7]",
//       image: "/assets/images/bundle1.png",
//       imageClass: "max-w-[75%] max-h-[75%]",
//     },
//   ];

//   // ====== CHECK SCROLL POSITION ======
//   const checkScrollButtons = () => {
//     const container = scrollContainerRef.current;
//     if (container) {
//       setCanScrollLeft(container.scrollLeft > 0);
//       setCanScrollRight(
//         container.scrollLeft < container.scrollWidth - container.clientWidth - 10
//       );
//     }
//   };

//   // ====== SCROLL HANDLERS ======
//   const scrollLeft = () => {
//     const container = scrollContainerRef.current;
//     if (container) {
//       const cardWidth = container.querySelector(".bundle-card")?.offsetWidth || 0;
//       const gap = 20; // gap-5 = 20px
//       container.scrollBy({
//         left: -(cardWidth + gap),
//         behavior: "smooth",
//       });
//       setTimeout(checkScrollButtons, 300);
//     }
//   };

//   const scrollRight = () => {
//     const container = scrollContainerRef.current;
//     if (container) {
//       const cardWidth = container.querySelector(".bundle-card")?.offsetWidth || 0;
//       const gap = 20; // gap-5 = 20px
//       container.scrollBy({
//         left: cardWidth + gap,
//         behavior: "smooth",
//       });
//       setTimeout(checkScrollButtons, 300);
//     }
//   };

//   return (
//     <div className="pt-[70px] px-4">
//       {/* ====== HEADER (unchanged) ====== */}
//       <div className="flex justify-between items-center">
//         <h1 className="font-bold text-2xl">
//           Smart health bundles at better value
//         </h1>

//         {/* ====== SLIDER BUTTONS (added onClick handlers) ====== */}
//         <div className="flex items-center gap-3">
//           <button
//             onClick={scrollLeft}
//             disabled={!canScrollLeft}
//             className={`border rounded-full p-3 text-black rotate-180 flex items-center text-sm font-semibold cursor-pointer transition-opacity ${
//               canScrollLeft
//                 ? "bg-white border-info-500/20 opacity-100"
//                 : "bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed"
//             }`}
//           >
//             <MdArrowForwardIos />
//           </button>
//           <button
//             onClick={scrollRight}
//             disabled={!canScrollRight}
//             className={`border rounded-full p-3 text-white flex items-center text-sm font-semibold cursor-pointer transition-opacity ${
//               canScrollRight
//                 ? "bg-black border-info-500/10 opacity-100"
//                 : "bg-gray-400 border-gray-300 opacity-50 cursor-not-allowed"
//             }`}
//           >
//             <MdArrowForwardIos />
//           </button>
//         </div>
//       </div>

//       {/* ====== SLIDER CONTAINER (changed from grid to flex with overflow) ====== */}
//       <div
//         ref={scrollContainerRef}
//         onScroll={checkScrollButtons}
//         className="flex gap-5 mt-7 overflow-x-auto scrollbar-hide scroll-smooth"
//         style={{
//           scrollbarWidth: "none", // Firefox
//           msOverflowStyle: "none", // IE/Edge
//         }}
//       >
//         {/* ====== CARDS (mapped from data) ====== */}
//         {bundles.map((bundle) => (
//           <div
//             key={bundle.id}
//             className={`bundle-card relative rounded-2xl aspect-square flex flex-col items-start justify-center gap-4 p-5 ${bundle.bgColor} flex-shrink-0`}
//             style={{
//               // 3 cards on medium screens, 4 cards on large screens
//               width: "calc((100% - 40px) / 3)", // 3 cards with gap-5 (20px)
//               minWidth: "280px", // minimum card width
//             }}
//           >
//             <h1 className="text-base font-bold">{bundle.title}</h1>
//             <p>{bundle.description}</p>

//             <div className="flex items-center gap-1">
//               {/* Current Price */}
//               <div className="flex items-center text-xl font-bold text-black">
//                 <TbCurrencyTaka />
//                 <sub>{bundle.price}</sub>
//               </div>

//               {/* Old Price */}
//               <sub className="flex items-center text-xl text-gray-500">
//                 <TbCurrencyTaka />
//                 <sub>
//                   <del>{bundle.oldPrice}</del>
//                 </sub>
//               </sub>
//             </div>

//             <button className="border border-info-500/10 bg-white rounded-[90px] px-4 py-2 text-primary-500 flex gap-3 items-center text-sm font-semibold cursor-pointer">
//               See Package
//               <span>
//                 <MdArrowForwardIos />
//               </span>
//             </button>

//             {/* Product Image */}
//             <Image
//               src={bundle.image}
//               alt={bundle.title}
//               width={300}
//               height={300}
//               className={`${bundle.imageClass} object-contain mx-auto`}
//               priority
//             />
//           </div>
//         ))}
//       </div>

//       {/* ====== HIDE SCROLLBAR CSS (add to globals.css if needed) ====== */}
//       <style jsx>{`
//         .scrollbar-hide::-webkit-scrollbar {
//           display: none;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default SmartHealthBundle;
