const mongoose = require("mongoose");
const moment = require("moment/moment");
const Item = mongoose.model("Item");
const History = mongoose.model("History");
const User = mongoose.model("User");

const getUserById = async (id) => {
    return await User.findById(id).populate('borrowedItems').exec();
};

const list = async (req, res) => {
    try {
        const entries = await Item.find()
            .populate('itemType')
            .populate('owner')
            .exec();
        res.status(200).json(entries);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
}

const get = async (req, res) => {
    try {
        const entry = await Item.findById(req.params.id).populate('itemType');
        res.status(200).json(entry);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
}

const search = async (req, res) => {
    const searchBy = new RegExp(req.body.searchString, "i");

    try {
        const entries = await Item.find(
            {$or: [{title: searchBy}, {author: searchBy}, {keywords: searchBy}, {description: searchBy}]}
        ).populate('itemType').exec();

        res.status(200).json(entries);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
}

const borrow = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id)
            .populate('itemType')
            .populate('histories')
            .exec();
        if (item.status !== "available") {
            return res.status(404).json({message: `Item is not available!`});
        }

        const history = new History();
        history.itemId = item._id;
        history.name = req.body.name;
        history.event = "borrowed";
        await history.save();

        item.histories.push(history);
        item.status = "borrowed";
        item.counterBorrowed++;
        item.shouldBeReturned = moment().add(item.itemType.borrowDays, "days");
        await item.save();

        // If borrow has been done by authenticated user
        if (req.auth) {
            const user = await getUserById(req.auth._id);
            user.borrowedItems.push(item);
            user.noOfBorrowedItems++;
            await user.save();

            item.borrowedByName = user.name;
            item.borrowedBy = user._id;
            await item.save();
        }

        res.status(200).send();
    } catch (err) {
        res.status(500).json({message: err.message});
    }
}

module.exports = {
    list,
    get,
    search,
    borrow
};
