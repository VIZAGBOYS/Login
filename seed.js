// seed.js
const mongoose = require('mongoose');
const User = require('./models/usermodel'); // Import the user model
require('dotenv').config(); // Load environment variables from .env file

// Connect to the MongoDB database
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB...');
})
.catch((err) => {
  console.error('Failed to connect to MongoDB', err);
  process.exit(1); // Exit the process with a failure code
});

// Dummy user data
const users = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '1234567890',
    password: 'password123',
    age: 30,
    gender: 'Male',
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '0987654321',
    password: 'password456',
    age: 28,
    gender: 'Female',
  },
  {
    name: 'Sam Brown',
    email: 'sam@example.com',
    phone: '1122334455',
    password: 'password789',
    age: 35,
    gender: 'Male',
  },
];

// Function to seed the database
const seedDatabase = async () => {
  try {
    // Clear the existing data (optional)
    await User.deleteMany();

    // Insert new users
    await User.insertMany(users);
    console.log('Database seeded successfully!');
    mongoose.connection.close(); // Close the connection
  } catch (err) {
    console.error('Error seeding database:', err);
    mongoose.connection.close(); // Close the connection on error
  }
};

// Call the seed function
seedDatabase();
