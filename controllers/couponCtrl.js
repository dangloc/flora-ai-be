const Coupon = require("../models/couponModel");
const Products = require("../models/productModel");

const couponCtrl = {
    // Tạo coupon mới (admin only)
    createCoupon: async (req, res) => {
        try {
            const {
                code,
                description,
                discountType,
                discountValue,
                maxDiscount,
                expiryDate,
                startDate,
                applicableProducts,
                applicableCategories,
                usageLimit,
                usagePerUser,
                minOrderValue
            } = req.body;

            // Validate input
            if (!code || !discountValue || !expiryDate) {
                return res.status(400).json({ msg: "Vui lòng cung cấp code, discountValue và expiryDate" });
            }

            // Kiểm tra code đã tồn tại chưa
            const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
            if (existingCoupon) {
                return res.status(400).json({ msg: "Mã coupon này đã tồn tại" });
            }

            // Validate discount value
            if (discountType === 'percentage' && (discountValue < 0 || discountValue > 100)) {
                return res.status(400).json({ msg: "Giá trị chiết khấu phần trăm phải từ 0-100" });
            }

            if (discountValue < 0) {
                return res.status(400).json({ msg: "Giá trị chiết khấu không được âm" });
            }

            const newCoupon = new Coupon({
                code: code.toUpperCase(),
                description,
                discountType,
                discountValue,
                maxDiscount,
                expiryDate,
                startDate,
                applicableProducts,
                applicableCategories,
                usageLimit,
                usagePerUser: usagePerUser || 1,
                minOrderValue: minOrderValue || 0
            });

            await newCoupon.save();
            res.json({ msg: "Tạo coupon thành công", coupon: newCoupon });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // Lấy tất cả coupon
    getCoupons: async (req, res) => {
        try {
            const { isActive } = req.query;
            const filter = {};

            if (isActive === 'true') {
                filter.isActive = true;
            } else if (isActive === 'false') {
                filter.isActive = false;
            }

            const coupons = await Coupon.find(filter)
                .populate('applicableProducts', 'title')
                .sort({ createdAt: -1 });

            res.json({
                status: "success",
                result: coupons.length,
                coupons: coupons
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // Lấy chi tiết coupon
    getCoupon: async (req, res) => {
        try {
            const coupon = await Coupon.findById(req.params.id)
                .populate('applicableProducts', 'title');

            if (!coupon) {
                return res.status(404).json({ msg: "Không tìm thấy coupon" });
            }

            res.json({
                status: "success",
                coupon: coupon
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // Cập nhật coupon
    updateCoupon: async (req, res) => {
        try {
            const {
                code,
                description,
                discountType,
                discountValue,
                maxDiscount,
                expiryDate,
                startDate,
                applicableProducts,
                applicableCategories,
                usageLimit,
                usagePerUser,
                minOrderValue,
                isActive
            } = req.body;

            // Kiểm tra coupon tồn tại
            const coupon = await Coupon.findById(req.params.id);
            if (!coupon) {
                return res.status(404).json({ msg: "Không tìm thấy coupon" });
            }

            // Nếu thay đổi code, kiểm tra unique
            if (code && code.toUpperCase() !== coupon.code) {
                const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
                if (existingCoupon) {
                    return res.status(400).json({ msg: "Mã coupon này đã tồn tại" });
                }
            }

            // Validate discount value
            if (discountValue) {
                if (discountType === 'percentage' && (discountValue < 0 || discountValue > 100)) {
                    return res.status(400).json({ msg: "Giá trị chiết khấu phần trăm phải từ 0-100" });
                }
                if (discountValue < 0) {
                    return res.status(400).json({ msg: "Giá trị chiết khấu không được âm" });
                }
            }

            const updateData = {};
            if (code) updateData.code = code.toUpperCase();
            if (description !== undefined) updateData.description = description;
            if (discountType) updateData.discountType = discountType;
            if (discountValue !== undefined) updateData.discountValue = discountValue;
            if (maxDiscount !== undefined) updateData.maxDiscount = maxDiscount;
            if (expiryDate) updateData.expiryDate = expiryDate;
            if (startDate) updateData.startDate = startDate;
            if (applicableProducts !== undefined) updateData.applicableProducts = applicableProducts;
            if (applicableCategories !== undefined) updateData.applicableCategories = applicableCategories;
            if (usageLimit !== undefined) updateData.usageLimit = usageLimit;
            if (usagePerUser !== undefined) updateData.usagePerUser = usagePerUser;
            if (minOrderValue !== undefined) updateData.minOrderValue = minOrderValue;
            if (isActive !== undefined) updateData.isActive = isActive;

            const updatedCoupon = await Coupon.findByIdAndUpdate(
                req.params.id,
                updateData,
                { new: true }
            ).populate('applicableProducts', 'title');

            res.json({ msg: "Cập nhật coupon thành công", coupon: updatedCoupon });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // Xóa coupon
    deleteCoupon: async (req, res) => {
        try {
            const coupon = await Coupon.findByIdAndDelete(req.params.id);
            if (!coupon) {
                return res.status(404).json({ msg: "Không tìm thấy coupon" });
            }

            res.json({ msg: "Xóa coupon thành công" });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // Validate và apply coupon
    validateCoupon: async (req, res) => {
        try {
            const { code, cart, userId } = req.body;

            if (!code || !cart || !userId) {
                return res.status(400).json({ msg: "Vui lòng cung cấp code, cart và userId" });
            }

            // Tìm coupon
            const coupon = await Coupon.findOne({ code: code.toUpperCase() });
            if (!coupon) {
                return res.status(404).json({ msg: "Mã coupon không tồn tại" });
            }

            // Kiểm tra coupon active
            if (!coupon.isActive) {
                return res.status(400).json({ msg: "Coupon này đã ngừng sử dụng" });
            }

            // Kiểm tra ngày hết hạn
            const now = new Date();
            if (coupon.expiryDate < now) {
                return res.status(400).json({ msg: "Coupon này đã hết hạn" });
            }

            // Kiểm tra ngày bắt đầu
            if (coupon.startDate && coupon.startDate > now) {
                return res.status(400).json({ msg: "Coupon này chưa có hiệu lực" });
            }

            // Kiểm tra số lần sử dụng
            if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
                return res.status(400).json({ msg: "Coupon này đã hết lượt sử dụng" });
            }

            // Kiểm tra số lần sử dụng per user
            const userUsage = coupon.usedBy.find(u => u.userId.toString() === userId);
            if (userUsage && userUsage.count >= coupon.usagePerUser) {
                return res.status(400).json({ msg: `Bạn chỉ được sử dụng coupon này ${coupon.usagePerUser} lần` });
            }

            // Kiểm tra sản phẩm áp dụng
            let validItems = cart;
            if (coupon.applicableProducts.length > 0) {
                validItems = cart.filter(item => {
                    return coupon.applicableProducts.some(prodId => 
                        prodId.toString() === item._id || prodId.toString() === item.id
                    );
                });

                if (validItems.length === 0) {
                    return res.status(400).json({ msg: "Coupon này không áp dụng cho các sản phẩm trong giỏ của bạn" });
                }
            }

            // Kiểm tra category áp dụng
            if (coupon.applicableCategories.length > 0) {
                validItems = validItems.filter(item => 
                    coupon.applicableCategories.includes(item.category)
                );

                if (validItems.length === 0) {
                    return res.status(400).json({ msg: "Coupon này không áp dụng cho danh mục sản phẩm trong giỏ của bạn" });
                }
            }

            // Tính tổng giá trị sản phẩm áp dụng
            const applicableTotal = validItems.reduce((sum, item) => {
                return sum + (item.price * item.quantity);
            }, 0);

            // Kiểm tra giá trị đơn hàng tối thiểu
            const totalOrder = cart.reduce((sum, item) => {
                return sum + (item.price * item.quantity);
            }, 0);

            if (totalOrder < coupon.minOrderValue) {
                return res.status(400).json({ 
                    msg: `Giá trị đơn hàng tối thiểu là ${coupon.minOrderValue.toLocaleString('vi-VN')} VND` 
                });
            }

            // Tính discount
            let discount = 0;
            if (coupon.discountType === 'percentage') {
                discount = (applicableTotal * coupon.discountValue) / 100;
                if (coupon.maxDiscount) {
                    discount = Math.min(discount, coupon.maxDiscount);
                }
            } else {
                discount = coupon.discountValue;
                discount = Math.min(discount, applicableTotal);
            }

            res.json({
                status: "success",
                msg: "Coupon hợp lệ",
                coupon: {
                    _id: coupon._id,
                    code: coupon.code,
                    discountType: coupon.discountType,
                    discountValue: coupon.discountValue,
                    maxDiscount: coupon.maxDiscount,
                    description: coupon.description
                },
                discount: Math.round(discount),
                applicableTotal: Math.round(applicableTotal),
                finalTotal: Math.round(totalOrder - discount)
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // Apply coupon (cập nhật usage count)
    applyCoupon: async (req, res) => {
        try {
            const { couponId, userId } = req.body;

            if (!couponId || !userId) {
                return res.status(400).json({ msg: "Vui lòng cung cấp couponId và userId" });
            }

            const coupon = await Coupon.findById(couponId);
            if (!coupon) {
                return res.status(404).json({ msg: "Không tìm thấy coupon" });
            }

            // Cập nhật usage count
            coupon.usageCount += 1;

            // Cập nhật usedBy
            const userUsage = coupon.usedBy.find(u => u.userId.toString() === userId);
            if (userUsage) {
                userUsage.count += 1;
                userUsage.usedAt = new Date();
            } else {
                coupon.usedBy.push({
                    userId,
                    usedAt: new Date(),
                    count: 1
                });
            }

            await coupon.save();
            res.json({ msg: "Áp dụng coupon thành công", coupon });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }
};

module.exports = couponCtrl;
