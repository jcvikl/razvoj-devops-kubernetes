const mongoose = require("mongoose");
const moment = require("moment");
const Item = mongoose.model("Item");
const History = mongoose.model("History");
const Type = mongoose.model("Type");
const User = mongoose.model("User");

const getTypeById = async (id) => {
    return await Type.findById(id).populate('items').exec();
};
const getUserById = async (id) => {
    return await User.findById(id).populate('items').exec();
};

const list = async (req, res) => {
    try {
        const entries = await Item.find({owner: req.auth._id})
            .populate('itemType')
            .populate('borrowedBy')
            .exec();
        res.status(200).json(entries);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
}

const get = async (req, res) => {
    try {
        const item = await Item.findOne({_id: req.params.id, owner: req.auth._id})
            .populate('itemType')
            .populate('histories')
            .exec();
        if (item) {
            return res.status(200).json(item);
        }

        res.status(404).json({message: `Item with id '${req.params.id}' not found!`});
    } catch (err) {
        res.status(500).json({message: err.message});
    }
}

const create = async (req, res) => {
    if (!req.body.type || !req.body.title || !req.body.author || !req.body.description || !req.body.status || !req.body.keywords)
        return res.status(422).json({message: "All fields are required!"});

    const type = await getTypeById(req.body.type);
    const user = await getUserById(req.auth._id);

    const item = new Item();
    item.owner = req.auth._id;
    item.title = req.body.title;
    item.author = req.body.author;
    item.description = req.body.description;
    item.status = req.body.status;
    item.keywords = req.body.keywords;
    item.itemType = req.body.type;

    try {
        await item.save();

        type.items.push(item);
        type.noOfItems++;
        await type.save();

        user.items.push(item);
        await user.save();
        res.status(201).json(item);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
}

const update = async (req, res) => {
    if (!req.body.type || !req.body.title || !req.body.author || !req.body.description || !req.body.status || !req.body.keywords) {
        return res.status(422).json({message: "All fields are required!"});
    }

    try {
        const item = await Item.findOne({_id: req.params.id, owner: req.auth._id})
            .populate('itemType')
            .exec();
        if (!item) {
            return res.status(404).json({message: `Item with id '${req.params.id}' not found!`});
        }
        const oldType = item.itemType;

        if (item.status !== req.body.status && req.body.status === "borrowed") {
            item.counterBorrowed++;
        }

        item.title = req.body.title;
        item.author = req.body.author;
        item.description = req.body.description;
        item.status = req.body.status;
        item.keywords = req.body.keywords;
        item.itemType = req.body.type;

        await item.save();

        // User switched type, so we have to do that in database
        if (oldType._id !== req.body.type) {
            const newType = await getTypeById(req.body.type);

            await Type.updateOne(
                {_id: oldType._id},
                {
                    noOfItems: oldType.noOfItems - 1,
                    $pull: {items: item._id}
                }
            );

            newType.noOfItems++;
            newType.items.push(item);
            await newType.save();
        }

        res.status(200).json(item);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
}

const remove = async (req, res) => {
    try {
        const item = await Item.findOne({_id: req.params.id, owner: req.auth._id})
            .populate('itemType')
            .exec();
        const type = item.itemType;

        await Item.deleteOne({_id: req.params.id});
        await Type.updateOne(
            {_id: type._id},
            {
                noOfItems: type.noOfItems - 1,
                $pull: {items: item._id}
            }
        );
        await User.updateOne(
            {_id: req.auth._id},
            {
                $pull: {items: item._id}
            }
        );

        res.status(200).send();
    } catch (err) {
        res.status(500).json({message: err.message});
    }
}

const borrow = async (req, res) => {
    try {
        const item = await Item.findOne({_id: req.params.id, owner: req.auth._id})
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
        item.borrowedByName = req.body.name;
        item.borrowedBy = req.auth._id;
        item.shouldBeReturned = moment().add(item.itemType.borrowDays, "days");
        await item.save();

        res.status(200).send();
    } catch (err) {
        res.status(500).json({message: err.message});
    }
}

const returnBack = async (req, res) => {
    try {
        const item = await Item.findOne({_id: req.params.id, owner: req.auth._id})
            .populate('itemType')
            .populate('histories')
            .populate('borrowedBy')
            .exec();
        if (item.status !== "borrowed") {
            return res.status(404).json({message: `Item is already available!`});
        }

        const user = item.borrowedBy;

        const lastHistory = item.histories[item.histories.length - 1];

        const history = new History();
        history.itemId = item._id;
        history.name = lastHistory.name;
        history.event = "returned";
        await history.save();

        item.histories.push(history);
        item.status = "available";
        item.borrowedByName = null;
        item.borrowedBy = null;
        item.shouldBeReturned = null;
        await item.save();

        await User.updateOne(
            {_id: user._id},
            {
                $pull: {borrowedItems: item._id}
            }
        );

        res.status(200).send();
    } catch (err) {
        res.status(500).json({message: err.message});
    }
}

module.exports = {
    list,
    get,
    create,
    update,
    remove,
    borrow,
    returnBack
};
