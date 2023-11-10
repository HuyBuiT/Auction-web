const mysql = require("mysql");
const db = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.DATABASE_USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});
const addNewItemAsync = (itemData) => {
    return new Promise((resolve, reject) => {
        db.query('INSERT INTO item (Item_name, location, description, picture, startPrice, currentPrice, soldPrice, Category_ID, session_ID, seller_ID, Admin_ID, Start_time = ?, End_time = ?) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [itemData.Item_name, itemData.location, itemData.description, itemData.picture, itemData.startPrice, itemData.currentPrice, itemData.soldPrice, itemData.Category_ID, itemData.session_ID, itemData.seller_ID, itemData.Admin_ID, itemData.Start_time, itemData.End_time],
            (err, results) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    console.log(`New item has been added with ID ${results.insertId}.`);
                    resolve(results);
                }
            });
    });
};

exports.addNewItem = async (req, res) => {
    try {
        if(req.user == null || req.user.isSeller == 0){
            
            res.status(401).json({message: "Unauthorized"});
        }
        else{
            const itemData = req.body; // You should extract the item data from the request as needed
            itemData.seller_ID = req.user.ID;
            await addNewItemAsync(itemData);
            // Send a success response to the client
            res.status(200).json({ message: 'New item added successfully', newItem: itemData });
        }
    } catch (err) {
        console.log(err);
        // Handle the error and send an appropriate error response
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updateItemByIdAsync = (itemId, newData) => {
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

        updateValues.push(itemId);

        const updateQuery = `UPDATE item SET ${updateQueryParts.join(', ')} WHERE ID = ?`;

        db.query(updateQuery, updateValues, (err, results) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                console.log(`Item with ID ${itemId} has been updated.`);
                resolve(results);
            }
        });
    });
};

// Use async/await to call the updateItemById function
exports.updateItemById = async (req, res) => {
    try {
        if(req.user == null || req.user.isSeller == 0){
            
            res.status(401).json({message: "Unauthorized"});
        }
        else{
        const { ID, ...updatedData } = req.body;
        console.log("updated Data",updatedData);
        await updateItemByIdAsync(ID, updatedData);
        // Send a success response to the client
        res.status(200).json({ message: `Item with ID ${ID} has been updated.` });
        }
    } catch (err) {
        console.log(err);
        // Handle the error and send an appropriate error response
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Create a Promise-based function to get all items
const getAllItemsAsync = () => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM item', (err, results) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                if (results.length === 0) {
                    console.log("There are no items.");
                }
                resolve(results);
            }
        });
    });
};

// Use async/await to call the getAllItems function
exports.getAllItems = async (req, res) => {
    try {
        const results = await getAllItemsAsync();
        // Send the response to the client (res.send or res.json, depending on your framework)
        res.status(200).json({ items: results });
    } catch (err) {
        console.log(err);
        // Handle the error and send an appropriate response
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Create a Promise-based function to get items by name
const getItemsByNameAsync = (name) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM item WHERE Item_name = ?', [name], (err, results) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                if (results.length === 0) {
                    console.log("No items found for the given name.");
                }
                resolve(results);
            }
        });
    });
};

// Use async/await to call the getItemsByName function
exports.getItemsByName = async (req, res) => {
    try {
        const name = req.body.name; // You should extract the item name from the request as needed
        const results = await getItemsByNameAsync(name);

        // Send the response to the client (res.send or res.json, depending on your framework)
        res.status(200).json({ items: results });
    } catch (err) {
        console.log(err);
        // Handle the error and send an appropriate response
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Create a Promise-based function to delete an item by ID
const deleteItemByIdAsync = (itemId) => {
    return new Promise((resolve, reject) => {
        db.query('DELETE FROM item WHERE ID = ?', [itemId], (err, results) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                console.log(`Item with ID ${itemId} has been deleted.`);
                resolve(results);
            }
        });
    });
};

// Use async/await to call the deleteItemById function
exports.deleteItemById = async (req, res) => {
    try {
        if(req.user == null || req.user.isSeller == 0){
            
            res.status(401).json({message: "Unauthorized"});
        }
        else{
        const itemId = req.body.ID; // You should extract the item ID from the request as needed
        await deleteItemByIdAsync(itemId);
        // Send a success response to the client
        res.status(200).json({ message: `Item with ID ${itemId} has been deleted.` });
        }
    } catch (err) {
        console.log(err);
        // Handle the error and send an appropriate error response
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getAllItemsBySessionAsync =(session_ID) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM item WHERE session_ID = ?', [session_ID], (err, results) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                if (results.length === 0) {
                    console.log("No items found for the given session_ID.");
                }
                resolve(results);
            }
        });
    });
}

exports.getAllItemsBySession = async(req,res) => {
    try {
        const session_ID = req.params.session_ID; // You should extract the item name from the request as needed

        const results = await getAllItemsBySessionAsync(session_ID);

        // Send the response to the client (res.send or res.json, depending on your framework)
        res.status(200).json({ items: results });
    } catch (err) {
        console.log(err);
        // Handle the error and send an appropriate response
        res.status(500).json({ error: 'Internal server error' });
    }
}