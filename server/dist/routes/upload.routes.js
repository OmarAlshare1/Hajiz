"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const upload_controller_1 = require("../controllers/upload.controller");
const cloudinary_1 = require("../config/cloudinary");
const router = express_1.default.Router();
router.post('/provider/images', auth_1.auth, auth_1.isProvider, cloudinary_1.upload.array('images', 5), upload_controller_1.uploadProviderImages);
router.delete('/provider/images', auth_1.auth, auth_1.isProvider, upload_controller_1.deleteProviderImage);
exports.default = router;
//# sourceMappingURL=upload.routes.js.map