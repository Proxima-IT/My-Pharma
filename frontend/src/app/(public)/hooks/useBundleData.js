// Bundle data hook
export const useBundleData = () => {

  const bundles = [
    {
      id: 1,
      title: "Health Combo Packages",
      description: "Designed for daily and long-term care",
      price: "1,250",
      oldPrice: "1,250",
      bgColor: "bg-[#B0E5C7]",
      image: "/assets/images/bundle1.png",
      imageClass: "max-w-[75%] max-h-[75%]",
    },
    {
      id: 2,
      title: "Baby Care Combo Packages",
      description: "Designed for daily and long-term care",
      price: "5,250",
      oldPrice: "1,790",
      bgColor: "bg-[#B0B0FD]",
      image: "/assets/images/bundle2.png",
      imageClass: "max-w-[75%] max-h-[75%]",
    },
    {
      id: 3,
      title: "Handwash Combo Packages",
      description: "Designed for daily and long-term care",
      price: "4,250",
      oldPrice: "1,790",
      bgColor: "bg-[#B0E5C7]",
      image: "/assets/images/bundle2.png",
      imageClass: "max-w-[75%] max-h-[45%]",
    },
    {
      id: 4,
      title: "Baby Care Combo Packages",
      description: "Designed for daily and long-term care",
      price: "5,250",
      oldPrice: "1,790",
      bgColor: "bg-[#B0B0FD]",
      image: "/assets/images/bundle2.png",
      imageClass: "max-w-[75%] max-h-[75%]",
    },
    {
      id: 5,
      title: "Health Combo Packages",
      description: "Designed for daily and long-term care",
      price: "1,250",
      oldPrice: "1,250",
      bgColor: "bg-[#B0E5C7]",
      image: "/assets/images/bundle1.png",
      imageClass: "max-w-[75%] max-h-[75%]",
    },
  ];

  // Future: API call
  // const [bundles, setBundles] = useState([]);
  // const [loading, setLoading] = useState(true);
  // 
  // useEffect(() => {
  //   fetch('/api/bundles')
  //     .then(res => res.json())
  //     .then(data => {
  //       setBundles(data);
  //       setLoading(false);
  //     });
  // }, []);
  //
  // return { bundles, loading };

  return { bundles };
};