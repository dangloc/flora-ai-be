const Category = require("../models/categoryModel");
const Products = require("../models/productModel");
const cloudinary = require("cloudinary");
const fs = require("fs");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const removeTmp = (path) => {
  fs.unlink(path, (err) => {
    if (err) throw err;
  });
};

const categoryCtrl = {
  getCategories: async (req, res) => {
    try {
      const categories = await Category.find();
      res.json(categories);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  createCategory: async (req, res) => {
    try {
      //nếu user role == 1 thì là admin
      // khi là admin thì có thể thêm sửa xóa danh mục
      const { name } = req.body;
      const category = await Category.findOne({ name });
      if (category)
        return res.status(400).json({ msg: "Danh mục đã tồn tại." });

      // Kiểm tra có file upload không
      if (!req.files || Object.keys(req.files).length === 0)
        return res.status(400).json({ msg: "Vui lòng tải lên hình ảnh cho danh mục." });

      const file = req.files.file;

      // Validate file type
      if (file.mimetype !== "image/jpeg" && file.mimetype !== "image/png" && file.mimetype !== "image/webp") {
        removeTmp(file.tempFilePath);
        return res
          .status(400)
          .json({ msg: "File không đúng định dạng (jpeg/png/webp)" });
      }

      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        removeTmp(file.tempFilePath);
        return res.status(400).json({ msg: "File không được lớn hơn 5MB" });
      }

      // Upload lên Cloudinary
      const result = await new Promise((resolve, reject) => {
        cloudinary.v2.uploader.upload(
          file.tempFilePath,
          { folder: "categories" },
          (err, result) => {
            if (err) {
              removeTmp(file.tempFilePath);
              reject(err);
            } else {
              resolve(result);
            }
          }
        );
      });

      removeTmp(file.tempFilePath);

      const newCategory = new Category({ 
        name,
        images: {
          public_id: result.public_id,
          url: result.secure_url,
        }
      });

      await newCategory.save();
      res.json({ msg: "Tạo danh mục thành công", category: newCategory });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  deleteCategory: async (req, res) => {
    try { 
      const products = await Products.findOne({category: req.params.id})
      if (products) return res.status(400).json({ msg: "Vui lòng xóa các sản phẩm có liên quan."})
      
      const category = await Category.findById(req.params.id);
      
      // Xóa ảnh trên Cloudinary nếu có
      if (category && category.images && category.images.public_id) {
        cloudinary.v2.uploader.destroy(category.images.public_id, (err) => {
          if (err) console.log("Lỗi khi xóa ảnh:", err);
        });
      }
      
      await Category.findByIdAndDelete(req.params.id);
      res.json({msg: "Xóa thành công."});
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  updateCategory: async (req, res) => {
    try {
        const {name} = req.body;

        await Category.findByIdAndUpdate({_id: req.params.id}, {name})

        res.json({msg: "Cập nhật thành công."});
      } catch (err) {
        return res.status(500).json({ msg: err.message });
      }
  },
  // Cập nhật ảnh category
  updateCategoryImage: async (req, res) => {
    try {
      const category = await Category.findById(req.params.id);
      if (!category)
        return res.status(404).json({ msg: "Không tìm thấy danh mục" });

      if (!req.files || Object.keys(req.files).length === 0)
        return res.status(400).json({ msg: "Không có file nào." });

      const file = req.files.file;

      // Validate file type
      if (file.mimetype !== "image/jpeg" && file.mimetype !== "image/png") {
        removeTmp(file.tempFilePath);
        return res
          .status(400)
          .json({ msg: "File không đúng định dạng (jpeg/png)" });
      }

      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        removeTmp(file.tempFilePath);
        return res.status(400).json({ msg: "File không được lớn hơn 5MB" });
      }

      // Xóa ảnh cũ trên Cloudinary nếu có
      if (category.images && category.images.public_id) {
        cloudinary.v2.uploader.destroy(category.images.public_id, (err) => {
          if (err) console.log("Lỗi khi xóa ảnh cũ:", err);
        });
      }

      // Upload ảnh mới
      const result = await new Promise((resolve, reject) => {
        cloudinary.v2.uploader.upload(
          file.tempFilePath,
          { folder: "categories" },
          (err, result) => {
            if (err) {
              removeTmp(file.tempFilePath);
              reject(err);
            } else {
              resolve(result);
            }
          }
        );
      });

      removeTmp(file.tempFilePath);

      // Cập nhật category với ảnh mới
      category.images = {
        public_id: result.public_id,
        url: result.secure_url,
      };

      await category.save();
      res.json({ msg: "Cập nhật ảnh danh mục thành công", category: category });
      } catch (err) {
        return res.status(500).json({ msg: err.message });
      }
  }
};

module.exports = categoryCtrl;
