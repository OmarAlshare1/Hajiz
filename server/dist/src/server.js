"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const PORT = parseInt(process.env.PORT || '5000', 10);
const HOST = process.env.HOST || '127.0.0.1';
app_1.default.listen(PORT, HOST, () => {
    if (process.env.NODE_ENV === 'development') {
        console.log(`Server is running on ${HOST}:${PORT}`);
    }
});
//# sourceMappingURL=server.js.map