const DailyCashModel = require("../models/dailyCash.model");
const PaymentModel = require("../models/pament.model");

/**
 * get report and statistics based on query params
 * - query params: fromDate, toDate
 * - if fromDate, toDate is not null then statistics will be calculated based on fromDate and toDate and group by day, month, year based on the range of fromDate and toDate
 * - statistics defaults to now month and now year 
 *    +) daily (statistic of all day of the now month ) 
 *    +) monthly (statistic of all month of the now year ) 
 *    +) yearly (statistic of all year of minDate (min date of dailyCash or Payment) - maxDate (max date of dailyCash or Payment) in db ) 
 * - statistics includes: 
 *    totalCashIn, 
 *    totalCashOut, 
 *    totalCredit, 
 *    totalDebit,
 *    totalAmountIn (= totalCashIn + totalCredit), 
 *    totalAmountOut (= totalCashOut + totalDebit), 
 *    netAmount (= totalAmountIn - totalAmountOut)
 * @param {Object} queryParams Object to filter by fromDate and toDate
 * @returns {Object} report data  with 
 *    data: {
 *          defaultStatistics: {
 *                daily: [
 *                     { totalCashIn, totalCashOut, totalCredit, totalDebit, totalAmountIn, totalAmountOut, netAmount, date (date of the day) }
 *                ],
 *                monthly: [
 *                    { totalCashIn, totalCashOut, totalCredit, totalDebit, totalAmountIn, totalAmountOut, netAmount, month (month of the month) }
 *                ],
 *                yearly: [
 *                   { totalCashIn, totalCashOut, totalCredit, totalDebit, totalAmountIn, totalAmountOut, netAmount, year (year of the year) }
 *                ]
 *          },
 *          customStatistics: {
 *                fromDate,
 *                toDate,
 *                startDate (if fromDate < min date in db then startDate = min date in db, else startDate = fromDate),
 *                endDate (if toDate > max date in db then endDate = max date in db, else endDate = toDate)
 *                daily: [],
 *                monthly: [],
 *                yearly: []
 *        }
 *    },
 */
const buildGroupStage = (type, dateField) => {
      if (type === "day") {
            return {
                  year: { $year: dateField },
                  month: { $month: dateField },
                  day: { $dayOfMonth: dateField }
            };
      }

      if (type === "month") {
            return {
                  year: { $year: dateField },
                  month: { $month: dateField }
            };
      }

      if (type === "year") {
            return {
                  year: { $year: dateField }
            };
      }
};

const mergeData = (cashData, paymentData, type) => {
      const map = new Map();

      const getKey = (item) => {
            if (type === "day") return `${item._id.year}-${item._id.month}-${item._id.day}`;
            if (type === "month") return `${item._id.year}-${item._id.month}`;
            return `${item._id.year}`;
      };

      // init cash
      cashData.forEach(item => {
            const key = getKey(item);
            map.set(key, {
                  totalCashIn: item.totalCashIn || 0,
                  totalCashOut: item.totalCashOut || 0,
                  totalCredit: 0,
                  totalDebit: 0,
                  ...item._id
            });
      });

      // merge payment
      paymentData.forEach(item => {
            const key = getKey(item);

            if (!map.has(key)) {
                  map.set(key, {
                        totalCashIn: 0,
                        totalCashOut: 0,
                        totalCredit: 0,
                        totalDebit: 0,
                        ...item._id
                  });
            }

            const existing = map.get(key);
            existing.totalCredit += item.totalCredit || 0;
            existing.totalDebit += item.totalDebit || 0;

            map.set(key, existing);
      });

      // final mapping
      return Array.from(map.values()).map(item => {
            const totalAmountIn = item.totalCashIn + item.totalCredit;
            const totalAmountOut = item.totalCashOut + item.totalDebit;
            const netAmount = totalAmountIn - totalAmountOut;

            return {
                  ...item,
                  totalAmountIn,
                  totalAmountOut,
                  netAmount
            };
      });
};

