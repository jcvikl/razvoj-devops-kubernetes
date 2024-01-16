const mongoose = require("mongoose");
const Type = mongoose.model("Type");
const User = mongoose.model("User");

const list = async (req, res) => {
    try {
        const entries = await Type.find({owner: req.auth._id}).populate('items').exec();
        res.status(200).json(entries);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
}

const get = async (req, res) => {
    try {
        const type = await Type.findOne({_id: req.params.id, owner: req.auth._id}).exec();
        if (type) {
            return res.status(200).json(type);
        }

        res.status(404).json({message: `Type with id '${req.params.id}' not found!`});
    } catch (err) {
        res.status(500).json({message: err.message});
    }
}

const create = async (req, res) => {
    if (!req.body.title || !req.body.borrowDays) {
        return res.status(422).json({message: "All fields are required!"});
    }

    const user = await User.findById(req.auth._id).populate('itemTypes').exec();

    const type = new Type();
    type.owner = req.auth._id;
    type.title = req.body.title;
    type.borrowDays = req.body.borrowDays;
    type.description = req.body.description;

    try {
        await type.save();

        user.itemTypes.push(type);
        await user.save();
        res.status(201).json(type);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
}

const update = async (req, res) => {
    if (!req.body.title || !req.body.borrowDays) {
        return res.status(422).json({message: "All fields are required!"});
    }

    try {
        const type = await Type.findOne({_id: req.params.id, owner: req.auth._id}).exec();
        if (!type) {
            return res.status(404).json({message: `Type with id '${req.params.id}' not found!`});
        }

        type.title = req.body.title;
        type.borrowDays = req.body.borrowDays;
        type.description = req.body.description;
        await type.save();

        res.status(200).json(type);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
}

const remove = async (req, res) => {
    try {
        const type = await Type.findOne({_id: req.params.id, owner: req.auth._id}).exec();
        if (type.noOfItems > 0) {
            return res.status(404).json({message: `Type is still in use!`});
        }

        await Type.deleteOne({_id: req.params.id});
        await User.updateOne(
            {_id: req.auth._id},
            {
                $pull: {itemTypes: req.params.id}
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
};
