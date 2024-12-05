const express = require('express');
const bcrypt = require('bcrypt');
const { MongoClient, ObjectId } = require('mongodb');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const uri = "mongodb+srv://ecommerce:Kathiravan_2004@ecommerce.jc096.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Middleware to handle JSON and static files
app.use(express.json());
app.use(express.static(path.join(__dirname, './public')));

// Add session middleware
app.use(session({
    secret: 'innu vegama',  // Replace 'yourSecretKey' with a strong secret key
    resave: false,
    saveUninitialized: true,
    cookie: {  maxAge: 2 * 24 * 60 * 60 * 1000 }  // Set secure to true if using HTTPS
}));


app.get('/', (req, res) => {
    if (req.session.loggedIn) {
        return res.redirect('/profile');
    }
    res.render('login', { error: null });
});

const dbName = "Digital_Marketing";
let db, users, components;

async function connectDB() {
    try {
        await client.connect();
        db = client.db(dbName);
        components = db.collection('components');
        users = db.collection('users'); 
        console.log("Connected to the database.");
    } catch (error) {
        console.error("Error connecting to database:", error);
    }
    }

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await users.findOne({ username});
        if (!user) {
            return res.render('login', { error: 'Invalid username or password' });
        }
        const match = await bcrypt.compare(password, user.password);

        if (match) {

            req.session.loggedIn = true;
            req.session.user = {
                username: user.username,
                category: user.category
            };
            return res.redirect('/profile');
        } else {
            return res.render('login', { error: 'Invalid username or password' });
        }
    } catch (error) {
        console.error("Error during login:", error);
        return res.render('login', { error: 'An error occurred, please try again' });
    }
});
app.post('/register', async (req, res) => {
    const { username, password, category } = req.body;
    try {
        // Check if the user already exists
        const existingUser  = await users.findOne({ username });
        if (existingUser ) {
            return res.render('login', { error: null, registerError: 'Username already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new user into the database
        const userCollection = await db.collection('users'); // Ensure 'users' is a string
        await userCollection.insertOne({
            username: username,
            password: hashedPassword,
            category: category
        });

        const createCollection = await db.collection(category); // Ensure 'users' is a string
        await createCollection.insertOne({
            username: username,
            components:[]
        });
        // Set session variables
        req.session.loggedIn = true;
        req.session.user = {
            username: username,
            category: category
        };
        
        // Redirect to the profile page
        return res.redirect('/profile');
    } catch (error) {
        console.error("Error during registration:", error);
        // Pass registerError even if there is an error during registration
        return res.render('login', { error: null, registerError: 'An error occurred, please try again' });
    }
});
app.get('/profile', (req, res) => {
    if (!req.session.loggedIn) {
        return res.redirect('/');
    }
    res.render('profile', { user: req.session.user });
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/profile');
        }
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});

app.get('/components', async (req, res) => {
    const allComponents = await components.find({}).toArray();
    console.log(allComponents);
    res.status(200).send(allComponents);
});

app.get('/users', async (req, res) => {
    try {
        const allUsers = await users.find({}).toArray();
        res.status(200).json(allUsers);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).send("Error fetching users");
    }
});

app.get('/getAllComponents', async (req, res) => {
    if (!req.session.loggedIn) {
        return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    const username = req.session.user.username;
    const category = req.session.user.category;

    try {
        const userData = await db.collection(category).findOne({ username: username });

        if (userData && userData.components) {
            console.log("User's dataList retrieved from DB:", userData.components);
            res.json(userData.components);  // Return the dataList
        } else {
            res.status(404).json({ error: "No data found for this user." });
        }
    } catch (error) {
        console.error("Error fetching user's dataList:", error);
        res.status(500).json({ error: "Error fetching user's data." });
    }
});

app.get('/getChoosedParentComponents', async (req, res) => {
    // Check if the user is logged in
    if (!req.session.loggedIn) {
        return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    // Retrieve the username and category from the session
    const username = req.session.user.username;
    const category = req.session.user.category;

    try {
        // Query the specific category collection to get the parent components (or equivalent data) for the logged-in user
        const userData = await db.collection(category).findOne({ username: username });

        if (userData && userData.components) {
            console.log("User's choosedParentComponents retrieved from DB:", userData.components);
            res.json(userData.components);  // Return the choosedParentComponents
        } else {
            res.status(404).json({ error: "No parent components found for this user." });
        }
    } catch (error) {
        console.error("Error fetching parent components:", error);
        res.status(500).json({ error: "Error fetching parent components." });
    }
});

app.post('/saveComponent', async (req, res) => {
    // Check if the user is logged in
    if (!req.session.loggedIn) {
        return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    // Retrieve the username and category from the session
    const username = req.session.user.username;
    const category = req.session.user.category;

    try {
        console.log("Received component data:", req.body);

        const { type, instance, order, data, childcomponent } = req.body;

        // Create a new component object to be added
        const newComponent = {
            type: type,
            instance: instance,
            order: order,
            data: data,
            childcomponent: childcomponent
        };

        // Find the user's document in their respective category collection and add the new component
        const result = await db.collection(category).findOneAndUpdate(
            { username: username }, // Match the user by username
            { $push: { components: newComponent } }, // Push the new component into the 'components' array
            
        );

        if (result.upsertedId) {
            console.log("New user document created and component inserted with ID:", result.upsertedId);
            res.json({ success: true, insertedId: result.upsertedId });
        } else {
            console.log("Component inserted for existing user.",result);
            res.json({ success: true });
        }

    } catch (error) {
        console.error("Error saving component:", error);
        res.status(500).json({ error: "Error saving component" });
    }
});

app.post('/updateParentComponent', async (req, res) => {
    // Check if the user is logged in
    if (!req.session.loggedIn) {
        return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    // Retrieve the username and category from the session
    const username = req.session.user.username;
    const category = req.session.user.category;

    try {
        console.log("Received component data:", req.body);
        
        const { parentcode, Data } = req.body;

        if (!parentcode || !Data) {
            return res.status(400).json({ message: 'Invalid request. Missing parentcode or Data.' });
        }

        // Find the parent component in the user's category collection where the 'components' array contains the 'parentcode'
        const parentComponent = await db.collection(category).findOne({
            username: username,
            'components.data.code': parentcode
        });

        if (!parentComponent) {
            return res.status(404).json({ message: 'Parent component not found for this user.' });
        }

        console.log("Parent component found:", parentComponent);

        // Update the specific component inside the 'components' array using dot notation
        const updateResult = await db.collection(category).findOneAndUpdate(
            { username: username, 'components.data.code': parentcode }, // Match user and parentcode within the 'components' array
            { $set: { 'components.$.data': Data } } // Update the 'data' field of the matching component
        );

        console.log("Data updated for parent component:", parentcode);
        res.json({ success: true, updatedCount: updateResult.modifiedCount });
    } catch (error) {
        console.error("Error updating component:", error);
        res.status(500).json({ error: "Error updating component" });
    }
});

app.delete('/delete-component', async (req, res) => {
    // Check if the user is logged in
    if (!req.session.loggedIn) {
        return res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
    }

    // Retrieve the username and category from the session
    const username = req.session.user.username;
    const category = req.session.user.category;

    try {
        console.log("Received delete data:", req.body);
        const { componentCode } = req.body;

        if (!componentCode) {
            return res.status(400).json({ success: false, message: "Invalid request. Missing componentCode." });
        }

        // Find the specific component to delete in the user's category collection
        const componentToDelete = await db.collection(category).findOne({
            username: username,
            'components.data.code': componentCode
        });

        if (!componentToDelete) {
            return res.status(404).json({ success: false, message: "Component not found for this user." });
        }

        // Extract component details like type, order, and instance
        const { type, order: orderValue, instance } = componentToDelete.components.find(c => c.data.code === componentCode);

        // Remove the specific component from the components array
        const updateResult = await db.collection(category).updateOne(
            { username: username },
            { $pull: { components: { 'data.code': componentCode } } } // Remove the component from the array
        );

        console.log(`Deleted component with code: ${componentCode}`);

        // If no component was removed, respond with an error
        if (updateResult.modifiedCount === 0) {
            return res.status(404).json({ success: false, message: "Component not found for this user." });
        }

        // Update the order values for other components with higher order values
        await db.collection(category).updateMany(
            { username: username, 'components.order': { $gt: orderValue } },  // Target components with order greater than the deleted one
            { $inc: { 'components.$[elem].order': -1 } },  // Decrease the order value by 1
            { arrayFilters: [{ 'elem.order': { $gt: orderValue } }] }  // Apply the update only to elements with higher order
        );

        // Update the instance values for other components of the same type with higher instance values
        await db.collection(category).updateMany(
            { username: username, 'components.type': type, 'components.instance': { $gt: instance } }, // Target components of the same type with higher instance
            { $inc: { 'components.$[elem].instance': -1 } },  // Decrease the instance value by 1
            { arrayFilters: [{ 'elem.instance': { $gt: instance } }] }  // Apply the update only to elements with higher instance
        );

        console.log("Orders and instances updated successfully");
        res.json({ success: true, updatedCount: updateResult.modifiedCount });
    } catch (error) {
        console.error("Error deleting component:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Save child component
app.post('/saveChildComponent', async (req, res) => {
   // Check if the user is logged in
   if (!req.session.loggedIn) {
    return res.status(401).json({ error: "Unauthorized. Please log in." });
}

// Retrieve the username and category from the session
const username = req.session.user.username;
const category = req.session.user.category;
    try {
        
        console.log("Received component data:", req.body);

        const { parentcode, childData } = req.body;
        if (!parentcode || !childData) {
            return res.status(400).json({ message: 'Invalid request. Missing parentcode or childData.' });
        }
        const parentComponent = await db.collection(category).findOne({
            username: username,
            'components.data.code': parentcode  // Find the parent component inside components array
        });
        
        if (!parentComponent) {
            return res.status(404).json({ message: 'Parent component not found' });
        }

        console.log("Parent component found:", parentComponent);

        const updateResult = await db.collection(category).findOneAndUpdate(
            {
                username: username,
                'components.data.code': parentcode  // Identify the correct parent component
            },
            {
                $push: { 'components.$.childcomponent': childData }  // Push childData into childcomponent array of parent component
            }
        );

        console.log("Child component inserted for parent:", parentcode);
        res.json({ success: true, updatedCount: updateResult.modifiedCount });
    } catch (error) {
        console.error("Error saving component:", error);
        res.status(500).json({ error: "Error saving component" });
    }
});
app.get('/getComponentByType', async (req, res) => {
    const componentType = req.query.type;
    
    try {
        const components = await db.collection('components').find({ type: componentType }).toArray();
        
        if (components.length > 0) {
            res.json(components[0]); 
        } else {
            res.status(404).json({ message: 'Component not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error fetching component' });
    }
});
// Update child component
app.post('/update-child-component', async (req, res) => {
    try {
        console.log("Received update request for child component:", req.body);

        const { parentCode, childComponentCode, childData } = req.body;

        if (!parentCode || !childComponentCode || !childData) {
            return res.status(400).json({ message: 'Invalid request. Missing required fields.' });
        }

        const username = req.session.user.username;  // Get username from session
        const category = req.session.user.category;  // Get category from session

        const updateResult = await db.collection(category).updateOne(
            {
                username: username,
                'components.data.code': parentCode,
                'components.childcomponent.data.code': childComponentCode  // Locate parent and child components inside components array
            },
            {
                $set: { 'components.$.childcomponent.$[child].data': childData }  // Update the child component data
            },
            {
                arrayFilters: [{ 'child.data.code': childComponentCode }]  // Ensure we target the correct child component
            }
        );

        if (updateResult.modifiedCount === 0) {
            return res.status(404).json({ message: 'Child component not found or no changes made' });
        }

        console.log("Child component updated successfully");
        res.json({ success: true, message: 'Child component updated successfully' });
    } catch (error) {
        console.error("Error updating child component:", error);
        res.status(500).json({ error: "Error updating child component" });
    }
});

// Delete child component
app.delete('/delete-child-component', async (req, res) => {
    try {
        console.log("Received delete request for child component:", req.body);

        const { parentCode, childComponentCode } = req.body;

        const username = req.session.user.username;  // Get username from session
        const category = req.session.user.category;  // Get category from session

        const parentComponent = await db.collection(category).findOne({
            username: username,
            'components.data.code': parentCode  // Find parent component inside components array
        });

        if (!parentComponent) {
            return res.status(404).json({ success: false, message: 'Parent component not found' });
        }

        const childComponentToDelete = parentComponent.components.find(
            (component) => component.data.code === parentCode  // Ensure we are working with the correct parent
        )?.childcomponent.find(
            (child) => child.data.code === childComponentCode  // Find child component inside the parent's childcomponent array
        );

        if (!childComponentToDelete) {
            return res.status(404).json({ success: false, message: 'Child component not found' });
        }

        const { type, order: orderValue, instance } = childComponentToDelete;

        const deleteResult = await db.collection(category).updateOne(
            {
                username: username,
                'components.data.code': parentCode
            },
            {
                $pull: { 'components.$.childcomponent': { 'data.code': childComponentCode } }  // Pull the child component out
            }
        );

        if (deleteResult.modifiedCount === 0) {
            return res.status(404).json({ success: false, message: 'No child component deleted' });
        }

        console.log(`Deleted child component with code: ${childComponentCode}`);

        // Update orders and instances after deletion
        await db.collection(category).updateMany(
            {
                username: username,
                'components.data.code': parentCode,
                'components.childcomponent.order': { $gt: orderValue }
            },
            {
                $inc: { 'components.$[elem].childcomponent.$[child].order': -1 }
            },
            {
                arrayFilters: [
                    { 'elem.data.code': parentCode },
                    { 'child.order': { $gt: orderValue } }
                ]
            }
        );

        await db.collection(category).updateMany(
            {
                username: username,
                'components.data.code': parentCode
            },
            {
                $inc: { 'components.$[elem].childcomponent.$[child].instance': -1 }
            },
            {
                arrayFilters: [
                    { 'elem.data.code': parentCode },
                    { 'child.instance': { $gt: instance }, 'child.type': type }
                ]
            }
        );
        console.log("Orders and instances updated successfully");

        res.json({ success: true, message: 'Child component deleted and instances/orders updated successfully' });
    } catch (error) {
        console.error("Error deleting child component:", error);
        res.status(500).json({ error: 'Error deleting child component' });
    }
});

app.get('/getComponent', async (req, res) => {
    const { parentCode } = req.query;  // Get the parentCode from query parameters
    try {
        const username = req.session.user.username;  // Get username from session
        const category = req.session.user.category;  // Get category from session

        // Find the parent component within the components array of the specified category
        const categoryData = await db.collection(category).findOne({ username: username });

        // Check if the category data exists
        if (!categoryData || !Array.isArray(categoryData.components)) {
            return res.status(404).json({ success: false, message: 'Category data not found or is invalid.' });
        }

        // Search for the parent component with the specified parentCode in the components array
        const parentComponent = categoryData.components.find(component => component.data.code === parentCode);

        // If no parent component is found, return a 404 error
        if (!parentComponent) {
            return res.status(404).json({ success: false, message: 'Parent component not found.' });
        }

        // If found, return the parent component as a JSON response
        res.json(parentComponent);
    } catch (error) {
        console.error('Error fetching parent component:', error);
        res.status(500).json({ success: false, message: 'An error occurred while fetching the parent component.' });
    }
});

app.post('/update-parent-component-order', async (req, res) => {
    const { parentComponentCode, updatedOrder } = req.body;

    try {
        console.log("Received request to update parent component order:", req.body);

        const username = req.session.user.username;  // Get username from session
        const category = req.session.user.category;  // Get category from session

        // Find the category document for the current user
        const categoryData = await db.collection(category).findOne({ username: username });

        if (!categoryData || !Array.isArray(categoryData.components)) {
            return res.status(404).json({ success: false, message: 'Category data not found or invalid.' });
        }

        // Find the parent component to be updated
        const parentComponent = categoryData.components.find(component => component.data.code === parentComponentCode);

        if (!parentComponent) {
            return res.status(404).json({ success: false, message: 'Parent component not found.' });
        }

        const currentOrder = parentComponent.order;
        const currentType = parentComponent.type;
// // Update order logic
// if (currentOrder < updatedOrder) {
//     await db.collection(category).updateMany(
//         { username:username,'components.order': { $gt: currentOrder, $lte: updatedOrder } },
//         { $inc: { 'components.$[elem].order': -1 } },
//         { arrayFilters: [{ 'elem.order': { $gt: currentOrder, $lte: updatedOrder } }] }
//     );
// } else if (currentOrder > updatedOrder) {
//     await db.collection(category).updateMany(
//         { username:username,'components.order': { $gte: updatedOrder, $lt: currentOrder } },
//         { $inc: { 'components.$[elem].order': +1 } },
//         { arrayFilters: [{ 'elem.order': { $gte: updatedOrder, $lt: currentOrder } }] }
//     );
// }

// // Update the parent's order
// await db.collection(category).updateOne(
//     { username:username,'components.data.code': parentComponentCode },
//     { $set: { 'components.$.order': updatedOrder } }
// );
        // Step 1: Adjust the order of other parent components (shift the order based on the move)
        if (currentOrder < updatedOrder) {
            // Moving down: Decrease order of components between current and updated order
            for (let i = currentOrder + 1; i <= updatedOrder; i++) {
                const componentToUpdate = categoryData.components.find(comp => comp.order === i);
                if (componentToUpdate) {
                    componentToUpdate.order--;
                }
            }
        } else if (currentOrder > updatedOrder) {
            // Moving up: Increase order of components between updated and current order
            for (let i = updatedOrder; i < currentOrder; i++) {
                const componentToUpdate = categoryData.components.find(comp => comp.order === i);
                if (componentToUpdate) {
                    componentToUpdate.order++;
                }
            }
        }

        // Step 2: Update the specific parent component's order
        parentComponent.order = updatedOrder;

        // Save the updated data
        await db.collection(category).updateOne(
            {
                username: username
            },
            {
                $set: {
                    'components': categoryData.components
                }
            }
        );

        // Step 3: Fetch the updated category data after reordering
        const updatedCategoryData = await db.collection(category).findOne({ username: username });

        // Step 4: Sort and update the instances for parent components of the same type
        const sameTypeComponents = updatedCategoryData.components.filter(comp => comp.type === currentType);
        sameTypeComponents.sort((a, b) => a.order - b.order);  // Sort by order

        // Recalculate instance values
        for (let index = 0; index < sameTypeComponents.length; index++) {
            const component = sameTypeComponents[index];
            const newInstance = index + 1;
            console.log(`Updating parent component - code: ${component.data.code}, order: ${component.order}, instance: ${component.instance}, newInstance: ${newInstance}`);

            // Update the instance for the parent component
            component.instance = newInstance;

            // Save instance update
            await db.collection(category).updateOne(
                {
                    username: username,
                    'components.data.code': component.data.code
                },
                {
                    $set: { 'components.$.instance': newInstance }
                }
            );
        }
        const sortedparentComponents = categoryData.components.sort((a, b) => a.order - b.order);

        // Update the sorted components in the database
        await db.collection(category).updateOne(
            { username: username },
            { $set: { 'components': sortedparentComponents } }
        );
        // Step 5: Return the updated parent components
        res.json({ success: true, message: 'Parent component order and instances updated successfully.', data: updatedCategoryData.components });

    } catch (error) {
        console.error('Error updating parent component order:', error);
        res.status(500).json({ success: false, message: 'An error occurred while updating the parent component order.' });
    }
});



app.post('/update-child-component-order', async (req, res) => {
    const { parentCode, childComponentCode, updatedOrder } = req.body;

    try {
        console.log("Received request to update child component order:", req.body);

        const username = req.session.user.username;  // Get username from session
        const category = req.session.user.category;  // Get category from session

        // Find the category document for the current user
        const categoryData = await db.collection(category).findOne({ username: username });

        if (!categoryData || !Array.isArray(categoryData.components)) {
            return res.status(404).json({ success: false, message: 'Category data not found or invalid.' });
        }

        // Find the parent component inside the user's components list
        const parentComponent = categoryData.components.find(component => component.data.code === parentCode);

        if (!parentComponent || !Array.isArray(parentComponent.childcomponent)) {
            return res.status(404).json({ success: false, message: 'Parent component or child components not found.' });
        }

        // Find the child component to be updated
        const childComponent = parentComponent.childcomponent.find(child => child.data.code === childComponentCode);

        if (!childComponent) {
            return res.status(404).json({ success: false, message: 'Child component not found.' });
        }

        const currentOrder = childComponent.order;
        const currentType = childComponent.type;

        // // Step 1: Adjust the order of other components (shift the order based on the move)
        // if (currentOrder < updatedOrder) {
        //     // Moving down, reduce the order of others between current and updated positions
        //     await db.collection(category).updateMany(
        //         {
        //             username: username,
        //             'components.data.code': parentCode,
        //             'components.$[parentElem].childcomponent.order': { $gt: currentOrder, $lte: updatedOrder }
        //         },
        //         { $inc: { 'components.$[parentElem].childcomponent.$[childElem].order': -1 } },
        //         { 
        //             arrayFilters: [
        //                 { 'parentElem.data.code': parentCode },
        //                 { 'childElem.order': { $gt: currentOrder, $lte: updatedOrder } }
        //             ] 
        //         }
        //     );
        // } else if (currentOrder > updatedOrder) {
        //     // Moving up, increase the order of others between updated and current positions
        //     await db.collection(category).updateMany(
        //         {
        //             username: username,
        //             'components.data.code': parentCode,
        //             'components.$[parentElem].childcomponent.order': { $gte: updatedOrder, $lt: currentOrder }
        //         },
        //         { $inc: { 'components.$[parentElem].childcomponent.$[childElem].order': +1 } },
        //         {
        //             arrayFilters: [
        //                 { 'parentElem.data.code': parentCode },
        //                 { 'childElem.order': { $gte: updatedOrder, $lt: currentOrder } }
        //             ]
        //         }
        //     );
        // }

        // Step 2: Update the specific child component's order
        // await db.collection(category).updateOne(
        //     {
        //         username: username,
        //         'components.data.code': parentCode,
        //         'components.$[parentElem].childcomponent.data.code': childComponentCode
        //     },
        //     { $set: { 'components.$[parentElem].childcomponent.$[childElem].order': updatedOrder } },
        //     {
        //         arrayFilters: [
        //             { 'parentElem.data.code': parentCode },
        //             { 'childElem.data.code': childComponentCode }
        //         ]
        //     }
        // );
        if (currentOrder < updatedOrder) {
            // Moving down: Decrease order of components between current and updated order
            for (let i = currentOrder + 1; i <= updatedOrder; i++) {
                const componentToUpdate = parentComponent.childcomponent.find(child => child.order === i);
                if (componentToUpdate) {
                    componentToUpdate.order--;
                }
            }
        } else if (currentOrder > updatedOrder) {
            // Moving up: Increase order of components between updated and current order
            for (let i = updatedOrder; i < currentOrder; i++) {
                const componentToUpdate = parentComponent.childcomponent.find(child => child.order === i);
                if (componentToUpdate) {
                    componentToUpdate.order++;
                }
            }
        }

        // Step 2: Update the specific child component's order
        childComponent.order = updatedOrder;

        // Save the updated data
        await db.collection(category).updateOne(
            {
                username: username,
                'components.data.code': parentCode
            },
            {
                $set: {
                    'components.$[parentElem].childcomponent': parentComponent.childcomponent
                }
            },
            {
                arrayFilters: [{ 'parentElem.data.code': parentCode }]
            }
        );
        // Step 3: Fetch the updated parent component after reordering
        const updatedCategoryData = await db.collection(category).findOne({ username: username });
        const updatedParentComponent = updatedCategoryData.components.find(component => component.data.code === parentCode);

        // Step 4: Sort and update the instances for child components of the same type
        const sameTypeComponents = updatedParentComponent.childcomponent.filter(child => child.type === currentType);
        sameTypeComponents.sort((a, b) => a.order - b.order);  // Sort by order

        // Recalculate instance values
        for (let index = 0; index < sameTypeComponents.length; index++) {
            const component = sameTypeComponents[index];
            const newInstance = index + 1;
            console.log(`Updating child component - code: ${component.data.code}, order: ${component.order}, instance: ${component.instance}, newInstance: ${newInstance}`);

            // Update the instance for the child component
            await db.collection(category).updateOne(
                {
                    username: username,
                    'components.data.code': parentCode,
                    'components.$[parentElem].childcomponent.data.code': component.data.code
                },
                { $set: { 'components.$[parentElem].childcomponent.$[childElem].instance': newInstance } },
                {
                    arrayFilters: [
                        { 'parentElem.data.code': parentCode },
                        { 'childElem.data.code': component.data.code }
                    ]
                }
            );
        }
                // Step 1: Sort the child components by order
        const sortedChildComponents = parentComponent.childcomponent.sort((a, b) => a.order - b.order);

        // Step 2: Update the sorted child components in the database
        await db.collection(category).updateOne(
            {
                username: username,
                'components.data.code': parentCode  // Match the specific parent component by its code
            },
            {
                $set: { 'components.$[parentElem].childcomponent': sortedChildComponents }  // Update only the childcomponent field
            },
            {
                arrayFilters: [
                    { 'parentElem.data.code': parentCode }  // Array filter to match the parent component
                ]
            }
        );


        // Step 5: Return the updated child components
        res.json({ success: true, message: 'Child component order and instances updated successfully.', data: updatedParentComponent.childcomponent });

    } catch (error) {
        console.error('Error updating child component order:', error);
        res.status(500).json({ success: false, message: 'An error occurred while updating the child component order.' });
    }
});




connectDB();

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
