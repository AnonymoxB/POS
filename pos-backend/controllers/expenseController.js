const Expense = require("../models/expenseModel");
const ExcelJS = require("exceljs");
const { savePaymentFromExpense } = require("./paymentController");


// GET semua expense
exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.json({ success: true, data: expenses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET by ID
exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ success: false, message: "Expense not found" });
    res.json({ success: true, data: expense });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// CREATE
// CREATE
exports.createExpense = async (req, res) => {
  try {
    const { category, amount, note, date } = req.body;
    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount harus lebih dari 0",
      });
    }

    const newExpense = new Expense({
      category,
      amount: numericAmount,
      note,
      date,
      createdBy: req.user?._id,
    });

    const expense = await newExpense.save();
    console.log("✅ Expense saved:", expense);

    await savePaymentFromExpense(expense, req.user?._id);
    console.log("✅ Payment saved");

    res.status(201).json({ success: true, data: expense });
  } catch (err) {
    console.error("🔥 createExpense error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};





// UPDATE
exports.updateExpense = async (req, res) => {
  try {
    const updated = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE
exports.deleteExpense = async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Expense deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.exportExpenses = async (req, res) => {
  try {
    const { start, end } = req.query;

    // filter by date kalau ada
    const filter = {};
    if (start && end) {
      filter.date = { $gte: new Date(start), $lte: new Date(end) };
    }

    const expenses = await Expense.find(filter).sort({ date: 1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Expense Report");

    // Buat header kolom
    worksheet.columns = [
      { header: "Tanggal", key: "date", width: 20 },
      { header: "Kategori", key: "category", width: 20 },
      { header: "Jumlah", key: "amount", width: 15 },
      { header: "Catatan", key: "note", width: 30 },
    ];

    // Isi data
    expenses.forEach((e) => {
      worksheet.addRow({
        date: new Date(e.date).toLocaleDateString("id-ID"),
        category: e.category,
        amount: e.amount,
        note: e.note || "-",
      });
    });

    // Styling header
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4B5563" }, // abu gelap
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    // Border semua cell
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    // Nama file
    let filename = "expenses";
    if (start && end) {
      filename += `_${start}_${end}`;
    }
    filename += ".xlsx";

    // Kirim file
    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (err) {
    console.error("🔥 Export expense error:", err);
    res.status(500).json({ success: false, message: "Gagal export expense" });
  }
};
