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
        const name = req.body.name; // You should extract the session ID from the request as needed
        await deleteSessionByNameAsync(name);
        // Send a success response to the client
        res.status(200).json({ message: `Session with name ${name} has been deleted.` });
    } catch (err) {
        console.log(err);
        // Handle the error and send an appropriate error response
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Create a Promise-based function to add a new session
const addNewSessionAsync = (sessionData) => {
    return new Promise((resolve, reject) => {
        db.query('INSERT INTO sessions (ID, Session_date, Start_time, End_time, Name) VALUES (?, ?, ?, ?, ?)',
            [sessionData.ID, sessionData.Session_date, sessionData.Start_time, sessionData.End_time, sessionData.Name],
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
        const sessionData = req.body; // You should extract the session data from the request as needed
        await addNewSessionAsync(sessionData);
        // Send a success response to the client
        res.status(200).json({'new session:': sessionData});
    } catch (err) {
        console.log(err);
        // Handle the error and send an appropriate error response
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Create a Promise-based function to update a session by ID
const updateSessionByIdAsync = (sessionId, newData) => {
    return new Promise((resolve, reject) => {
        db.query('UPDATE sessions SET Session_date = ?, Start_time = ?, End_time = ?, reserved = ?, Winner_ID = ?, admin_ID = ? WHERE ID = ?',
            [newData.Session_date, newData.Start_time, newData.End_time, newData.reserved, newData.Winner_ID, newData.admin_ID, sessionId],
            (err, results) => {
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
        const { ID, ...updatedData } = req.body;
        console.log(ID);
        await updateSessionByIdAsync(ID, updatedData);
        // Send a success response to the client
        res.status(200).json({ message: `Session with ID ${ID} has been updated.` });
    } catch (err) {
        console.log(err);
        // Handle the error and send an appropriate error response
        res.status(500).json({ error: 'Internal server error' });
    }
};
