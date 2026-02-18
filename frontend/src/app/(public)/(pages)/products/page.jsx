import React from "react";
import PopularProduct from "../../components/PopularProduct";

const Products = () => {
  return (
    <div className="w-full flex gap-5">
      <div className="w-3/12 border border-amber-400">filter options</div>

      {/* filter wise category list */}
      <div>
        <div className="border border-amber-400 flex-1 flex items-center justify-between">
          <h1 className="font-bold text-xl">
            Smart health bundles at better value
          </h1>
          <div className="flex gap-3 justify-end">
            <h3>Sort by</h3>
            <input
              type="text"
              name=""
              id=""
              className="w-1/2 border border-primary-400 rounded-xl"
            />
          </div>
        </div>

        <PopularProduct></PopularProduct>
      </div>
    </div>
  );
};

export default Products;
