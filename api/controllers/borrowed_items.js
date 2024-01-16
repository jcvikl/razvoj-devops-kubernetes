const mongoose = require("mongoose");
const User = mongoose.model("User");

/**
 * @openapi
 * /borrowed-items:
 *  get:
 *   summary: Get borrowed items
 *   description: Get user's borrowed items for user
 *   tags: [Borrowed Items]
 *   responses:
 *    '200':
 *     description: <b>OK</b>, with borrowed items
 *     content:
 *      application/json:
 *       type: array
 *       schema:
 *        $ref: '#/components/schemas/ArrayOfItems'
 *    '500':
 *     description: <b>Internal Server Error</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       example:
 *        message: Database not available.
 */
const list = async (req, res) => {
    try {
        const user = await User.findById(req.auth._id)
            .populate({
                path: 'borrowedItems',
                populate: {path: 'itemType'}
            })
            .populate({
                path: 'borrowedItems',
                populate: {path: 'owner'}
            })
            .exec();

        res.status(200).json(user.borrowedItems);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
}

module.exports = {
    list,
};
