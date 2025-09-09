import React, { useState, useEffect } from "react";
import { GrRadialSelected } from "react-icons/gr";
import { FaShoppingCart } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { addItems } from "../../redux/slices/cartSlices";
import { getCategories, getDishes } from "../../https";

const MenuContainer = () => {
  const dispatch = useDispatch();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [itemCounts, setItemCounts] = useState({});
  const [selectedTypes, setSelectedTypes] = useState({});

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const { data: dishes = [] } = useQuery({
    queryKey: ["dishes"],
    queryFn: getDishes,
  });

  // Set default kategori saat pertama load
  useEffect(() => {
    if (categories.length > 0) {
      const defaultCategory = categories.find((cat) => cat.name === "Add On") || categories[0];
      setSelectedCategory(defaultCategory.name);
    }
  }, [categories]);

  const filteredDishes = selectedCategory
    ? dishes.filter(
        (dish) =>
          (dish.category?.name ?? "").toLowerCase() === selectedCategory.toLowerCase()
      )
    : dishes;

  const increment = (id) => {
    setItemCounts((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const decrement = (id) => {
    setItemCounts((prev) => ({ ...prev, [id]: Math.max((prev[id] || 0) - 1, 0) }));
  };

  const handleTypeChange = (dishId, type) => {
    setSelectedTypes((prev) => ({ ...prev, [dishId]: type }));
  };

  const handleAddToCart = (dish) => {
    const count = itemCounts[dish._id] || 0;
    if (count === 0) return;

    const type = selectedTypes[dish._id] || "hot";
    const price = typeof dish.price === "object" ? dish.price[type] : dish.price;

    dispatch(
      addItems({
        id: dish._id,
        name: dish.name,
        variant: type,
        quantity: count,
        pricePerQuantity: price,
        price: price * count,
      })
    );

    setItemCounts((prev) => ({ ...prev, [dish._id]: 0 }));
    setSelectedTypes((prev) => ({ ...prev, [dish._id]: "hot" }));
  };

  return (
    <>
      {/* Categories */}
      <div className="grid grid-cols-4 gap-4 px-6 py-4">
        {categories.map((cat, index) => {
          const colors = [
            "bg-green-600 dark:bg-green-500",
            "bg-blue-600 dark:bg-blue-500",
            "bg-red-600 dark:bg-red-500",
            "bg-yellow-600 dark:bg-yellow-500",
            "bg-purple-600 dark:bg-purple-500",
            "bg-pink-600 dark:bg-pink-500",
            "bg-orange-600 dark:bg-orange-500",
          ];

          const bg =
            selectedCategory === cat.name
              ? colors[index % colors.length]
              : "bg-gray-200 dark:bg-gray-800";

          return (
            <div
              key={cat._id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`p-4 rounded-lg cursor-pointer flex flex-col justify-between h-[100px] ${bg} transition`}
            >
              <div className="flex justify-between items-center">
                <h1
                  className={`text-lg font-semibold ${
                    selectedCategory === cat.name
                      ? "text-white"
                      : "text-gray-900 dark:text-gray-100"
                  }`}
                >
                  {cat.name}
                </h1>
                {selectedCategory === cat.name && <GrRadialSelected className="text-white" size={20} />}
              </div>
              <p
                className={`text-sm ${
                  selectedCategory === cat.name
                    ? "text-gray-100 dark:text-gray-300"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {dishes.filter(
                  (dish) =>
                    (dish.category?.name ?? "").toLowerCase() === cat.name.toLowerCase()
                ).length}{" "}
                Item
              </p>
            </div>
          );
        })}
      </div>

      <hr className="border-gray-300 dark:border-gray-700 border-t-2 mt-4" />

      {/* Dishes */}
      <div className="max-h-[calc(100vh-300px)] overflow-y-auto px-2 sm:px-4 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {filteredDishes.map((dish) => (
            <div
              key={dish._id}
              className="flex flex-col justify-between p-3 sm:p-4 rounded-lg bg-white dark:bg-[#1a1a1a] hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-all duration-200 w-full shadow-sm"
            >
              <div className="flex items-start justify-between w-full">
                <h1 className="text-gray-900 dark:text-gray-100 text-sm sm:text-base md:text-lg font-semibold">
                  {dish.name}
                </h1>
                <button
                  onClick={() => handleAddToCart(dish)}
                  className="bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300 p-1 sm:p-2 rounded-lg"
                >
                  <FaShoppingCart size={18} />
                </button>
              </div>

              {typeof dish.price === "object" && (
                <select
                  value={selectedTypes[dish._id] || "hot"}
                  onChange={(e) => handleTypeChange(dish._id, e.target.value)}
                  className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-2 py-1 rounded-md text-xs sm:text-sm mt-2 w-full"
                >
                  <option value="hot">Hot</option>
                  <option value="ice">Ice</option>
                </select>
              )}

              <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 px-3 sm:px-4 py-2 rounded-lg gap-3 sm:gap-4 w-full mt-2">
                <button
                  onClick={() => decrement(dish._id)}
                  className="text-yellow-600 dark:text-yellow-400 text-lg sm:text-2xl"
                >
                  &minus;
                </button>
                <span className="text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                  {itemCounts[dish._id] || 0}
                </span>
                <button
                  onClick={() => increment(dish._id)}
                  className="text-yellow-600 dark:text-yellow-400 text-lg sm:text-2xl"
                >
                  &#43;
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default MenuContainer;
