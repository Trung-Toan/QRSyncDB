const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    // 1. Ngày giao dịch
    transaction_date: { 
        type: Date, 
        required: true 
    },
    // 2. Đối tác giao dịch
    remitter: { 
        type: String, 
        default: "" 
    },
    // 3. NH Đối tác
    remitter_bank: { 
        type: String, 
        default: "" 
    },
    // 4. Diễn giải 
    details: { 
        type: String, 
        default: "" 
    },
    // 5. Số bút toán 
    transaction_no: { 
        type: String, 
        default: "",
        index: true
    },
    // 6. Nợ TKTT - Số tiền ra 
    debit: { 
        type: Number, 
        default: 0 
    },
    // 7. Có TKTT - Số tiền vào 
    credit: { 
        type: Number, 
        default: 0 
    },
    // 8. Số dư sau giao dịch 
    balance: { 
        type: Number, 
        default: 0 
    }
}, { timestamps: true });
paymentSchema.index({ transaction_no: 1, transaction_date: 1 }, { unique: true });
const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;