const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({origin:"https://imposing-ratio-376319.web.app", credentials:true}));
//app.use(cors())
app.use(express.json());

// MongoDB Connection URL
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const db = client.db('assignment');
const postCollection = db.collection("posts")
async function run() {
    try {
        // Connect to MongoDB
        await client.connect();
        console.log("Connected to MongoDB");

       
        const collection = db.collection('users');

        // User Registration
        app.post('/api/v1/auth/register', async (req, res) => {
            const { name, email, password } = req.body;
            console.log(req.body)
            // Check if email already exists
            const existingUser = await collection.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'User already exists'
                });
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert user into the database
            await collection.insertOne({ name, email, password: hashedPassword });

            res.status(201).json({
                success: true,
                message: 'User registered successfully'
            });
        });

        // User Login
        app.post('/api/v1/auth/login', async (req, res) => {
            const { email, password } = req.body;
            console.log(email)
          

            // Find user by email
            const user = await collection.findOne({ email });
            if (!user) {
                return res.status(401).json({ message: 'Invalid email ' });
            }

            // Compare hashed password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid password' });
            }

            // Generate JWT token
            const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.EXPIRES_IN });

            res.json({
                success: true,
                message: 'Login successful',
                token
            });
            
        });


        // ==============================================================
        // WRITE YOUR CODE HERE
        // get all posts about reliefItems
          app.get('/api/v1/relief-goods', async (req, res) => {
            try{
                const posts = await postCollection.find().toArray();
                res.json(posts);
        }
            catch (error) {
                console.error("Error fetching data from posts collection:", error);
                res.status(500).json({ message: "Internal Server Error" });
              }
        });
         // get a specific post about reliefItems
         app.get('/api/v1/relief-goods/:id', async (req, res) => {
            try{
                const id = req.params.id;
                const posts = await postCollection.findOne({ _id:new ObjectId(id) });
                res.json(posts);
        }
            catch (error) {
                console.error("Error fetching data from posts collection:", error);
                res.status(500).json({ message: "Internal Server Error" });
              }
        });
        // add a post about reliefItems
        app.post('/api/v1/create-supply', async (req, res) => {
            try{
                
                await postCollection.insertOne(req.body);
                res.status(201).json({
                    success: true,
                    message: "Data posted successfully to posts collection",
                  });
                }   catch (error) {
                console.error("Error inserting data in posts collection:", error);
                res.status(500).json({ message: "Internal Server Error" });
              }
        });
        app.put('/api/v1/update-supply/:id', async (req, res) => {
            try {
                const postId = req.params.id;
                console.log(postId)
                const updatedPost = req.body;
                // Perform the update operation based on postId
                await postCollection.updateOne({ _id: new ObjectId(postId) }, { $set: updatedPost });
                res.status(200).json({
                    success: true,
                    message: "Data updated successfully",
                });
            } catch (error) {
                console.error("Error updating supply post:", error);
                res.status(500).json({ message: "Internal Server Error" });
            }
        });

        app.delete('/api/v1/delete-supply/:id', async (req, res) => {
            try {
                const postId = req.params.id;
                // Perform the delete operation based on postId
                await postCollection.deleteOne({ _id: new ObjectId(postId) });
                res.status(200).json({
                    success: true,
                    message: "Data deleted successfully",
                });
            } catch (error) {
                console.error("Error deleting supply post:", error);
                res.status(500).json({ message: "Internal Server Error" });
            }
        });
        
        
        // ==============================================================


        // Start the server
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });

    } finally {
    }
}

run().catch(console.dir);

// Test route
app.get('/', (req, res) => {
    const serverStatus = {
        message: 'Server is running smoothly',
        timestamp: new Date()
    };
    res.json(serverStatus);
});