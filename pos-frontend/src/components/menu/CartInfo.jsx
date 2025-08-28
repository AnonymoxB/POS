import React, { useEffect, useRef } from "react";
import { RiDeleteBin2Fill } from "react-icons/ri";
import { FaCircleMinus, FaCirclePlus } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { removeItem, increaseQty, decreaseQty} from "../../redux/slices/cartSlices";

const CartInfo = () => {
  const cartData = useSelector((state) => state.cart);
  const scrolLRef = useRef();
  const dispatch = useDispatch();

  useEffect(() => {
    if(scrolLRef.current){
      scrolLRef.current.scrollTo({
        top: scrolLRef.current.scrollHeight,
        behavior: "smooth"
      })
    }
  },[cartData]);

  const handleRemove = (itemId) => {
    dispatch(removeItem(itemId));
  };
  const handleAddOne = (itemId) => {
  dispatch(increaseQty(itemId));
  };
  const handleDecres = (itemId) => {
    dispatch(decreaseQty(itemId));
  }



  return (
    <div className="px-4 py-2">
      <h1 className="text-lg sm:text-xl text-[#e4e4e4] font-semibold tracking-wide">
        Order Details
      </h1>

      <div
        className="mt-4 overflow-y-auto sm:overflow-y-scroll scrollbar-hide h-[300px] sm:h-[380px]"
        ref={scrolLRef}
      >
        {cartData.length === 0 ? (
          <p className="text-[#ababab] text-sm flex justify-center items-center h-full">
            Your cart is empty. Start adding items!
          </p>
        ) : (
          cartData.map((item) => (
            <div
              key={`${item.id}-${item.name}`}
              className="bg-[#1f1f1f] rounded-lg px-4 py-3 sm:py-4 mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4"
            >
              {/* Nama & Qty */}
              <div className="flex justify-between items-center w-full sm:w-auto">
                <h1 className="text-[#ababab] font-semibold tracking-wide text-sm sm:text-md">
                  {item.name}
                </h1>
                <p className="text-[#ababab] font-semibold text-sm sm:text-md">
                  x{item.quantity}
                </p>
              </div>

              {/* Controls & Price */}
              <div className="flex justify-between items-center w-full sm:w-auto mt-2 sm:mt-0 gap-3 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <RiDeleteBin2Fill
                    onClick={() => handleRemove(item.id)}
                    className="text-[#ababab] cursor-pointer"
                    size={18}
                  />
                  <FaCirclePlus
                    onClick={() => handleAddOne(item.id)}
                    className="text-[#ababab] cursor-pointer"
                    size={18}
                  />
                  <FaCircleMinus
                    onClick={() => handleDecres(item.id)}
                    className="text-[#ababab] cursor-pointer"
                    size={18}
                  />
                </div>
                <p className="text-[#f5f5f5] text-sm sm:text-md font-bold">
                  Rp {item.price.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>

  );
};

export default CartInfo;