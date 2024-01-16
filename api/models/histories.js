const mongoose = require("mongoose");

const historySchema = new mongoose.Schema({
    itemId: {type: mongoose.Schema.Types.ObjectId, ref: "Item"},
    name: {type: String, required: [true, "Name is required!"]},
    event: {type: String, required: [true, "Event name is required!"], enum: ["returned", "borrowed"]},
    createdOn: {type: Date, default: Date.now},
});

mongoose.model("History", historySchema, "Histories");
