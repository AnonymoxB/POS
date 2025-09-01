import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { getOrders, updateOrderStatus } from "../../https";
import { formatDateAndTime } from "../../utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const RecentOrders = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { data: resData, isError } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
  });

  const orders = resData?.data?.data || [];

  const handleStatusChange = ({ orderId, orderStatus }) => {
    orderStatusUpdateMutation.mutate({ orderId, orderStatus });
  };

  

  const orderStatusUpdateMutation = useMutation({
    mutationFn: ({ orderId, orderStatus }) =>
      updateOrderStatus({ orderId, orderStatus }),
    onSuccess: () => {
      enqueueSnackbar("Order status updated successfully!", { variant: "success" });
      queryClient.invalidateQueries(["orders"]);
    },
    onError: () => {
      enqueueSnackbar("Failed to update order status!", { variant: "error" });
    },
  });

  useEffect(() => {
    if (isError) {
      enqueueSnackbar("Something went wrong!", { variant: "error" });
    }
  }, [isError]);

  // Filter by search
  const filteredOrders = orders.filter(
    (order) =>
      order.customerDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.paymentMethod?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  const getPagination = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);
      for (let i = startPage; i <= endPage; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  // Hitung total nominal page
  const totalAmount = currentOrders.reduce(
    (sum, order) => sum + (order.bills?.totalWithTax || 0),
    0
  );

  const groupItems = (items) => {
    const grouped = {};
    items.forEach((item) => {
      const key = `${item.dishId}-${item.name}`;
      if (!grouped[key]) grouped[key] = { ...item };
      else grouped[key].qty += item.qty;
    });
    return Object.values(grouped);
  };

  return (
    <Card className="bg-[#262626] text-white">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <h2 className="text-xl font-bold">Recent Orders</h2>
        </div>

        {/* Search */}
        <div className="mb-4">
          <Input
            placeholder="Cari berdasarkan nama customer atau metode pembayaran..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#333] text-white border-gray-600"
          />
        </div>

        {currentOrders.length === 0 ? (
          <p className="text-gray-400">Tidak ada pesanan terbaru.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-600 text-sm">
              <thead>
                <tr className="bg-[#333] text-gray-300">
                  <th className="border border-gray-600 px-3 py-2">Order ID</th>
                  <th className="border border-gray-600 px-3 py-2">Customer</th>
                  <th className="border border-gray-600 px-3 py-2">Status</th>
                  <th className="border border-gray-600 px-3 py-2">Date & Time</th>
                  <th className="border border-gray-600 px-3 py-2">Items</th>
                  <th className="border border-gray-600 px-3 py-2">Table No</th>
                  <th className="border border-gray-600 px-3 py-2 text-right">Total</th>
                  <th className="border border-gray-600 px-3 py-2 text-center">Payment Method</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map((order) => (
                  <tr key={order._id} className="border-t border-gray-700 hover:bg-[#333]/50">
                    <td className="border border-gray-600 px-3 py-2">#{Math.floor(new Date(order.orderDate).getTime())}</td>
                    <td className="border border-gray-600 px-3 py-2">
                      {order.customerDetails?.name || "-"}
                    </td>
                    <td className="border border-gray-600 px-3 py-2">
                      <select
                        className={`bg-[#1a1a1a] text-[#f5f5f5] border border-gray-500 p-2 rounded-lg focus:outline-none ${
                          order.orderStatus === "Ready" ? "text-green-500" : "text-yellow-500"
                        }`}
                        value={order.orderStatus}
                        onChange={(e) =>
                          handleStatusChange({ orderId: order._id, orderStatus: e.target.value })
                        }
                      >
                        <option value="In Progress">In Progress</option>
                        <option value="Ready">Ready</option>
                      </select>
                    </td>
                    <td className="border border-gray-600 px-3 py-2">{formatDateAndTime(order.orderDate)}</td>
                    <td className="border border-gray-600 px-3 py-2">
                      <ul className="list-disc pl-5">
                        {groupItems(order.items || []).map((item) => (
                          <li key={`${item.dishId}-${item.name}`}>{item.name} x {item.qty}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="border border-gray-600 px-3 py-2">
                      {order.customerDetails?.type === "dinein" ? `Table - ${order.customerDetails.tableNo || "?"}` : "Takeaway"}
                    </td>
                    <td className="border border-gray-600 px-3 py-2 text-right">
                      Rp {order.bills?.totalWithTax?.toLocaleString("id-ID") || 0}
                    </td>
                    <td className="border border-gray-600 px-3 py-2 text-center">
                      {order.paymentMethod}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total */}
            <div className="mt-2 text-right text-white font-semibold">
              Total Nominal Halaman: Rp {totalAmount.toLocaleString("id-ID")}
            </div>

    
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
              <div className="text-gray-400 text-sm">
                {filteredOrders.length > 0 && (
                  <span>
                    Menampilkan <b>{indexOfFirstItem + 1}</b>–<b>{Math.min(indexOfLastItem, filteredOrders.length)}</b>{" "}
                    dari <b>{filteredOrders.length}</b> orders
                  </span>
                )}
              </div>

              {/* Items per page */}
              <div className="flex items-center gap-2 text-gray-300">
                <label htmlFor="itemsPerPage">Tampilkan</label>
                <select
                  id="itemsPerPage"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-[#333] text-white border border-gray-600 rounded px-2 py-1"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span>per halaman</span>
              </div>

              {/* Pagination buttons */}
              <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((prev) => prev - 1)}
                              >
                                Prev
                              </Button>
              
                              {getPagination().map((page, idx) =>
                                page === "..." ? (
                                  <span key={idx} className="px-2 text-gray-400">
                                    ...
                                  </span>
                                ) : (
                                  <Button
                                    key={page}
                                    size="sm"
                                    variant={currentPage === page ? "default" : "outline"}
                                    className={`${
                                      currentPage === page
                                        ? "bg-green-600 text-white"
                                        : "bg-[#333] text-gray-300 hover:bg-gray-700"
                                    }`}
                                    onClick={() => setCurrentPage(page)}
                                  >
                                    {page}
                                  </Button>
                                )
                              )}
              
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((prev) => prev + 1)}
                              >
                                Next
                              </Button>
                            </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentOrders;
