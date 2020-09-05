const { User } = require('./../models/user');

let auth = (req, res, next) => {
    let token = req.cookies.auth;

    User.findByToken(token, (err, user) => {
        if (err) throw err;
        if (!user) res.status(401).send('No access');

        req.token = token;
        next();
        // res.status(200).send('Access granted');
    });
}

module.exports = { auth }