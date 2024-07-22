const mongoose = require('mongoose');
const faker = require('@faker-js/faker').faker;
const User = require('../../model/User');
const Chat=require("../../model/Chat");
const Message=require("../../model/Message");
// Create a function to seed users

const seedUsers = async (numUsers) => {
    try {
        // Ensure the connection to the database is established
        if (!mongoose.connection.readyState) {
            throw new Error('Database not connected');
        }

        // Remove all existing users
       
        console.log('All existing users removed');

        // Create fake users
        const users = [];
        for (let i = 0; i < numUsers; i++) {
            const firstName = faker.name.firstName();
            const lastName = faker.name.lastName();
            const userName = faker.internet.userName();
            const email = faker.internet.email();
            const password = faker.internet.password();

            const user = {
                firstName,
                lastName,
                userName,
                email,
                password,
                confirmPassword: password,
                image: {
                    public_id: faker.random.alphaNumeric(10),
                    url: faker.image.avatar(),
                },
            };

            // Log each user object to ensure correct structure
            console.log('User to be inserted:', user);

            users.push(user);
        }

        // Insert fake users into the database
        await User.insertMany(users);
        console.log(`${numUsers} users have been successfully seeded`);
    } catch (err) {
        console.error('Error seeding users:', err);
    }
};

// Export the seedUsers function


module.exports = { seedUsers };