import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { useSnackbar } from "notistack";
import { updateTable } from "../../https";

const EditTableModal = ({ isOpen, onClose, table, onUpdated }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    tableNo: "",
    seats: "",
  });

  useEffect(() => {
    if (table) {
      setFormData({
        tableNo: table.tableNo || "",
        seats: table.seats || "",
      });
    }
  }, [table]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateTable(table._id, formData);
      enqueueSnackbar("Table updated successfully", { variant: "success" });
      onUpdated();
      onClose();
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      enqueueSnackbar("Failed to update table", { variant: "error" });
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-[#262626] text-white rounded-lg p-6 w-full max-w-md">
          <Dialog.Title className="text-xl font-semibold mb-4">
            Edit Table
          </Dialog.Title>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-[#ababab]">Table No</label>
              <div className="bg-[#1f1f1f] rounded-lg px-4 py-2">
                <input
                  type="text"
                  name="tableNo"
                  value={formData.tableNo}
                  onChange={handleChange}
                  className="w-full bg-transparent text-white focus:outline-none"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-[#ababab]">Seats</label>
              <div className="bg-[#1f1f1f] rounded-lg px-4 py-2">
                <input
                  type="number"
                  name="seats"
                  value={formData.seats}
                  onChange={handleChange}
                  className="w-full bg-transparent text-white focus:outline-none"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-4 py-2 rounded-lg"
              >
                Save
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default EditTableModal;
