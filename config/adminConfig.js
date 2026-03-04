/**
 * Admin Configuration
 * Danh sách các admin ID được phép truy cập admin chat
 */

const ADMIN_IDS = [
    "6919e36400ed9addca8f882b",  // Admin chính
    "691ad98fefb395c7228478a3"
    // Thêm admin ID khác nếu cần: "id_admin_2", "id_admin_3", ...
];

module.exports = {
    ADMIN_IDS,
    // Helper function để kiểm tra có phải admin không
    isAdmin: (userId) => {
        return userId && ADMIN_IDS.includes(userId.toString());
    },
    // Helper function để lấy main admin (admin đầu tiên trong array)
    getMainAdmin: () => {
        return ADMIN_IDS[0];
    }
};
