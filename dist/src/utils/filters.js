"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyFilters = applyFilters;
function applyFilters(items, opts) {
    const { period, minChange, minVolume } = opts;
    return items.filter((t) => {
        if (minVolume != null && t.volume_sol != null && t.volume_sol < minVolume)
            return false;
        if (minChange != null) {
            const change = pickChange(t, period);
            if (change == null || change < minChange)
                return false;
        }
        return true;
    });
}
function pickChange(t, period) {
    if (period === '1h')
        return t.price_1hr_change;
    if (period === '24h')
        return t.price_24h_change;
    if (period === '7d')
        return t.price_7d_change;
    return t.price_24h_change ?? t.price_1hr_change ?? t.price_7d_change;
}
