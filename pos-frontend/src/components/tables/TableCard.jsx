import React from "react";
import { useNavigate } from "react-router-dom";
import { getAvatarName, getBgColor } from "../../utils";
import { useDispatch } from "react-redux";
import { updateTable } from "../../redux/slices/customerSlices";
import { FaLongArrowAltRight } from "react-icons/fa";

const TableCard = ({ id, name, status, initials, seats, onClean }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const handleClick = (name) => {
    if (status === "Booked") return;

    const table = { tableId: id, tableNo: name };
    dispatch(updateTable({ table }));
    navigate(`/menu`);
  };

  return (
    <div
      onClick={() => handleClick(name)}
      key={id}
      className="w-full max-w-xs sm:max-w-sm bg-[#262626] p-4 rounded-lg cursor-pointer hover:bg-[#2c2c2c] transition-colors"
    >
      <div className="flex items-center justify-between px-1">
        <h1 className="text-[#f5f5f5] text-lg sm:text-xl font-semibold flex items-center">
          Table {name}
        </h1>
        <p
          className={`px-2 py-1 rounded-lg text-sm sm:text-base ${
            status === "Booked" ? "text-green-600 bg-[#2e4a40]" : "bg-[#664a04] text-white"
          }`}
        >
          {status}
        </p>
      </div>
      <div className="flex items-center justify-center mt-5 mb-8">
        <h1
          className="text-white rounded-full p-5 sm:p-6 text-xl sm:text-2xl"
          style={{ backgroundColor: initials ? getBgColor() : "#1f1f1f" }}
        >
          {getAvatarName(initials) || "N/A"}
        </h1>
      </div>
      <p className="text-[#ababab] text-xs sm:text-sm">
        Seats: <span className="text-[#f5f5f5]">{seats}</span>
      </p>
      <div className="text-center">
        {status === "Booked" && (
          <button
            onClick={(e) => {
              e.stopPropagation(); // supaya tidak ikut trigger handleClick
              onClean?.(id); // panggil handler bersihkan meja
            }}
            className="mt-3 bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 rounded"
          >
            Bersihkan Meja
          </button>
        )}
      </div>
    </div>
  );
};

export default TableCard;
