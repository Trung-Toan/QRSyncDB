const logger = require("../../common/utils/logger");
const errorRes = require("../../common/errors/index");
const successRes = require("../../common/success/index");
const DailyCashModel = require("../models/dailyCash.model");
/**
 * create daily cash and check if report_date already exist then update, if not exist then create new
 * @param {object} dataInsert dataInsert: {
 *    report_date
 *    cash_in (not null and > 0)
 *    cash_out (allow null and if not null then > 0)
 *    note
 * }
 * @returns {data} data inserted
 */
const create = async (dataInsert) => {
      const context = "DailyCashService.create";
      try {
            if (!dataInsert || Object.keys(dataInsert).length === 0) {
                  throw new errorRes.BadRequestError("Dữ liệu không hợp lệ.");
            }

            // Check report_date: bắt buộc phải có và phải đúng định dạng YYYY-MM-DD
            if (!dataInsert.report_date) {
                  throw new errorRes.BadRequestError("Ngày báo cáo là bắt buộc.");
            }
            const reportDateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!reportDateRegex.test(dataInsert.report_date)) {
                  throw new errorRes.BadRequestError("Định dạng ngày báo cáo không hợp lệ. Vui lòng sử dụng định dạng YYYY-MM-DD.");
            }

            const [year, month, day] = dataInsert.report_date.split('-');
            // Lưu ý: month trong JS Date bắt đầu từ 0 (0 = Tháng 1, 11 = Tháng 12)
            dataInsert.report_date = new Date(year, month - 1, day, 0, 0, 0, 0);

            // Validation
            if (!dataInsert.cash_in || dataInsert.cash_in <= 0) {
                  throw new errorRes.BadRequestError("Tổng tiền mặt thu vào phải lớn hơn 0.");
            }
            // Check cash_out: chỉ check nếu người dùng có truyền vào
            if (dataInsert.cash_out !== undefined && dataInsert.cash_out <= 0) {
                  throw new errorRes.BadRequestError("Tổng tiền mặt chi ra phải lớn hơn 0.");
            }

            const insertedData = await DailyCashModel.findOneAndUpdate(
                  { report_date: dataInsert.report_date },
                  { $set: dataInsert },
                  { new: true, upsert: true, runValidators: true }
            );

            return insertedData;
      } catch (error) {
            logger.error("Create failed", { context: context, error: error.message });
            // Trả về lỗi gốc nếu là BadRequest, nếu không thì mới trả về Internal
            if (error.statusCode) throw error;
            throw new errorRes.InternalServerError("Lỗi khi xử lý dữ liệu thanh toán.");
      }
};

/**   
 * Get list daily cash with: {
 * page
 * size
 * sort (sort by field report_date default asc)
 * search (search by report_date)
 * fromDate (filter by report_date >= fromDate)
 * toDate (filter by report_date <= toDate)
 * } 
 * 
 * @param {Object fillter} query filter with page, size, sort, search, fromDate, toDate
 * @returns 
 * - data: list daily cash
 * - pagination: page, size, totalItems
 */
const getList = async (query) => {
      const context = "DailyCashService.getList";
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
                        { report_date: { $regex: search, $options: "i" } },
                  ];
            }

            // filter theo date
            if (fromDate || toDate) {
                  filter.report_date = {};

                  if (fromDate) {
                        const from = new Date(fromDate);
                        from.setHours(0, 0, 0, 0); // 00:00:00.000
                        filter.report_date.$gte = from;
                  }

                  if (toDate) {
                        const to = new Date(toDate);
                        to.setHours(23, 59, 59, 999); // 23:59:59.999
                        filter.report_date.$lte = to;
                  }
            }

            // 3. Sort
            const sortOption = {
                  report_date: sort === "desc" ? -1 : 1,
            };

            // 4. Query DB song song (tối ưu performance)
            const [data, totalItems] = await Promise.all([
                  DailyCashModel.find(filter)
                        .sort(sortOption)
                        .skip(skip)
                        .limit(size)
                        .lean(),
                  DailyCashModel.countDocuments(filter),
            ]);

            return {
                  data,
                  pagination: {
                        page,
                        size,
                        totalItems
                  }, Í
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
      const context = "DailyCashService.getDetail";
      try {
            const dailyCash = await DailyCashModel.findById(id).lean();
            if (!dailyCash) {
                  throw new errorRes.NotFoundError("Thanh toán không tồn tại.");
            }
            return dailyCash;
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
