const mysql = require("mysql");
const db = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.DATABASE_USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

// Promise-based function to delete a category by name
const deleteCategoryByNameAsync = (name) => {
    return new Promise((resolve, reject) => {
        db.query('DELETE FROM category WHERE Name = ?', [name], (err, results) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                console.log(`Category with name ${name} has been deleted.`);
                resolve(results);
            }
        });
    });
};

// Function to handle deletion of a category by name
exports.deleteCategoryByName = async (req, res) => {
    try {
        if (req.user == null || req.user.isAdmin === 0) {
            res.status(401).json({ message: "Unauthorized" });
        } else {
            const name = req.body.name; // Extract the category name from the request
            await deleteCategoryByNameAsync(name);
            res.status(200).json({ message: `Category with name ${name} has been deleted.` });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Promise-based function to add a new category
const addNewCategoryAsync = (categoryData) => {
    return new Promise((resolve, reject) => {
        db.query('INSERT INTO category (Cat_Name, Admin_ID) VALUES (?, ?)',
            [categoryData.Cat_Name, categoryData.Admin_ID],
            (err, results) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    console.log(`New category has been added with Name ${categoryData.Cat_Name}.`);
                    resolve(results);
                }
            });
    });
};

// Function to handle addition of a new category
exports.addNewCategory = async (req, res) => {
    try {
        if (req.user == null || req.user.isAdmin === 0) {
            res.status(401).json({ message: "Unauthorized" });
        } else {
            const categoryData = req.body; // Extract category data from the request
            categoryData['Admin_ID'] = req.user.ID;
            await addNewCategoryAsync(categoryData);
            res.status(200).json({ 'new category': categoryData });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Promise-based function to update a category by ID
const updateCategoryByIdAsync = (categoryId, newData) => {
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
            resolve('No updates required.');
            return;
        }

        updateValues.push(categoryId);

        const updateQuery = `UPDATE category SET ${updateQueryParts.join(', ')} WHERE ID = ?`;

        db.query(updateQuery, updateValues, (err, results) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                console.log(`Category with ID ${categoryId} has been updated.`);
                resolve(results);
            }
        });
    });
};

// Function to handle updating a category by ID
exports.updateCategoryById = async (req, res) => {
    try {
        if (req.user == null || req.user.isAdmin === 0) {
            res.status(401).json({ message: "Unauthorized" });
        } else {
            const { ID, ...updatedData } = req.body;
            await updateCategoryByIdAsync(ID, updatedData);
            res.status(200).json({ message: `Category with ID ${ID} has been updated.` });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Create a Promise-based function to get sessions by adminID
const getCateByAdminIDAsync = (adminID) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM category WHERE Admin_ID = ?', [adminID], (err, results) => {
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

exports.getCateByAdminID = async (req, res) => {
    try {
        const adminID = req.user.ID; // Extract the admin ID from the request
        const results = await getCateByAdminIDAsync(adminID);
        
        // Send the response to the client (res.send or res.json, depending on your framework)
        res.status(200).json({ categories: results });
    } catch (err) {
        console.log(err);
        // Handle the error and send an appropriate response
        res.status(500).json({ error: 'Internal server error' });
    }
};