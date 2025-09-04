import React from "react";

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, title, message, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-[#262626] p-6 rounded-lg w-full max-w-md shadow-lg">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          {title || "Konfirmasi Hapus"}
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          {message || "Apakah Anda yakin ingin menghapus item ini?"}
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white px-4 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-700"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-70"
          >
            {isLoading ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
