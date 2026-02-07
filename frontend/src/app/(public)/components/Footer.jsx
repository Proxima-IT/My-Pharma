"use client";

import Image from "next/image";
import React, { use } from "react";

const Footer = () => {
  return (
    <div className="bg-primary-900 px-7 py-12">
      {/* footer container  */}
      <footer>
        {/* left content  */}
        <div className="bg-white/8 rounded-2xl">
          <div className="bg-gray-100 py-2 px-4    ">

            <Image
              src="/logoo.png"
              alt="Logo"
              width={700}
              height={475}
              sizes="100vw"
              style={{
                width: "15%",
                height: "auto",
              }}
            />
            <p>
              Your trusted online pharmacy for genuine medicines and healthcare
              essentials.
            </p>
            <h4>Subscribe to our emails</h4>
            <input
              type="email"
              name=""
              id=""
              placeholder="Email"
              className="rounded-[55px]"
            />
            <span>abc</span>
          </div>
        </div>
        {/* right content  */}
        <div></div>
      </footer>
    </div>
  );
};

export default Footer;
