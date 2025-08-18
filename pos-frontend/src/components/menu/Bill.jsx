import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTotalPrice } from "../../redux/slices/cartSlices";
import {
  addOrder,
  updateTable,
} from "../../https/index";
import { enqueueSnackbar } from "notistack";
import { useMutation } from "@tanstack/react-query";
import { removeAllItems } from "../../redux/slices/cartSlices";
import { removeCustomer } from "../../redux/slices/customerSlices";
import Invoice from "../invoice/Invoice";



const Bill = () => {
  const dispatch = useDispatch();

  const customerData = useSelector((state) => state.customer);
  const cartData = useSelector((state) => state.cart);
  const total = useSelector(getTotalPrice);
  // const taxRate = 5.25;
  // const tax = (total * taxRate) / 100;
  const totalPriceWithTax = total;

  const [paymentMethod, setPaymentMethod] = useState();
  const [showInvoice, setShowInvoice] = useState(false);
  const [orderInfo, setOrderInfo] = useState();

  

  const handlePlaceOrder = async () => {
    if (!paymentMethod) {
      enqueueSnackbar("Please select a payment method!", {
        variant: "warning",
      });

      return;
    }

    if (paymentMethod === "Online") {
      // load the script
      try {
        // create order

        const reqData = {
          amount: totalPriceWithTax.toFixed(0),
        };

        const { data } = await createOrderQris(reqData); // <-- ganti endpoint khusus QRIS
        if (!data || !data.qrUrl) {
          enqueueSnackbar("Gagal mendapatkan QRIS. Coba lagi.", { variant: "error" });
          return;
        }

        // 🔰 Tampilkan QRIS ke user (misalnya di modal)
        showQrisModal(data.qrUrl); // <-- pastikan kamu punya fungsi/modal ini

        // 🔁 Tunggu user menyelesaikan pembayaran
        const interval = setInterval(async () => {
          const status = await checkQrisStatus(data.invoiceId); // <-- polling status invoice

          if (status.data.paid) {
            clearInterval(interval);
            enqueueSnackbar("Pembayaran berhasil via QRIS!", { variant: "success" });

            const orderData = {
              customerDetails: {
                name: customerData.customerName,
                phone: customerData.customerPhone,
                guests: customerData.guests,
                type: customerData.type,
              },
              orderStatus: "In Progress",
              bills: {
                total: total,
                totalWithTax: totalPriceWithTax,
              },
              items: cartData,
              table: customerData.table?.tableId || null,
              paymentMethod: paymentMethod,
              paymentData: {
                invoiceId: data.invoiceId,
              },
            };

            orderMutation.mutate(orderData);
          }
        }, 3000); // polling tiap 3 detik
      } catch (error) {
        console.error("QRIS Payment error:", error);
        enqueueSnackbar("Terjadi kesalahan saat memproses QRIS.", { variant: "error" });
      }
    } else {
      // ✅ CASH
      console.log("cartData", cartData);
      const cleanedCart = cartData
      .filter(item => item.id && item.quantity)
      .map(item => ({
        dishId: item.id,
        name: item.name,
        variant: item.variant,
        qty: item.quantity || item.qty || 1,
        unitPrice: item.pricePerQuantity || 0,
        totalPrice: (item.pricePerQuantity || 0) * (item.quantity || 1)
      }));



      // Place the order
      const orderData = {
        customerDetails: {
          name: customerData.customerName,
          phone: customerData.customerPhone,
          guests: customerData.guests,
          type: customerData.type,
          tableNo: customerData.type === "dinein" ? customerData.table?.tableNo || null : null,
        },
        orderStatus: "In Progress",
        bills: {
          total: total,
          // tax: tax,
          totalWithTax: totalPriceWithTax,
        },
        items: cleanedCart,
        table: customerData.type === "dinein" ? customerData.table?.tableId : null,
        paymentMethod: paymentMethod,
      };

      console.log("customerData.table:", customerData.table); 
      console.log("orderData yg dikirim:", orderData);

      orderMutation.mutate(orderData);
    }
  };

  const orderMutation = useMutation({
    mutationFn: (reqData) => addOrder(reqData),
    onSuccess: (resData) => {
      const { data } = resData.data;
      console.log(data);

      setOrderInfo(data);

      // Update Table
      if (data.customerDetails?.type === "dinein" && data.table) {
        const tableData = {
          status: "Booked",
          orderId: data._id,
          tableId: data.table,
        };

        setTimeout(() => {
          tableUpdateMutation.mutate(tableData);
        }, 1500);
      }

      enqueueSnackbar("Order Placed!", {
        variant: "success",
      });
      setShowInvoice(true);
      dispatch(removeCustomer());
      dispatch(removeAllItems());

    },
  });

  const tableUpdateMutation = useMutation({
    mutationFn: (data) => updateTable(data),
    onSuccess: (resData) => {
      console.log(resData);
      dispatch(removeCustomer());
      dispatch(removeAllItems());
    },
    onError: (error) => {
      console.log(error);
    },
  });

  return (
    <>
      <div className="flex items-center justify-between px-5 mt-2">
        <p className="text-xs text-[#ababab] font-medium mt-2">
          Items({cartData.length})
        </p>
        <h1 className="text-[#f5f5f5] text-md font-bold">
          Rp {total.toFixed(0)}
        </h1>
      </div>
      {/* <div className="flex items-center justify-between px-5 mt-2">
        <p className="text-xs text-[#ababab] font-medium mt-2">Tax(5.25%)</p>
        <h1 className="text-[#f5f5f5] text-md font-bold">Rp {tax.toFixed(2)}</h1>
      </div> */}
      <div className="flex items-center justify-between px-5 mt-2">
        <p className="text-xs text-[#ababab] font-medium mt-2">
          Total
        </p>
        <h1 className="text-[#f5f5f5] text-md font-bold">
          Rp {totalPriceWithTax.toFixed(0)}
        </h1>
      </div>
      <div className="flex items-center gap-3 px-5 mt-4">
        <button
          onClick={() => setPaymentMethod("Cash")}
          className={`bg-[#1f1f1f] px-4 py-3 w-full rounded-lg text-[#ababab] font-semibold ${
            paymentMethod === "Cash" ? "bg-[#383737]" : ""
          }`}
        >
          Cash
        </button>
        <button
          onClick={() => setPaymentMethod("Online")}
          className={`bg-[#1f1f1f] px-4 py-3 w-full rounded-lg text-[#ababab] font-semibold ${
            paymentMethod === "Online" ? "bg-[#383737]" : ""
          }`}
        >
          QRIS
        </button>
      </div>

      <div className="flex items-center gap-3 px-5 mt-4">
        <button className="bg-[#025cca] px-4 py-3 w-full rounded-lg text-[#f5f5f5] font-semibold text-lg">
          Print Receipt
        </button>
        <button
          onClick={handlePlaceOrder}
          className="bg-[#f6b100] px-4 py-3 w-full rounded-lg text-[#1f1f1f] font-semibold text-lg"
        >
          Place Order
        </button>
      </div>

      {showInvoice && (
        <Invoice orderInfo={orderInfo} setShowInvoice={setShowInvoice} />
      )}
    </>
  );
};

export default Bill;