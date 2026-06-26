"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const booking_controller_1 = require("../controllers/booking.controller");
const router = express_1.default.Router();
// POST is public - no authentication required
router.post('/', booking_controller_1.createBooking);
// All other routes require authentication
router.use(auth_middleware_1.protect);
// GET all bookings - admin only
router.get('/', auth_middleware_1.adminOnly, booking_controller_1.getBookings);
// GET single booking - admin only
router.get('/:id', auth_middleware_1.adminOnly, booking_controller_1.getBooking);
// Confirm booking - creates client and invoice
router.put('/:id/confirm', auth_middleware_1.adminOnly, booking_controller_1.confirmBooking);
// UPDATE booking status - admin only
router.put('/:id/status', auth_middleware_1.adminOnly, booking_controller_1.updateBookingStatus);
exports.default = router;
//# sourceMappingURL=booking.routes.js.map