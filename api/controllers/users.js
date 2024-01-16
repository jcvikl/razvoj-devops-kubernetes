const mongoose = require("mongoose");
const User = mongoose.model("User");

/**
 * @openapi
 * /register:
 *  post:
 *   summary: Register a new user
 *   description: <b>Register a new user</b> with name, email and password.
 *   tags: [Authentication]
 *   requestBody:
 *    description: Users object
 *    required: true
 *    content:
 *     application/json:
 *      schema:
 *       $ref: '#/components/schemas/Users'
 *   responses:
 *    '200':
 *     description: <b>OK</b>, with JWT token.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/Authentication'
 *    '400':
 *     description: <b>Bad Request</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       example:
 *        message: All fields required.
 *    '500':
 *     description: <b>Internal Server Error</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       example:
 *        message: Database not available.
 */
const register = async (req, res) => {
    if (!req.body.name || !req.body.email || !req.body.password) {
        return res.status(400).json({message: "All fields required."});
    }

    const user = new User();
    user.name = req.body.name;
    user.email = req.body.email;
    user.setPassword(req.body.password);

    try {
        await user.save();
        res.status(200).json({token: user.generateJwt()});
    } catch (err) {
        res.status(500).json({message: err.message});
    }
};

/**
 * @openapi
 * /login:
 *  post:
 *   summary: Login a user
 *   description: <b>Login an existing user</b> with email and password.
 *   tags: [Authentication]
 *   requestBody:
 *    description: Users credentials
 *    required: true
 *    content:
 *     application/x-www-form-urlencoded:
 *      schema:
 *       type: object
 *       properties:
 *        email:
 *         type: string
 *         format: email
 *         description: email of the user
 *         example: dejan@lavbic.net
 *        password:
 *         type: string
 *         description: password of the user
 *         example: test
 *       required:
 *        - email
 *        - password
 *   responses:
 *    '200':
 *     description: <b>OK</b>, with JWT token.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/Authentication'
 *    '400':
 *     description: <b>Bad Request</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       example:
 *        message: All fields required.
 *    '401':
 *     description: <b>Unauthorized</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       examples:
 *        incorrect username:
 *         value:
 *          message: Incorrect username.
 *        incorrect password:
 *         value:
 *          message: Incorrect password.
 *    '500':
 *     description: <b>Internal Server Error</b>, with error message.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ErrorMessage'
 *       example:
 *        message: Database not available.
 */
const login = async (req, res) => {
    if (!req.body.email || !req.body.password) {
        return res.status(400).json({message: "All fields required."});
    }

    try {
        const user = await User.findOne({email: req.body.email}).exec();
        if (user) {
            return res.status(200).json({token: user.generateJwt()});
        }

        return res.status(401).json({message: "Invalid email or password!"});
    } catch (err) {
        return res.status(500).json({message: err.message});
    }
};

const info = async (req, res) => {
    if (!req.body.id) {
        return res.status(400).json({message: "All fields required."});
    }

    try {
        const user = await User.findById(req.body.id).exec();
        if (user) {
            return res.status(200).json(user);
        }

        return res.status(401).json({message: "User doesn't exist!"});
    } catch (err) {
        return res.status(500).json({message: err.message});
    }
};

module.exports = {
    register,
    login,
    info
};
