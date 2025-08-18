import React, { useEffect } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { getOrders, updateOrderStatus } from "../../https";
import { formatDateAndTime } from "../../utils";

const RecentOrders = () => {
  const queryClient = useQueryClient();

  const handleStatusChange = ({ orderId, orderStatus }) => {
    orderStatusUpdateMutation.mutate({ orderId, orderStatus });
  };

  const orderStatusUpdateMutation = useMutation({
    mutationFn: ({ orderId, orderStatus }) =>
      updateOrderStatus({ orderId, orderStatus }),
    onSuccess: () => {
      enqueueSnackbar("Order status updated successfully!", {
        variant: "success",
      });
      queryClient.invalidateQueries(["orders"]);
    },
    onError: () => {
      enqueueSnackbar("Failed to update order status!", { variant: "error" });
    },
  });

  const {
    data: resData,
    isError,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => await getOrders(),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (isError) {
      enqueueSnackbar("Something went wrong!", { variant: "error" });
    }
  }, [isError]);

  const orders = resData?.data?.data || [];

  const groupItems = (items) => {
  const grouped = {};
  items.forEach((item) => {
    const key = `${item.dishId}-${item.name}`;
    if (!grouped[key]) {
      grouped[key] = {
        dishId: item.dishId,
        name: item.name,
        qty: item.qty,
      };
    } else {
      grouped[key].qty += item.qty; 
    }
  });
  return Object.values(grouped);
};



  return (
    <div className="container overflow-y-scroll h-[700px] scrollbar-hide mx-auto bg-[#262626] p-4 rounded-lg">
      <h2 className="text-[#f5f5f5] text-xl font-semibold mb-4">
        Recent Orders
      </h2>
      <div className="w-full overflow-x-auto max-w-full">
        <table className="w-full text-left text-[#f5f5f5]">
          <thead className="bg-[#333] text-[#ababab]">
            <tr>
              <th className="p-3">Order ID</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date & Time</th>
              <th className="p-3">Items</th>
              <th className="p-3">Table No</th>
              <th className="p-3">Total</th>
              <th className="p-3 text-center">Payment Method</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => {
                return (
                  <tr
                    key={order._id}
                    className="border-b border-gray-600 hover:bg-[#333]"
                  >
                    <td className="p-4">
                      #{Math.floor(new Date(order.orderDate).getTime())}
                    </td>
                    <td className="p-4">
                      {order.customerDetails?.name || "-"}
                      {order.customerDetails?.type === "Takeaway" && (
                        <span className="ml-2 px-2 py-1 text-xs bg-yellow-500 text-black rounded">
                          Takeaway
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <select
                        className={`bg-[#1a1a1a] text-[#f5f5f5] border border-gray-500 p-2 rounded-lg focus:outline-none ${
                          order.orderStatus === "Ready"
                            ? "text-green-500"
                            : "text-yellow-500"
                        }`}
                        value={order.orderStatus}
                        onChange={(e) =>
                          handleStatusChange({
                            orderId: order._id,
                            orderStatus: e.target.value,
                          })
                        }
                      >
                        <option className="text-yellow-500" value="In Progress">
                          In Progress
                        </option>
                        <option className="text-green-500" value="Ready">
                          Ready
                        </option>
                      </select>
                    </td>
                    <td className="p-4">
                      {formatDateAndTime(order.orderDate)}
                    </td>
                    <td className="p-4">
                    {order.items && order.items.length > 0 ? (
                      <ul className="list-disc pl-5">
                        {groupItems(order.items).map((item) => (
                          <li key={`${item.dishId}-${item.name}`}>
                            {item.name} x {item.qty}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      "0 Items"
                    )}
                  </td>

                   <td className="p-4">
                    {order.customerDetails?.type === "takeaway" && "Takeaway"}
                    {order.customerDetails?.type === "dinein" &&
                      (order.customerDetails.tableNo
                        ? `Table - ${order.customerDetails.tableNo}`
                        : "Table - ?")}
                  </td>

                    <td className="p-4">Rp {order.bills?.totalWithTax || 0}</td>
                    <td className="p-4 text-center">{order.paymentMethod}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="p-4 text-center text-[#ababab]">
                  Tidak ada pesanan terbaru.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentOrders;
