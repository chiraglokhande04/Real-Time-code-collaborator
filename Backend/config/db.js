const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://chiraglokhande04:mdci1234@cluster0.au19e.mongodb.net/codeCollab');
        console.log('Connected to MongoDB...');
    } catch (err) {
        console.error('Could not connect to MongoDB...', err);
    }
};

module.exports = connectDB;
