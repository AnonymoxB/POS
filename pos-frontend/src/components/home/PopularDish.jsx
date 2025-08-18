import React, { useEffect, useState } from "react";
import { getPopularDishes } from "../../https"; 
import { enqueueSnackbar } from "notistack";

const PopularDishes = () => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPopularDishes = async () => {
    setLoading(true);
    try {
      const response = await getPopularDishes();
      setDishes(response?.data?.data || []);
    } catch {
      enqueueSnackbar("Gagal memuat data popular dish", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPopularDishes();
  }, []);

  return (
    <div className='bg-[#1a1a1a] py-5 px-5 rounded-lg flex-1 min-w-[280px]'>
      <h2 className="text-white text-lg font-semibold mb-4">Menu Terpopuler</h2>
      {loading ? (
        <p className="text-gray-400 text-sm">Memuat...</p>
      ) : dishes.length > 0 ? (
        dishes.map((dish, index) => (
          <div
            key={dish._id}
            className="flex items-center gap-4 bg-[#1f1f1f] rounded-xl p-3 mb-3"
          >
            <h1 className="text-[#f5f5f5] font-bold text-xl w-6">{index + 1}</h1>
            <img
              src={dish.image || "/placeholder.jpg"}
              alt={dish.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h1 className="text-[#f5f5f5] font-semibold">{dish.name}</h1>
              <p className="text-[#ababab] text-sm">
                Jumlah Order: {dish.totalOrders}
              </p>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-400 text-sm">Belum ada data terpopuler.</p>
      )}
    </div>
  );
};

export default PopularDishes;
