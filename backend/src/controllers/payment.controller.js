const successRes = require("../../common/success/index");
const errorRes = require("../../common/errors/index");
const logger = require("../../common/utils/logger");
const excelService = require("../service/excel.service");
const paymentService = require("../service/payment.service");
const Pagination = require("../../common/responses/Pagination");

// Create
const create = async (req, res) => {
      const context = "Controller.Payment.create";
      try {
            if (!req.file) {
                  logger.warn('No file uploaded', { context: context });
                  throw new errorRes.NotFoundError('Vui lòng đính kèm file Excel.');
            }
            
            const excelData = excelService.parseExcelBuffer(req.file.buffer);
            
            // THAY ĐỔI Ở ĐÂY: Service trả về mảng trực tiếp, không còn bọc trong { data: ... }
            const result = await paymentService.create(excelData);

            return new successRes.CreateSuccess({
                  data: result, // result lúc này chính là mảng data
                  message: "Tạo thanh toán thành công",
            }).send(res);
            
      } catch (error) {
            logger.error("Create failed", { context, error: error.message });
            throw error;
      }
};
// Get list
const getList = async (req, res) => {
            const context = "Controller.Payment.getList";
      try {
            const {data, pagination} = await paymentService.getList(req.query);
            
            const paginationData = new Pagination({
                  page: pagination.page,
                  size: pagination.size,
                  totalItems: pagination.totalItems,
            });
            return new successRes.GetListSuccess({
                  data: data,
                  pagination: paginationData,
                  message: "Lấy danh sách thanh toán thành công",
            }).send(res);
      } catch (error) {
            logger.error("Get list failed", {
                  context,
                  error: error.message,
                  stack: error.stack
            });
            throw error;
      }
};

// Get detail
const getDetail = async (req, res) => {
      const context = "Controller.Payment.getDetail";
      try {
            const result = await paymentService.getDetail(req.params.id);
            return new successRes.GetDetailSuccess({
                  data: result,
                  message: "Lấy chi tiết thanh toán thành công",
            }).send(res);
      } catch (error) {
            logger.error("Get detail failed", {
                  context,
                  error: error.message,
                  stack: error.stack
            });
            throw error;
      }
};

module.exports = {
      create,
      getList,
      getDetail,
};