const mongoose = require("mongoose");
const Item = mongoose.model("Item");
const User = mongoose.model("User");
const Type = mongoose.model("Type");

const getUserById = async (id) => {
    return await User.findById(id)
        .populate('items')
        .populate('borrowedItems')
        .exec();
};

const generate = async (req, res) => {
    try {
        const user = await getUserById(req.auth._id);

        res.status(200).json({
            "myBorrows": {
                "borrowed": user.borrowedItems.length,
                "lifetime": user.noOfBorrowedItems,
            },
            "myTypes": await Type.find({owner: req.auth._id}).exec(),
            "myItems": {
                "all": user.items.length,
                "borrowed": (await Item.find({owner: req.auth._id, status: "borrowed"}).exec()).length,
                "available": (await Item.find({owner: req.auth._id, status: "available"}).exec()).length
            },
            "myMostBorrowedItems": await Item.find({owner: req.auth._id}).exec(),
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({message: err.message});
    }
}

module.exports = {
    generate
};
