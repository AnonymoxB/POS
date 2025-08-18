import React, { useState } from "react";
import BottomNav from "../components/shared/BottomNav";
import BckButton from "../components/shared/BckButton";
import TableCard from "../components/tables/TableCard";
import { useQuery } from "@tanstack/react-query";
import { getTables, updateTable } from "../https";
import { enqueueSnackbar } from "notistack";

const handleCleanTable = async (tableId) => {
  try {
    await updateTable({
      tableId,
      status: "available",
      currentOrder: null,
    });
    enqueueSnackbar("Meja berhasil dibersihkan!", { variant: "success" });
  } catch (err) {
    console.error(err);
    enqueueSnackbar("Gagal membersihkan meja!", { variant: "error" });
  }
};

const Tables = () => {
  const [status, setStatus] = useState("all");

  const { data: resData, isError } = useQuery({
    queryKey: ["tables"],
    queryFn: getTables,
  });

  if (isError) {
    enqueueSnackbar("Something went wrong!", { variant: "error" });
  }

  // Filter berdasarkan status
  const tables = resData?.data?.data || [];
  const filteredTables =
    status === "all"
      ? tables
      : tables.filter((table) =>
          status === "booked"
            ? table.status?.toLowerCase() === "booked"
            : true
        );

  return (
    <section className="bg-[#1f1f1f] h-[calc(100vh-5rem)] flex flex-col items-center justify-start overflow-hidden px-4 sm:px-6 md:px-10 py-4">
  {/* Header dan Filter */}
  <div className="flex flex-col sm:flex-row items-center justify-between w-full max-w-7xl gap-4 sm:gap-0 mb-6">
    <div className="flex items-center gap-4">
      <BckButton />
      <h1 className="text-[#f5f5f5] text-2xl font-bold tracking-wider">
        Tables
      </h1>
    </div>
    <div className="flex items-center justify-center gap-4">
      <button
        onClick={() => setStatus("all")}
        className={`text-[#ababab] text-lg ${
          status === "all" && "bg-[#383838] rounded-lg px-4 sm:px-5 py-2"
        } rounded-lg px-4 sm:px-5 py-2 font-semibold`}
      >
        All
      </button>
      <button
        onClick={() => setStatus("booked")}
        className={`text-[#ababab] text-lg ${
          status === "booked" && "bg-[#383838] rounded-lg px-4 sm:px-5 py-2"
        } rounded-lg px-4 sm:px-5 py-2 font-semibold`}
      >
        Booked
      </button>
    </div>
  </div>

  {/* Grid meja responsive */}
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full max-w-7xl overflow-y-auto h-[920px] scrollbar-hide">
    {filteredTables.length === 0 ? (
      <p className="text-[#ababab] col-span-full text-center">
        Tidak ada meja yang tersedia.
      </p>
    ) : (
      filteredTables.map((table) => (
        <TableCard
          key={table._id}
          id={table._id}
          name={table.tableNo}
          status={table.status}
          initials={table?.currentOrder?.customerDetails?.name}
          seats={table.seats}
          onClean={handleCleanTable}
        />
      ))
    )}
  </div>

  <BottomNav />
</section>

  );
};

export default Tables;
