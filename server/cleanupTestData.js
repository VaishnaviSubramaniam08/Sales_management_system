const mongoose = require('mongoose');
require('dotenv').config();

const cleanup = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log('Connected to MongoDB');

        // Define minimal schemas for deletion
        const Clothes = mongoose.model('Clothes', new mongoose.Schema({}));
        const Sale = mongoose.model('Sale', new mongoose.Schema({}));
        const Customer = mongoose.model('Customer', new mongoose.Schema({}));
        const Payment = mongoose.model('Payment', new mongoose.Schema({}));
        const PurchaseOrder = mongoose.model('PurchaseOrder', new mongoose.Schema({}));
        const Expense = mongoose.model('Expense', new mongoose.Schema({}));

        console.log('--- CLEANING TEST DATA ---');
        
        const s = await Sale.deleteMany({});
        console.log(`Deleted ${s.deletedCount} Sales`);

        const c = await Clothes.deleteMany({});
        console.log(`Deleted ${c.deletedCount} Clothes (Products)`);

        const cust = await Customer.deleteMany({});
        console.log(`Deleted ${cust.deletedCount} Customers`);

        const p = await Payment.deleteMany({});
        console.log(`Deleted ${p.deletedCount} Payments`);

        const po = await PurchaseOrder.deleteMany({});
        console.log(`Deleted ${po.deletedCount} Purchase Orders`);

        const ex = await Expense.deleteMany({});
        console.log(`Deleted ${ex.deletedCount} Expenses`);

        console.log('---------------------------');
        console.log('SUCCESS: Database cleared. You can now start fresh.');
        process.exit(0);
    } catch (err) {
        console.error('Cleanup Failed:', err.message);
        process.exit(1);
    }
};

cleanup();
