"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const invoice_controller_1 = require("../controllers/invoice.controller");
const router = express_1.default.Router();
router.use(auth_middleware_1.protect);
router.get("/", invoice_controller_1.getInvoices);
router.post("/", invoice_controller_1.createInvoice);
router.post("/record-cleaning", invoice_controller_1.recordCleaning);
router.put("/mark-paid", invoice_controller_1.markPaid);
router.put("/mark-unpaid", invoice_controller_1.markUnpaid);
router.get("/dashboard-stats", invoice_controller_1.getDashboardStats);
router.get("/monthly-revenue", invoice_controller_1.getMonthlyRevenue);
exports.default = router;
//# sourceMappingURL=invoice.routes.js.map