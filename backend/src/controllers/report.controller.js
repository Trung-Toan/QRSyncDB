const reportService = require("../service/report.service");
const successRes = require("../../common/success/index");
const errorRes = require("../../common/errors/index");
const logger = require("../../common/utils/logger");

const getReport = async (req, res) => {
      const context = "ReportController.getReport";
      try {
            const queryParams = req.query;
            logger.info("Received getReport request", { context: context, queryParams: queryParams });
            const { data } = await reportService.getReport(req.query);
            return new successRes.GetDetailSuccess(
                  data,
                  "Lấy báo cáo thành công",
            ).send(res);
      } catch (error) {
            logger.error("Get report failed", {
                  context,
                  error: error.message,
                  stack: error.stack,
            });
            throw new errorRes.InternalServerError("Lỗi khi lấy báo cáo.");
      }
};

module.exports = {
      getReport,
};