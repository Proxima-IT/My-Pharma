
import { MdKeyboardArrowRight } from "react-icons/md";

const PrescriptionOrderForm = () => {
  return (
    <div className="w-full bg-white rounded-2xl p-6 shadow-sm">
      {/* Medicine Supply Duration */}
      <div className="mb-6">
        <h3 className="text-gray-500 font-medium mb-3">
          Medicine Supply Duration
        </h3>
        <div className="flex gap-3 flex-wrap">
          <button className="px-6 py-2 border-[1.5px] border-gray-100 rounded-full bg-gray-50 text-gray-700 font-medium hover:bg-gray-100 transition">
            7 Days
          </button>
          <button className="px-6 py-2 border-[1.5px] border-gray-100 rounded-full bg-gray-50 text-gray-700 font-medium hover:bg-gray-100 transition">
            15 Days
          </button>
          <button className="px-6 py-2 border-[1.5px] border-gray-100 rounded-full bg-gray-50 text-gray-700 font-medium hover:bg-gray-100 transition">
            1 Month
          </button>
          <button className="px-6 py-2 border-[1.5px] border-gray-100 rounded-full bg-gray-50 text-gray-700 font-medium hover:bg-gray-100 transition">
            2 Month
          </button>
          <button className="px-6 py-2 border-[1.5px] border-gray-100 rounded-full bg-gray-50 text-gray-700 font-medium hover:bg-gray-100 transition">
            Custom
          </button>
        </div>
      </div>

      {/* Prescription Note */}
      <div className="mb-6">
        <label className="text-gray-500 font-medium mb-3 block">
          Prescription Note
        </label>
        <textarea
          placeholder="Enter note for your uploading prescription..."
          rows="5"
          className="w-full px-4 py-3 bg-gray-50 rounded-xl border-[1.5px] border-gray-100 outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-700 placeholder:text-gray-400"
        />
      </div>

      {/* Info Message */}
      <div className="mb-6 p-4 bg-green-50 border-2 border-dashed border-green-300 rounded-xl">
        <p className="text-green-600 text-sm leading-relaxed">
          One My Pharma representative will call you shortly for confirming this
          order. You may receive cashback based on the final order value.
        </p>
      </div>

      {/* Order Button */}
      <button className="w-full bg-primary-500 hover:bg-primary-800 text-white font-semibold py-4 rounded-full flex items-center justify-center gap-2 transition mb-4">
        Order Prescription
        <MdKeyboardArrowRight size={20} />
      </button>

      {/* Terms */}
      <p className="text-gray-600 text-sm text-center">
        By continuing you agree to our{" "}
        <a href="#" className="text-blue-700 underline font-medium">
          Terms of services
        </a>
        ,{" "}
        <a href="#" className="text-blue-700 underline font-medium">
          Privacy Policy
        </a>{" "}
        and{" "}
        <a href="#" className="text-blue-700 underline font-medium">
          Return and Refund Policy.
        </a>
      </p>
    </div>
  );
};

export default PrescriptionOrderForm;