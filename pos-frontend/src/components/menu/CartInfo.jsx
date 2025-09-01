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
      <h1 className="text-lg text-[#e4e4e4] font-semibold tracking-wide">
        Order Details
      </h1>
      <div className="mt-2 sm:mt-4 overflow-y-auto scrollbar-hide flex-1 max-h-[280px] sm:max-h-[380px] md:max-h-[480px]" ref={scrolLRef}>
  {cartData.length === 0 ? (
    <p className="text-[#ababab] text-sm sm:text-base flex justify-center items-center h-full">
      Your cart is empty. Start adding items!
    </p>
  ) : (
    <div className="flex flex-col gap-2 sm:gap-3">
      {cartData.map((item) => (
        <div
          key={`${item.id}-${item.name}`}
          className="bg-[#1f1f1f] rounded-lg px-3 sm:px-4 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center flex-1 gap-2 sm:gap-4">
            <h1 className="text-[#ababab] font-semibold tracking-wide text-sm sm:text-md md:text-lg">
              {item.name}
            </h1>
            <p className="text-[#ababab] font-semibold text-sm sm:text-md">
              x{item.quantity}
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-0">
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

          <p className="text-[#f5f5f5] text-sm sm:text-md md:text-lg font-bold mt-2 sm:mt-0">
            Rp {item.price}
          </p>
        </div>
      ))}
    </div>
  )}
</div>

    </div>
  );
};

export default CartInfo;