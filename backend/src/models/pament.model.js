const mongoose = require('mongoose');
const crypto = require('crypto');

const paymentSchema = new mongoose.Schema({
      date_transaction: {
            type: Date,
            default: Date.now,
            required: true
      },
      amount: {
            type: Number,
            required: true,
            min: [0, 'Số tiền giao dịch không được nhỏ hơn 0']
      },
      account_balance: {
            type: Number,
            required: function () {
                  return this.type_payment === 'QR';
            },
            min: [0, 'Số dư tài khoản không được âm']
      },
      user_pay: {
            type: String,
            required: true,
            trim: true
      },
      type_payment: {
            type: String,
            enum: ['QR', 'Cash'],
            default: 'QR'
      },
      transaction_id: {
            type: String,
            unique: true,
            sparse: true
      },
      content: {
            type: String,
            trim: true
      }
}, { timestamps: true });

// Middleware xử lý tự động tạo transaction_id duy nhất trước khi lưu
paymentSchema.pre('save', async function (next) {
      if (this.isNew && this.type_payment === 'QR' && !this.transaction_id) {
            let isUnique = false;

            while (!isUnique) {
                  const randomString = crypto.randomBytes(4).toString('hex').toUpperCase();
                  const newTransactionId = `TRANS_QR_${randomString}`;

                  const existingPayment = await this.constructor.findOne({ transaction_id: newTransactionId });

                  if (!existingPayment) {
                        this.transaction_id = newTransactionId;
                        isUnique = true;
                  } else {
                        console.log(`⚠️ Phát hiện trùng lặp mã QR: ${newTransactionId}. Đang tạo lại mã mới...`);
                  }
            }
      }
      next();
});
const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;