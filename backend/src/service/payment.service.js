const logger = require("../../common/utils/logger");
const errorRes = require("../../common/errors/index");
const successRes = require("../../common/success/index");
const PaymentModel = require("../models/pament.model");
/**
 * create payment from excel data and check duplicate by transaction_no is unique
 * @param {ArrayObject} excelData 
 * excelData:
    [{
        transaction_date
        remitter
        remitter_bank
        details
        transaction_no
        debit
        credit
        balance
    }]
 * @returns {data} data inserted
 */
const create = async (excelData) => {
  const context = "PaymentService.create";
  try {
    if (!excelData || excelData.length === 0) {
      throw new errorRes.BadRequestError("File Excel không có dữ liệu.");
    }

    // 1. Chuẩn hoá và Lọc bỏ dòng lỗi (thiếu date hoặc no)
    const formattedData = excelData
      .map((item) => ({
        transaction_date: item.transaction_date ? new Date(item.transaction_date) : null,
        remitter: item.remitter || "",
        remitter_bank: item.remitter_bank || "",
        details: item.details || "",
        transaction_no: item.transaction_no || "",
        debit: Number(item.debit) || 0,
        credit: Number(item.credit) || 0,
        balance: Number(item.balance) || 0,
      }))
      .filter((item) => {
        const isValidDate = item.transaction_date instanceof Date && !isNaN(item.transaction_date);
        const hasTransactionNo = item.transaction_no && item.transaction_no.toString().trim() !== "";
        return isValidDate && hasTransactionNo;
      });

    if (formattedData.length === 0) return [];

    // 2. Check trùng để tránh lỗi BulkWrite của Mongo
    const conditions = formattedData.map((item) => ({
      transaction_no: item.transaction_no,
      transaction_date: item.transaction_date,
    }));

    const existingPayments = await PaymentModel.find({ $or: conditions })
      .select("transaction_no transaction_date")
      .lean();

    const existingSet = new Set(
      existingPayments.map(p => `${p.transaction_no}_${new Date(p.transaction_date).getTime()}`)
    );

    const newData = formattedData.filter((item) => {
      const key = `${item.transaction_no}_${item.transaction_date.getTime()}`;
      return !existingSet.has(key);
    });

    if (newData.length === 0) return [];

    // 3. Insert và CHỈ trả về mảng data đã insert
    const insertedData = await PaymentModel.insertMany(newData, { ordered: false });
    
    return insertedData; // Trả về mảng các document đã tạo

  } catch (error) {
    logger.error("Create failed", { context, error: error.message });
    if (error.code === 11000) {
       // Nếu vẫn dính duplicate (do race condition), trả về mảng rỗng hoặc xử lý tùy ý
       return []; 
    }
    throw error;
  }
};

/**
 * Get list payment with: {
 * page
 * size
 * sort (sort by field transaction_date default asc)
 * search (search by remitter, remitter_bank, details)
 * fromDate (filter by transaction_date >= fromDate)
 * toDate (filter by transaction_date <= toDate)
 * } 
 * 
 * @param {Object fillter} query filter with page, size, sort, search, fromDate, toDate
 * @returns 
 * - data: list payment
 * - pagination: page, size, totalItems
 */
const getList = async (query) => {
  const context = "PaymentService.getList";
  try {
    let {
      page = 1,
      size = 10,
      sort = "asc",
      search,
      fromDate,
      toDate,
    } = query;

    // 1. Convert kiểu dữ liệu
    page = parseInt(page) || 1;
    size = parseInt(size) || 10;

    const skip = (page - 1) * size;

    // 2. Build filter
    const filter = {};

    // search theo remitter, remitter_bank, details
    if (search) {
      filter.$or = [
        { remitter: { $regex: search, $options: "i" } },
        { remitter_bank: { $regex: search, $options: "i" } },
        { details: { $regex: search, $options: "i" } },
      ];
    }

    // filter theo date
    if (fromDate || toDate) {
        filter.transaction_date = {};

        if (fromDate) {
            const from = new Date(fromDate);
            from.setHours(0, 0, 0, 0); // 00:00:00.000
            filter.transaction_date.$gte = from;
        }

        if (toDate) {
            const to = new Date(toDate);
            to.setHours(23, 59, 59, 999); // 23:59:59.999
            filter.transaction_date.$lte = to;
        }
    }

    // 3. Sort
    const sortOption = {
      transaction_date: sort === "desc" ? -1 : 1,
    };

    // 4. Query DB song song (tối ưu performance)
    const [data, totalItems] = await Promise.all([
      PaymentModel.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(size)
        .lean(),
      PaymentModel.countDocuments(filter),
    ]);

    return {
      data,
      pagination: {
        page,
        size,
        totalItems,
        totalPages: Math.ceil(totalItems / size),
      },Í
    };
  } catch (error) {
    logger.error("Get list failed", {
      context,
      error: error.message,
      stack: error.stack,
    });
    throw new errorRes.InternalServerError("Lỗi khi lấy danh sách thanh toán.");
  }
};

// Get detail
const getDetail = async (id) => {
  const context = "PaymentService.getDetail";
  try {
    const payment = await PaymentModel.findById(id).lean();
    if (!payment) {
      throw new errorRes.NotFoundError("Thanh toán không tồn tại.");
    }
    return payment;
  } catch (error) {
    logger.error("Get detail failed", {
      context,
      error: error.message,
      stack: error.stack,
    });
    throw new errorRes.InternalServerError("Lỗi khi lấy chi tiết thanh toán.");
  }
};

module.exports = {
  create,
  getList,
  getDetail,
};
