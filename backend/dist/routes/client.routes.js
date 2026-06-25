"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const client_controller_1 = require("../controllers/client.controller");
const router = express_1.default.Router();
router.use(auth_middleware_1.protect);
router.get('/', client_controller_1.getClients);
router.get('/:id', client_controller_1.getClient);
router.post('/', client_controller_1.createClient);
router.put('/:id', client_controller_1.updateClient);
router.delete('/:id', auth_middleware_1.adminOnly, client_controller_1.deleteClient); // Admin only
exports.default = router;
//# sourceMappingURL=client.routes.js.map