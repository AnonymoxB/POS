import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import BottomNav from "../components/shared/BottomNav";
import OrderCard from "../components/orders/OrderCard";
import BckButton from "../components/shared/BckButton";
import { getOrders, updateOrderStatus } from "../https";

const Orders = () => {
  const [status, setStatus] = useState("all");
  const queryClient = useQueryClient();

  // 🔥 ambil orders pakai React Query
  const {
    data: resData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => await getOrders(),
    placeholderData: keepPreviousData,
  });

  const orders = resData?.data?.data || [];

  // 🔥 mutation untuk update status
  const orderStatusUpdateMutation = useMutation({
    mutationFn: ({ orderId, orderStatus }) =>
      updateOrderStatus({ orderId, orderStatus }),
    onSuccess: () => {
      enqueueSnackbar("Order status updated!", { variant: "success" });
      queryClient.invalidateQueries(["orders"]);
    },
    onError: () => {
      enqueueSnackbar("Failed to update status!", { variant: "error" });
    },
  });

  const handleStatusChange = (orderId, orderStatus) => {
    orderStatusUpdateMutation.mutate({ orderId, orderStatus });
  };

  // filter orders sesuai tab
  const filteredOrders = orders.filter((order) =>
    status === "all" ? true : order.orderStatus.toLowerCase() === status
  );

  useEffect(() => {
    if (isError) {
      enqueueSnackbar("Gagal memuat orders!", { variant: "error" });
    }
  }, [isError]);

  return (
    <section className="bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-10 py-4">
        <div className="flex items-center gap-4">
          <BckButton />
          <h1 className="text-[#f5f5f5] text-2xl font-bold tracking-wide">
            Orders
          </h1>
        </div>
        <div className="flex items-center justify-around gap-4">
          {["all", "progress", "ready", "completed"].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`text-[#ababab] text-lg ${
                status === s && "bg-[#383838]"
              } rounded-lg px-5 py-2 font-semibold`}
            >
              {s === "progress"
                ? "In Progress"
                : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Content */}
      {isLoading ? (
        <p className="text-white text-center mt-10">Loading orders...</p>
      ) : filteredOrders.length === 0 ? (
        <p className="text-white text-center mt-10">Belum ada order.</p>
      ) : (
        <div className="flex flex-wrap justify-center items-start gap-6 px-8 py-4 w-full overflow-y-auto h-[calc(100vh-10rem)] scrollbar-hide">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      <BottomNav />
    </section>
  );
};

export default Orders;
