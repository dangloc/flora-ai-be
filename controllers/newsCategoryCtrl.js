const NewsCategory = require("../models/newsCategoryModel");

// Hàm tạo slug
const createSlug = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+|-+$/g, '');
};

const newsCategoryCtrl = {
    // Lấy tất cả danh mục tin tức
    getCategories: async (req, res) => {
        try {
            const { isActive } = req.query;
            const filter = {};

            if (isActive === 'true') {
                filter.isActive = true;
            }

            const categories = await NewsCategory.find(filter)
                .sort({ order: 1, createdAt: -1 });

            res.json({
                status: "success",
                result: categories.length,
                categories: categories
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // Lấy danh mục tin tức theo slug
    getCategoryBySlug: async (req, res) => {
        try {
            const { slug } = req.params;

            const category = await NewsCategory.findOne({ slug });
            if (!category) {
                return res.status(404).json({ msg: "Không tìm thấy danh mục tin tức" });
            }

            res.json({
                status: "success",
                category: category
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // Lấy chi tiết danh mục
    getCategory: async (req, res) => {
        try {
            const category = await NewsCategory.findById(req.params.id);
            if (!category) {
                return res.status(404).json({ msg: "Không tìm thấy danh mục tin tức" });
            }

            res.json({
                status: "success",
                category: category
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // Tạo danh mục tin tức mới (admin)
    createCategory: async (req, res) => {
        try {
            const { name, description, image, order } = req.body;

            if (!name) {
                return res.status(400).json({ msg: "Vui lòng cung cấp tên danh mục" });
            }

            // Kiểm tra danh mục đã tồn tại chưa
            const existingCategory = await NewsCategory.findOne({ name });
            if (existingCategory) {
                return res.status(400).json({ msg: "Danh mục này đã tồn tại" });
            }

            const slug = createSlug(name);

            // Kiểm tra slug trùng
            const existingSlug = await NewsCategory.findOne({ slug });
            if (existingSlug) {
                return res.status(400).json({ msg: "Slug này đã tồn tại" });
            }

            const newCategory = new NewsCategory({
                name,
                slug,
                description,
                image,
                order: order || 0
            });

            await newCategory.save();
            res.json({ msg: "Tạo danh mục thành công", category: newCategory });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // Cập nhật danh mục (admin)
    updateCategory: async (req, res) => {
        try {
            const { name, description, image, order, isActive } = req.body;

            const category = await NewsCategory.findById(req.params.id);
            if (!category) {
                return res.status(404).json({ msg: "Không tìm thấy danh mục tin tức" });
            }

            // Nếu thay đổi name, cập nhật slug
            let slug = category.slug;
            if (name && name !== category.name) {
                slug = createSlug(name);

                // Kiểm tra slug trùng
                const existingSlug = await NewsCategory.findOne({
                    slug,
                    _id: { $ne: req.params.id }
                });
                if (existingSlug) {
                    return res.status(400).json({ msg: "Slug này đã tồn tại" });
                }

                // Kiểm tra name trùng
                const existingName = await NewsCategory.findOne({
                    name,
                    _id: { $ne: req.params.id }
                });
                if (existingName) {
                    return res.status(400).json({ msg: "Danh mục này đã tồn tại" });
                }
            }

            const updateData = {};
            if (name) updateData.name = name;
            if (slug) updateData.slug = slug;
            if (description !== undefined) updateData.description = description;
            if (image !== undefined) updateData.image = image;
            if (order !== undefined) updateData.order = order;
            if (isActive !== undefined) updateData.isActive = isActive;

            const updatedCategory = await NewsCategory.findByIdAndUpdate(
                req.params.id,
                updateData,
                { new: true }
            );

            res.json({ msg: "Cập nhật danh mục thành công", category: updatedCategory });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // Xóa danh mục (admin)
    deleteCategory: async (req, res) => {
        try {
            const category = await NewsCategory.findByIdAndDelete(req.params.id);
            if (!category) {
                return res.status(404).json({ msg: "Không tìm thấy danh mục tin tức" });
            }

            // Nên kiểm tra xem có tin tức nào dùng danh mục này không
            const News = require("../models/newsModel");
            const newsCount = await News.countDocuments({ category: req.params.id });
            
            if (newsCount > 0) {
                return res.status(400).json({ 
                    msg: `Không thể xóa danh mục có ${newsCount} tin tức. Vui lòng xóa hoặc chuyển các tin tức trước.` 
                });
            }

            res.json({ msg: "Xóa danh mục thành công" });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }
};

module.exports = newsCategoryCtrl;
