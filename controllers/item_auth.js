const mysql = require("mysql");
const db = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.DATABASE_USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});
const addNewItemAsync = (itemData) => {
    return new Promise((resolve, reject) => {
        db.query('INSERT INTO item (Item_name, location, description, picture, startPrice, currentPrice, soldPrice, Category_ID, session_ID, seller_ID, Admin_ID, Start_time, End_time, Area, Length, Width) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [itemData.Item_name, itemData.location, itemData.description, itemData.picture, itemData.startPrice, itemData.currentPrice, itemData.soldPrice, itemData.Category_ID, itemData.session_ID, itemData.seller_ID, itemData.Admin_ID, itemData.Start_time, itemData.End_time, itemData.Area, itemData.Length, itemData.Width],
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
        if(req.user == null || req.user.isSeller == 0 || req.user.isSeller == null){
            
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
        if(req.user == null){
            
            res.status(401).json({message: "Unauthorized"});
        }
        else{
        const { ID, ...updatedData } = req.body;
        const item = await getItemsByIDAsync(ID);
        if (updatedData.currentPrice <= item.startPrice || updatedData.currentPrice <= item.currentPrice ){
            res.status(400).json({ message: `Current price can not less than start price or existed current price` });
        } else{
            await updateItemByIdAsync(ID, updatedData);
            // Send a success response to the client
            res.status(200).json({ message: `Item with ID ${ID} has been updated.` });
        }
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


const getItemsByIDAsync = (ID) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM item WHERE ID = ?', [ID], (err, results) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                if (results.length === 0) {
                    console.log("No items found for the given ID.");
                    resolve(null); // Resolve with null for no results
                } else {
                    let itemData = { ...results[0], img: [] }; // Create a new object combining item details and an empty img array
                    db.query('SELECT picture FROM item_picture WHERE item_ID = ?', [ID], (err, pictures) => {
                        if (err) {
                            console.log(err);
                            reject(err);
                        } else {
                            pictures.forEach(item => {
                                itemData.img.push(item.picture);
                            });
                            resolve(itemData); // Resolve with the combined object containing item details and images
                        }
                    });
                }
            }
        });
    });
};

function calculateTimeLeft(endTime) {
    // Parse endTime to create a Date object
    const endTimeParts = endTime.split(":");
    const endDateTime = new Date();
    endDateTime.setHours(parseInt(endTimeParts[0], 10));
    endDateTime.setMinutes(parseInt(endTimeParts[1], 10));
    endDateTime.setSeconds(parseInt(endTimeParts[2], 10));
  
    // Get the current time
    const now = new Date();
  
    // Calculate the difference between endTime and current time
    const timeDifference = endDateTime.getTime() - now.getTime();
  
    // Convert the time difference to hours, minutes, seconds
    const hoursLeft = Math.floor(timeDifference / (1000 * 60 * 60));
    const minutesLeft = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    const secondsLeft = Math.floor((timeDifference % (1000 * 60)) / 1000);
  
    // Format the time left as "hh:mm:ss"
    const formattedTimeLeft = `${String(hoursLeft).padStart(2, '0')}:${String(minutesLeft).padStart(2, '0')}:${String(secondsLeft).padStart(2, '0')}`;
  
    return formattedTimeLeft;
  }
  
// Use async/await to call the getItemsByName function
exports.getItemsByID = async (req, res) => {
    try {
        const ID = req.params.item_ID; // You should extract the item name from the request as needed
        const results = await getItemsByIDAsync(ID);
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
        const itemId = req.params.item_ID; // You should extract the item ID from the request as needed
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

        
        results.forEach(item => {
            const timeLeft = calculateTimeLeft(item.End_time);
            const timeParts = timeLeft.split(':');

            const hoursLeft = parseInt(timeParts[0], 10);
            const minutesLeft = parseInt(timeParts[1], 10);
            if (hoursLeft <0 || minutesLeft <0){
                item.timeLeft = "Done";
                if (item.soldPrice != item.currentPrice){
                    item.soldPrice = item.currentPrice;
                    const newData = {
                    soldPrice: item.soldPrice,
                    // Add more key-value pairs as needed
                    };
                    updateItemByIdAsync(item.ID,newData);
                }
                
            } else{
                item.timeLeft = timeLeft;
            }
        });
        // Send the response to the client (res.send or res.json, depending on your framework)
        res.status(200).json({ items: results });
    } catch (err) {
        console.log(err);
        // Handle the error and send an appropriate response
        res.status(500).json({ error: 'Internal server error' });
    }
}

const getAllItemsBySellerIDAsync = (seller_ID) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM item WHERE seller_ID = ?', [seller_ID], (err, results) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                if (results.length === 0) {
                    console.log("No items found for the given seller_ID.");
                }
                resolve(results);
            }
        });
    });
}

exports.getAllItemsBySeller = async (req, res) => {
    try {
        const seller_ID = req.user.ID;
        const results = await getAllItemsBySellerIDAsync(seller_ID);

        results.forEach(item => {
            const timeLeft = calculateTimeLeft(item.End_time);
            const timeParts = timeLeft.split(':');

            const hoursLeft = parseInt(timeParts[0], 10);
            const minutesLeft = parseInt(timeParts[1], 10);
            if (hoursLeft <0 || minutesLeft <0){
                item.timeLeft = "Done";
                if (item.soldPrice != item.currentPrice){
                    item.soldPrice = item.currentPrice;
                    const newData = {
                    soldPrice: item.soldPrice,
                    // Add more key-value pairs as needed
                    };
                    updateItemByIdAsync(item.ID,newData);
                }
                
            } else{
                item.timeLeft = timeLeft;
            }
        });

        // Send the response to the client (res.send or res.json, depending on your framework)
        res.status(200).json({ items: results });
    } catch (err) {
        console.log(err);
        // Handle the error and send an appropriate response
        res.status(500).json({ error: 'Internal server error' });
    }
}
