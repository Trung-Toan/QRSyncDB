const successRes = require("../../common/success/index");
const errorRes = require("../../common/errors/index");
const logger = require("../../common/utils/logger");
const dailyCashService = require("../service/daily_cash.service");
const Pagination = require("../../common/responses/Pagination");
const { cleanObjectData } = require("../../common/utils/cleanObjectData");

// Create
const create = async (req, res) => {
      const context = "Controller.DailyCash.create";
      try {
            const dataInsert = req.body || {};
            const cleanData = cleanObjectData(dataInsert);
            const result = await dailyCashService.create(cleanData);
            return new successRes.CreateSuccess(
                  result,
                  "Tạo thanh toán thành công",
            ).send(res);

      } catch (error) {
            logger.error("Create failed", { context, error: error.message });
            throw error;
      }
};
// Get list
const getList = async (req, res) => {
      const context = "Controller.DailyCash.getList";
      try {
            const { data, pagination } = await dailyCashService.getList(req.query);

            const paginationData = new Pagination({
                  page: pagination.page,
                  size: pagination.size,
                  totalItems: pagination.totalItems,
            });
            return new successRes.GetListSuccess(
                  data,
                  paginationData,
                  "Lấy danh sách thanh toán thành công",
            ).send(res);
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
      const context = "Controller.DailyCash.getDetail";
      try {
            const id = req.params.id;
            if (!id) {
                  throw new errorRes.BadRequestError("ID không được để trống.");
            }
            const result = await dailyCashService.getDetail(id);
            return new successRes.GetDetailSuccess(
                  result,
                  "Lấy chi tiết thanh toán thành công",
            ).send(res);
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