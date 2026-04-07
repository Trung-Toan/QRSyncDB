const mongoose = require('mongoose');

const dailyCashSchema = new mongoose.Schema({
    // 1. Ngày ghi sổ
    report_date: { 
        type: String, 
        required: true, 
        unique: true 
    },
    // 2. Tổng tiền mặt thu vào trong ngày
    cash_in: { 
        type: Number, 
        default: 0 
    },
    // 3. Tổng tiền mặt chi ra trong ngày
    cash_out: { 
        type: Number, 
        default: 0 
    },
    // 4. Ghi chú (Nếu tiền đếm được bị lệch so với sổ sách thì ghi chú vào đây)
    note: {
        type: String,
        default: ""
    }
}, { timestamps: true });

const DailyCash = mongoose.model('DailyCash', dailyCashSchema, 'daily_cashes');
module.exports = DailyCash;