const aggregateData = async (type, match = {}) => {
      const groupCash = buildGroupStage(type, "$report_date");
      const groupPayment = buildGroupStage(type, "$transaction_date");

      const [cashData, paymentData] = await Promise.all([
            DailyCashModel.aggregate([
                  { $match: match.cash || {} },
                  {
                        $group: {
                              _id: groupCash,
                              totalCashIn: { $sum: "$cash_in" },
                              totalCashOut: { $sum: "$cash_out" }
                        }
                  }
            ]),
            PaymentModel.aggregate([
                  { $match: match.payment || {} },
                  {
                        $group: {
                              _id: groupPayment,
                              totalCredit: { $sum: "$credit" },
                              totalDebit: { $sum: "$debit" }
                        }
                  }
            ])
      ]);

      return mergeData(cashData, paymentData, type);
};

const getMinMaxDate = async () => {
      const [cashMin, cashMax, payMin, payMax] = await Promise.all([
            DailyCashModel.findOne().sort({ report_date: 1 }),
            DailyCashModel.findOne().sort({ report_date: -1 }),
            PaymentModel.findOne().sort({ transaction_date: 1 }),
            PaymentModel.findOne().sort({ transaction_date: -1 })
      ]);

      const minDate = new Date(Math.min(
            cashMin?.report_date || new Date(),
            payMin?.transaction_date || new Date()
      ));

      const maxDate = new Date(Math.max(
            cashMax?.report_date || new Date(),
            payMax?.transaction_date || new Date()
      ));

      return { minDate, maxDate };
};

const getReport = async (queryParams) => {
      const context = "ReportService.getReport";

      try {
            const { fromDate, toDate } = queryParams;

            const now = new Date();
            const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

            const currentYearStart = new Date(now.getFullYear(), 0, 1);
            const currentYearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59);

            const { minDate, maxDate } = await getMinMaxDate();

            // ===== DEFAULT =====
            const defaultDaily = await aggregateData("day", {
                  cash: { report_date: { $gte: currentMonthStart, $lte: currentMonthEnd } },
                  payment: { transaction_date: { $gte: currentMonthStart, $lte: currentMonthEnd } }
            });

            const defaultMonthly = await aggregateData("month", {
                  cash: { report_date: { $gte: currentYearStart, $lte: currentYearEnd } },
                  payment: { transaction_date: { $gte: currentYearStart, $lte: currentYearEnd } }
            });

            const defaultYearly = await aggregateData("year", {
                  cash: { report_date: { $gte: minDate, $lte: maxDate } },
                  payment: { transaction_date: { $gte: minDate, $lte: maxDate } }
            });

            // ===== CUSTOM =====
            let customStatistics = null;

            if (fromDate || toDate) {
                  const from = fromDate ? new Date(fromDate) : minDate;
                  const to = toDate ? new Date(toDate) : maxDate;

                  from.setHours(0, 0, 0, 0);
                  to.setHours(23, 59, 59, 999);

                  const startDate = from < minDate ? minDate : from;
                  const endDate = to > maxDate ? maxDate : to;

                  const match = {
                        cash: { report_date: { $gte: startDate, $lte: endDate } },
                        payment: { transaction_date: { $gte: startDate, $lte: endDate } }
                  };

                  customStatistics = {
                        fromDate,
                        toDate,
                        startDate,
                        endDate,
                        daily: await aggregateData("day", match),
                        monthly: await aggregateData("month", match),
                        yearly: await aggregateData("year", match)
                  };
            }

            return {
                  data: {
                        defaultStatistics: {
                              daily: defaultDaily,
                              monthly: defaultMonthly,
                              yearly: defaultYearly
                        },
                        customStatistics
                  }
            };

      } catch (error) {
            logger.error("Get report failed", {
                  context,
                  error: error.message,
                  stack: error.stack,
            });
            throw new Error("Lỗi khi lấy báo cáo.");
      }
};

module.exports = {
      getReport,
};