const createHttpError = require("http-errors");
const Table = require("../models/tableModel");
const { default: mongoose } = require("mongoose");

const addTable = async (req, res, next) => {
    try {
        const { tableNo, seats } = req.body;

        if (!tableNo) {
            const error = createHttpError(400, "Please provide table No!");
            return next(error);
        }

        const isTablePresent = await Table.findOne({ tableNo });
        if (isTablePresent) {
            const error = createHttpError(400, "Table already exists!");
            return next(error);
        }

        const newTable = new Table({ tableNo, seats });
        await newTable.save();

        res.status(201).json({
            success: true,
            message: "Table added!",
            data: newTable,
        });

    } catch (error) {
        return next(error);
    }
};


const getTable = async (req, res, next) =>{
    try {
        
        const tables = await Table.find().populate({
            path: "currentOrder",
            select: "customerDetails"
        });
        res.status(200).json({success: true, data: tables});

    } catch (error) {
        return next(error);
    }
}
const updateTable = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            const error = createHttpError(404, "Invalid id!");
            return next(error);
        }

        // Update seluruh field yang ada di req.body
        const table = await Table.findByIdAndUpdate(id, req.body, { new: true });

        if (!table) {
            const error = createHttpError(404, "Table not found !");
            return next(error);
        }

        res.status(200).json({ success: true, message: "Table updated !", data: table });

    } catch (error) {
        return next(error);
    }
};


const deleteTable = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            const error = createHttpError(404, "Invalid id!");
            return next(error);
        }

        const table = await Table.findByIdAndDelete(id);

        if (!table) {
            const error = createHttpError(404, "Table not found!");
            return next(error);
        }

        res.status(200).json({
            success: true,
            message: "Table deleted successfully!"
        });

    } catch (error) {
        return next(error);
    }
};

module.exports = {addTable, getTable, updateTable, deleteTable};