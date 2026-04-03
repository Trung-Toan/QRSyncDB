const successRes = require("../../common/success/index");
const errorRes = require("../../common/errors/index");
const logger = require("../../common/utils/logger");
const { stack } = require("../routes/create.route");

// Create
const create = async (req, res) => {
      const context = "Controller.Payment.create";
      try {

            return new successRes.CreateSuccess({
                  message: "Create success",
                  data: {}
            }).send(res);
      } catch (error) {
            logger.error("Create failed", {
                  context,
                  error: error.message,
                  stack: error.stack
            });
            throw error;
      }
};

// Get list
const getList = async (req, res) => {
            const context = "Controller.Payment.getList";
      try {

            return new successRes.CreateSuccess({
                  message: "Get list success",
                  data: {}
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

            return new successRes.CreateSuccess({
                  message: "Get detail success",
                  data: {}
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

// Update
const update = async (req, res) => {
      const context = "Controller.Payment.update";
      try {

            return new successRes.CreateSuccess({
                  message: "Update success",
                  data: {}
            }).send(res);
      } catch (error) {
            logger.error("Update failed", {
                  context,
                  error: error.message,
                  stack: error.stack
            });
            throw error;
      }
};

// Delete (nên có thêm)
const remove = async (req, res) => {
      const context = "Controller.Payment.remove";
      try {

            return new successRes.CreateSuccess({
                  message: "Delete success",
                  data: {}
            }).send(res);
      } catch (error) {
            logger.error("Delete failed", {
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
      update,
      remove
};