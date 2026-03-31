"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const subscription_routes_1 = __importDefault(require("./routes/subscription.routes"));
const score_routes_1 = __importDefault(require("./routes/score.routes"));
const charity_routes_1 = __importDefault(require("./routes/charity.routes"));
const draw_routes_1 = __importDefault(require("./routes/draw.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true, // allows cookies to be sent
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/user', user_routes_1.default);
app.use('/api/subscriptions', subscription_routes_1.default);
app.use('/api/scores', score_routes_1.default);
app.use('/api/charities', charity_routes_1.default);
app.use('/api/draws', draw_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
