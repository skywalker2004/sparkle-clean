"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateNextCleaning = void 0;
const calculateNextCleaning = (client) => {
    if (!client.lastCleanedDate)
        return null; // or 'First visit'
    const last = new Date(client.lastCleanedDate);
    let days = 0;
    switch (client.frequency) {
        case 'weekly':
            days = 7;
            break;
        case 'biweekly':
            days = 14;
            break;
        case 'monthly':
            days = 30;
            break;
    }
    return new Date(last.setDate(last.getDate() + days));
};
exports.calculateNextCleaning = calculateNextCleaning;
//# sourceMappingURL=scheduleUtils.js.map