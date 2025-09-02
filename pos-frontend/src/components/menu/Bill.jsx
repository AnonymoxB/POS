import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTotalPrice } from "../../redux/slices/cartSlices";
import { addOrder } from "../../https/index";
import { enqueueSnackbar } from "notistack";
import { useMutation } from "@tanstack/react-query";
import { removeAllItems } from "../../redux/slices/cartSlices";
import Invoice from "../invoice/Invoice";

const Bill = () => {
  const dispatch = useDispatch();
  const cartData = useSelector((state) => state.cart);
  const total = useSelector(getTotalPrice);
  const totalPriceWithTax = total;

  const [paymentMethod, setPaymentMethod] = useState();
  const [cashGiven, setCashGiven] = useState(0);
  const [showInvoice, setShowInvoice] = useState(false);
  const [orderInfo, setOrderInfo] = useState();

  const change = cashGiven - totalPriceWithTax;

  const handlePlaceOrder = () => {
    if (!paymentMethod) {
      enqueueSnackbar("Please select a payment method!", { variant: "warning" });
      return;
    }

    if (paymentMethod === "Cash" && cashGiven < totalPriceWithTax) {
      enqueueSnackbar("Jumlah cash kurang!", { variant: "error" });
      return;
    }

    const cleanedCart = cartData
      .filter((item) => item.id && (item.quantity || item.qty))
      .map((item) => ({
        dishId: item.id,
        name: item.name,
        variant: item.variant || "",
        qty: item.quantity || item.qty || 1,
        unitPrice: item.pricePerQuantity || 0,
        totalPrice: (item.pricePerQuantity || 0) * (item.quantity || 1),
      }));

    if (!cleanedCart.length) {
      enqueueSnackbar("Cart kosong, tidak bisa buat order!", { variant: "error" });
      return;
    }

    const orderData = {
      orderStatus: "In Progress",
      bills: {
        total,
        totalPriceWithTax,
        ...(paymentMethod === "Cash" ? { cashGiven, change } : {}),
      },
      items: cleanedCart,
      paymentMethod,
    };

    orderMutation.mutate(orderData);
  };

  const orderMutation = useMutation({
    mutationFn: (reqData) => addOrder(reqData),
    onSuccess: (resData) => {
      const { data } = resData.data;
      setOrderInfo(data);
      enqueueSnackbar("Order Placed!", { variant: "success" });
      setShowInvoice(true);
      dispatch(removeAllItems());
      setCashGiven(0);
    },
    onError: (error) => {
      console.error(error);
      enqueueSnackbar("Gagal membuat order!", { variant: "error" });
    },
  });

  return (
    <>
      {/* Summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-5 mt-2 gap-2 sm:gap-0">
        <p className="text-xs text-[#ababab] font-medium">Items({cartData.length})</p>
        <h1 className="text-[#f5f5f5] text-md font-bold">Rp {total.toFixed(0)}</h1>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-5 mt-2 gap-2 sm:gap-0 font-bold text-lg">
        <p className="text-xs sm:text-md text-[#ababab]">Total</p>
        <h1 className="text-[#f5f5f5] text-md sm:text-lg">Rp {totalPriceWithTax.toFixed(0)}</h1>
      </div>

      {/* Payment Method */}
      <div className="flex flex-col sm:flex-row items-stretch gap-3 px-5 mt-4">
        {["Cash", "QRIS"].map((method) => (
          <button
            key={method}
            onClick={() => setPaymentMethod(method)}
            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors duration-200
              ${paymentMethod === method ? "bg-[#383737] text-white" : "bg-[#1f1f1f] text-[#ababab] hover:bg-[#2a2a2a]"}`}
          >
            {method}
          </button>
        ))}
      </div>

      {/* Cash Input & Kembalian */}
      {paymentMethod === "Cash" && (
        <div className="flex flex-col px-5 mt-4 gap-2">
          <label className="text-[#ababab] text-sm font-medium">Cash Given</label>
          <input
            type="number"
            value={cashGiven}
            onChange={(e) => setCashGiven(Number(e.target.value))}
            className="bg-[#1f1f1f] text-white px-3 py-2 rounded-lg focus:outline-none"
            placeholder="Masukkan jumlah cash"
          />
          {cashGiven >= totalPriceWithTax && (
            <p className="text-green-400 font-semibold">Kembalian: Rp {change.toFixed(0)}</p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch gap-3 px-5 mt-4">
        <button className="flex-1 bg-[#025cca] px-4 py-3 rounded-lg text-[#f5f5f5] font-semibold text-lg">
          Print Receipt
        </button>
        <button
          onClick={handlePlaceOrder}
          className="flex-1 bg-[#f6b100] px-4 py-3 rounded-lg text-[#1f1f1f] font-semibold text-lg"
        >
          Place Order
        </button>
      </div>

      {/* Invoice */}
      {showInvoice && <Invoice orderInfo={orderInfo} setShowInvoice={setShowInvoice} />}
    </>
  );
};

export default Bill;
