// ========================================================================
// FILE: src/utils/formatNumber.js
// ========================================================================
export const formatNumber = (num, decimals = 0) => {
    if (num === null || num === undefined || isNaN(num)) return '0';
    return num.toLocaleString('es-MX', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
};