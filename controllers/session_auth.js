const mysql = require("mysql");
const db = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.DATABASE_USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

const getAllSessionsAsync = () => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM sessions', (err, results) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                if (results.length === 0) {
                    console.log("There is no session");
                }
                resolve(results);
            }
        });
    });
};

// Use async/await to call the getAllSessions function
exports.getAllSessions = async (req, res) => {
    try {
        const results = await getAllSessionsAsync();
        results.forEach(session => {
            // Input date string
            var inputDateString = session.Session_date;
            // Create a Date object from the input string
            var date = new Date(inputDateString);

            // Get day, month, and year components
            var day = date.getUTCDate() + 1;
            var month = date.getUTCMonth() + 1; // Months are zero-based, so we add 1
            var year = date.getUTCFullYear();

            // Ensure two-digit formatting
            day = day < 10 ? "0" + day : day;
            month = month < 10 ? "0" + month : month;

            // Create the formatted date string
            var formattedDateString = month + "/" + day + "/" + year;

            session.Session_date = formattedDateString;
            var currentDate = new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok' });
            currentDate = currentDate.split(',')[0];
            if (formattedDateString > currentDate) {
                session.Status = "Coming soon";
            } else if (formattedDateString < currentDate) {
                session.Status = "Past";
            } else {
                session.Status = "Active";
            }
        });
        // Send the response to the client (res.send or res.json, depending on your framework)
        res.status(200).json({ sessions: results });
    } catch (err) {
        console.log(err);
        // Handle the error and send an appropriate response
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Create a Promise-based function to get sessions by name
const getSessionsByNameAsync = (name) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM sessions WHERE Name = ?', [name], (err, results) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                if (results.length === 0) {
                    console.log("No sessions found for the given name.");
                }
                resolve(results);
            }
        });
    });
};

// Use async/await to call the getSessionsByName function
exports.getSessionsByName = async (req, res) => {
    try {
        const name = req.body.name; // You should extract the session name from the request as needed
        const results = await getSessionsByNameAsync(name);

        // Send the response to the client (res.send or res.json, depending on your framework)
        res.status(200).json({ sessions: results });
    } catch (err) {
        console.log(err);
        // Handle the error and send an appropriate response
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Create a Promise-based function to delete a session by ID
const deleteSessionByNameAsync = (name) => {
    return new Promise((resolve, reject) => {
        db.query('DELETE FROM sessions WHERE Name = ?', [name], (err, results) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                console.log(`Session with name ${name} has been deleted.`);
                resolve(results);
            }
        });
    });
};

// Use async/await to call the deleteSessionById function
exports.deleteSessionByName = async (req, res) => {
    try {
        if(req.user == null || req.user.isAdmin == 0){
            
            res.status(401).json({message: "Unauthorized"});
        }
        else{
        const name = req.body.name; // You should extract the session ID from the request as needed
        await deleteSessionByNameAsync(name);
        // Send a success response to the client
        res.status(200).json({ message: `Session with name ${name} has been deleted.` });
        }
    } catch (err) {
        console.log(err);
        // Handle the error and send an appropriate error response
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Create a Promise-based function to add a new session
const addNewSessionAsync = (sessionData) => {
    return new Promise((resolve, reject) => {
        db.query('INSERT INTO sessions (ID, Session_date, admin_ID, Name) VALUES (?, ?, ?, ?)',
            [sessionData.ID, sessionData.Session_date, sessionData.admin_ID, sessionData.Name],
            (err, results) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    console.log(`New session has been added with ID ${sessionData.ID}.`);
                    resolve(results);
                }
            });
    });
};

// Use async/await to call the addNewSession function
exports.addNewSession = async (req, res) => {
    try {
        if(req.user == null || req.user.isAdmin == 0){
            
            res.status(401).json({message: "Unauthorized"});
        }
        else{
        const sessionData = req.body; // You should extract the session data from the request as needed
        sessionData.admin_ID = req.user.ID;
        console.log(sessionData);
        await addNewSessionAsync(sessionData);
        // Send a success response to the client
        res.status(200).json({'new session:': sessionData});
        }
    } catch (err) {
        console.log(err);
        // Handle the error and send an appropriate error response
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Create a Promise-based function to update a session by ID
const updateSessionByIdAsync = (sessionId, newData) => {
    return new Promise((resolve, reject) => {
        const updateQueryParts = [];
        const updateValues = [];

        for (const key in newData) {
            if (newData[key] !== null) {
                updateQueryParts.push(`${key} = ?`);
                updateValues.push(newData[key]);
            }
        }

        if (updateQueryParts.length === 0) {
            // If no attributes to update, resolve immediately.
            resolve('No updates required.');
            return;
        }

        updateValues.push(sessionId);

        const updateQuery = `UPDATE sessions SET ${updateQueryParts.join(', ')} WHERE ID = ?`;

        db.query(updateQuery, updateValues, (err, results) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                console.log(`Session with ID ${sessionId} has been updated.`);
                resolve(results);
            }
        });
    });
};

// Use async/await to call the updateSessionById function
exports.updateSessionById = async (req, res) => {
    try {
        if(req.user == null || req.user.isAdmin == 0){
            
            res.status(401).json({message: "Unauthorized"});
        }
        else{
        const { ID, ...updatedData } = req.body;
        console.log(ID);
        await updateSessionByIdAsync(ID, updatedData);
        // Send a success response to the client
        res.status(200).json({ message: `Session with ID ${ID} has been updated.` });
        }
    } catch (err) {
        console.log(err);
        // Handle the error and send an appropriate error response
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Create a Promise-based function to get sessions by adminID
const getSessionsByAdminIDAsync = (adminID) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM sessions WHERE Admin_ID = ?', [adminID], (err, results) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                if (results.length === 0) {
                    console.log("No sessions found for the given adminID.");
                }
                resolve(results);
            }
        });
    });
};

// Use async/await to call the getSessionsByAdminID function
exports.getSessionsByAdminID = async (req, res) => {
    try {
        const adminID = req.user.ID; // Extract the admin ID from the request
        const results = await getSessionsByAdminIDAsync(adminID);
        results.forEach(session => {
             console.log(session);
            // Input date string
            var inputDateString = session.Session_date;
            // Create a Date object from the input string
            var date = new Date(inputDateString);

            // Get day, month, and year components
            var day = date.getUTCDate();
            var month = date.getUTCMonth() + 1; // Months are zero-based, so we add 1
            var year = date.getUTCFullYear();

            // Ensure two-digit formatting
            day = day < 10 ? "0" + day : day;
            month = month < 10 ? "0" + month : month;

            // Create the formatted date string
            var formattedDateString = month + "/" + day + "/" + year;

            session.Session_date = formattedDateString;
            var currentDate = new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok' });
            currentDate = currentDate.split(',')[0];
            if (formattedDateString > currentDate) {
                session.Status = "Coming soon";
            } else if (formattedDateString < currentDate) {
                session.Status = "Past";
            } else {
                session.Status = "Active";
            }
        });
        
        // Send the response to the client (res.send or res.json, depending on your framework)
        res.status(200).json({ sessions: results });
    } catch (err) {
        console.log(err);
        // Handle the error and send an appropriate response
        res.status(500).json({ error: 'Internal server error' });
    }
};
