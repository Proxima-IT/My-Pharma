import Image from "next/image";

const Sponsors = () => {
  return (
    <div className="text-center space-y-10 mb-17.5">
      <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white rounded-2xl p-2.5 flex justify-center items-center">
          <Image
            src="/assets/images/incepta-seeklogo1.png"
            alt="brandlogo"
            width={500}
            height={200}
            className="w-full h-10 object-contain"
          />
        </div>
        <div className="bg-white rounded-2xl p-2.5 flex justify-center items-center">
          <Image
            src="/assets/images/incepta-seeklogo1-1.png"
            alt="brandlogo"
            width={500}
            height={500}
            className="w-1/2"
          />
        </div>
        <div className="bg-white rounded-2xl p-2.5 flex justify-center items-center">
          <Image
            src="/assets/images/beximco-pharma-seeklogo1.png"
            alt="brandlogo"
            width={500}
            height={500}
            className="w-1/2"
          />
        </div>
        <div className="bg-white rounded-2xl p-2.5 flex justify-center items-center">
          <Image
            src="/assets/images/beximco-pharma-seeklogo1-1.png"
            alt="brandlogo"
            width={500}
            height={500}
            className="w-full"
          />
        </div>
        <div className="bg-white rounded-2xl p-2.5 flex justify-center items-center">
          <Image
            src="/assets/images/beximco-pharma-seeklogo1-2.png"
            alt="brandlogo"
            width={500}
            height={500}
            className="w-full"
          />
        </div>
        <div className="bg-white rounded-2xl p-2.5 flex justify-center items-center">
          <Image
            src="/assets/images/beximco-pharma-seeklogo1-3.png"
            alt="brandlogo"
            width={500}
            height={200}
            className="w-full"
          />
        </div>
      </div>
      <h1>Trusted Pharmaceutical Brands</h1>
    </div>
  );
};

export default Sponsors;
