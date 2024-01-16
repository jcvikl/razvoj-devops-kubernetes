const homepage = async (req, res) => {
    if (req.auth) {
        res.redirect("/users/login");
    } else {
        res.redirect("/users/login");
    }
}

module.exports = {
    homepage
};