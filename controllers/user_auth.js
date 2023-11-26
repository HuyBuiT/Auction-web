const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { promisify } = require("util");

const db = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.DATABASE_USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).sendFile("login.html", { root: './public/shared' }); //Email or password isn't fill in
        }
        db.query('SELECT * FROM systemuser WHERE Email = ?', [email], async (err, results) => {
            console.log("login ", results);
            if (!results || !results[0] || !await bcrypt.compare(password, results[0].Pass)) {
                res.status(401).sendFile("login.html", { root: './public/shared' }); //Incorrect email or password
            } else {
                const ID = results[0].ID;

                const token = jwt.sign({ ID }, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRES_IN
                });

                const cookieOptions = {
                    expires: new Date(
                        Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
                    ),
                    httpOnly: true
                }
                res.cookie('userSave', token, cookieOptions);
                res.status(200).redirect("/home");
            }
        })
    } catch (err) {
        console.log(err);
    }
}
exports.register = (req, res) => {
    console.log("register", req.body);
    const { name, email, password, passwordConfirm } = req.body;
    db.query('SELECT Email from systemuser WHERE Email = ?', [email], async (err, results) => {
        if (err) {
            console.log(err);
        } else {
            if (results.length > 0) {
                return res.sendFile("login.html", { root: './public/shared' }); //The email is already in use
            } else if (password != passwordConfirm) {
                return res.sendFile("register.html", { root: './public/shared' }); //password dont match
            }
        }

        let hashedPassword = await bcrypt.hash(password, 8);
        console.log(hashedPassword);

        db.query('INSERT INTO systemuser SET ?', { Name: name, Email: email, Pass: hashedPassword }, (err, results) => {
            if (err) {
                console.log(err);
            } else {
                return res.sendFile("login.html", { root: './public/' }); //register successfully
            }
        })
    })
}

exports.isLoggedIn = async (req, res, next) => {
    if (req.cookies.userSave) {
        try {
            // 1. Verify the token
            const decoded = await promisify(jwt.verify)(req.cookies.userSave,
                process.env.JWT_SECRET
            );
            // 2. Check if the user still exist
            db.query('SELECT * FROM systemuser WHERE ID = ?', [decoded.ID], (err, results) => {
                if (results.length === 0) {
                    console.log("error with ID");
                    return next();
                }
                req.user = results[0];
                return next();
            });
        } catch (err) {
            console.log(err)
            return next();
        }
    } else {
        next();
    }
}
exports.logout = (req, res) => {
    res.cookie('userSave', 'logout', {
        expires: new Date(Date.now() + 2 * 1000),
        httpOnly: true
    });
    res.status(200).redirect("/");
    
}
exports.getData =(req,res) =>{

}