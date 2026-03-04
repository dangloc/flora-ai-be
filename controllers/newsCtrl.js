const News = require("../models/newsModel");
const NewsCategory = require("../models/newsCategoryModel");
const Users = require("../models/userModel");

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

const newsCtrl = {
    // Lấy tất cả tin tức
    getNews: async (req, res) => {
        try {
            const { category, search, isFeatured, page = 1, limit = 10 } = req.query;
            const filter = { isPublished: true };

            if (category) {
                filter.category = category;
            }

            if (isFeatured === 'true') {
                filter.isFeatured = true;
            }

            if (search) {
                filter.$text = { $search: search };
            }

            const skip = (page - 1) * limit;

            const news = await News.find(filter)
                .populate('category', 'name slug')
                .populate('author', 'name')
                .sort({ publishedAt: -1 })
                .skip(skip)
                .limit(parseInt(limit));

            const totalCount = await News.countDocuments(filter);

            res.json({
                status: "success",
                result: news.length,
                total: totalCount,
                page: parseInt(page),
                pages: Math.ceil(totalCount / limit),
                news: news
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // Lấy tin tức theo category
    getNewsByCategory: async (req, res) => {
        try {
            const { slug } = req.params;
            const { page = 1, limit = 10 } = req.query;

            console.log("Getting news by category - slug:", slug);

            // Tìm category theo slug
            const category = await NewsCategory.findOne({ slug });
            console.log("Found category:", category);
            
            if (!category) {
                return res.status(404).json({ msg: "Không tìm thấy danh mục tin tức" });
            }

            const skip = (page - 1) * limit;

            const news = await News.find({
                category: category._id,
                isPublished: true
            })
                .populate('category', 'name slug')
                .populate('author', 'name')
                .sort({ publishedAt: -1 })
                .skip(skip)
                .limit(parseInt(limit));

            const totalCount = await News.countDocuments({
                category: category._id,
                isPublished: true
            });

            res.json({
                status: "success",
                result: news.length,
                total: totalCount,
                page: parseInt(page),
                pages: Math.ceil(totalCount / limit),
                category: category,
                news: news
            });
        } catch (err) {
            console.error("Error in getNewsByCategory:", err);
            return res.status(500).json({ msg: err.message });
        }
    },

    // Lấy chi tiết tin tức
    getNewsDetail: async (req, res) => {
        try {
            const { slug } = req.params;

            const news = await News.findOne({ slug, isPublished: true })
                .populate('category', 'name slug')
                .populate('author', 'name email');

            if (!news) {
                return res.status(404).json({ msg: "Không tìm thấy tin tức" });
            }

            // Tăng view count
            await News.findByIdAndUpdate(
                news._id,
                { $inc: { views: 1 } }
            );

            // Cập nhật views cho response
            news.views += 1;

            res.json({
                status: "success",
                news: news
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // Tạo tin tức mới (admin)
    createNews: async (req, res) => {
        try {
            const {
                title,
                description,
                content,
                image,
                category,
                tags,
                isFeatured
            } = req.body;

            if (!title || !content || !image || !category) {
                return res.status(400).json({ msg: "Vui lòng cung cấp đầy đủ thông tin" });
            }

            // Kiểm tra category tồn tại
            const categoryExists = await NewsCategory.findById(category);
            if (!categoryExists) {
                return res.status(404).json({ msg: "Danh mục tin tức không tồn tại" });
            }

            const slug = createSlug(title);

            // Kiểm tra slug trùng (chỉ check published news)
            const existingNews = await News.findOne({ slug, isPublished: true });
            if (existingNews) {
                return res.status(400).json({ msg: "Tiêu đề tin tức này đã tồn tại" });
            }

            const newNews = new News({
                title,
                slug,
                description,
                content,
                image,
                category,
                author: req.user.id,
                tags: tags || [],
                isFeatured: isFeatured || false,
                publishedAt: new Date()
            });

            await newNews.save();
            await newNews.populate('category', 'name slug');
            await newNews.populate('author', 'name');

            res.json({ msg: "Tạo tin tức thành công", news: newNews });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // Cập nhật tin tức (admin)
    updateNews: async (req, res) => {
        try {
            const {
                title,
                description,
                content,
                image,
                category,
                tags,
                isFeatured,
                isPublished
            } = req.body;

            const news = await News.findById(req.params.id);
            if (!news) {
                return res.status(404).json({ msg: "Không tìm thấy tin tức" });
            }

            // Kiểm tra category nếu thay đổi
            if (category && category !== news.category.toString()) {
                const categoryExists = await NewsCategory.findById(category);
                if (!categoryExists) {
                    return res.status(404).json({ msg: "Danh mục tin tức không tồn tại" });
                }
            }

            // Nếu thay đổi title, cập nhật slug
            let slug = news.slug;
            if (title && title !== news.title) {
                slug = createSlug(title);

                // Kiểm tra slug trùng (chỉ check published news)
                const existingNews = await News.findOne({
                    slug,
                    isPublished: true,
                    _id: { $ne: req.params.id }
                });
                if (existingNews) {
                    return res.status(400).json({ msg: "Tiêu đề tin tức này đã tồn tại" });
                }
            }

            const updateData = {};
            if (title) updateData.title = title;
            if (slug) updateData.slug = slug;
            if (description !== undefined) updateData.description = description;
            if (content) updateData.content = content;
            if (image) updateData.image = image;
            if (category) updateData.category = category;
            if (tags !== undefined) updateData.tags = tags;
            if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
            if (isPublished !== undefined) updateData.isPublished = isPublished;

            const updatedNews = await News.findByIdAndUpdate(
                req.params.id,
                updateData,
                { new: true }
            )
                .populate('category', 'name slug')
                .populate('author', 'name');

            res.json({ msg: "Cập nhật tin tức thành công", news: updatedNews });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // Xóa tin tức (admin)
    deleteNews: async (req, res) => {
        try {
            const news = await News.findByIdAndDelete(req.params.id);
            if (!news) {
                return res.status(404).json({ msg: "Không tìm thấy tin tức" });
            }

            res.json({ msg: "Xóa tin tức thành công" });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // Like tin tức
    likeNews: async (req, res) => {
        try {
            const { id } = req.params;

            const news = await News.findByIdAndUpdate(
                id,
                { $inc: { likes: 1 } },
                { new: true }
            );

            if (!news) {
                return res.status(404).json({ msg: "Không tìm thấy tin tức" });
            }

            res.json({ msg: "Like thành công", likes: news.likes });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // Lấy tin tức nổi bật
    getFeaturedNews: async (req, res) => {
        try {
            const { limit = 5 } = req.query;

            const news = await News.find({
                isFeatured: true,
                isPublished: true
            })
                .populate('category', 'name slug')
                .populate('author', 'name')
                .sort({ publishedAt: -1 })
                .limit(parseInt(limit));

            res.json({
                status: "success",
                result: news.length,
                news: news
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    // Lấy tin tức bán chạy nhất
    getTrendingNews: async (req, res) => {
        try {
            const { limit = 10, days = 7 } = req.query;
            const dateFrom = new Date();
            dateFrom.setDate(dateFrom.getDate() - parseInt(days));

            const news = await News.find({
                isPublished: true,
                publishedAt: { $gte: dateFrom }
            })
                .populate('category', 'name slug')
                .populate('author', 'name')
                .sort({ views: -1, likes: -1 })
                .limit(parseInt(limit));

            res.json({
                status: "success",
                result: news.length,
                news: news
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }
};

module.exports = newsCtrl;
