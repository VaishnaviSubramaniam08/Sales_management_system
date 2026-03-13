const mongoose = require('mongoose');
require('dotenv').config();

const checkDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB');

    const Clothes = mongoose.model('Clothes', new mongoose.Schema({
        name: String,
        category: String,
        quantity: Number
    }));
    const Sale = mongoose.model('Sale', new mongoose.Schema({
        totalAmount: Number,
        date: Date
    }));
    const Expense = mongoose.model('Expense', new mongoose.Schema({}));
    const Settings = mongoose.model('Settings', new mongoose.Schema({
        key: String,
        value: mongoose.Schema.Types.Mixed
    }));

    const clothesCount = await Clothes.countDocuments();
    const salesCount = await Sale.countDocuments();
    const expenseCount = await Expense.countDocuments();
    
    console.log('--- DATABASE DIAGNOSTIC ---');
    console.log('Clothes count:', clothesCount);
    console.log('Sales Count:', salesCount);
    console.log('Expenses Count:', expenseCount);

    // Check GST Rate
    let gstSetting = await Settings.findOne({ key: 'gst_rate' });
    if (!gstSetting) {
        console.log('GST Rate not found! Initializing to 12%...');
        gstSetting = new Settings({ key: 'gst_rate', value: 12, description: 'Default GST Rate' });
        await gstSetting.save();
    }
    console.log('GST Rate Setting:', gstSetting.value + '%');

    process.exit(0);
  } catch (err) {
    console.error('DB Check Failed:', err.message);
    process.exit(1);
  }
};

checkDB();
