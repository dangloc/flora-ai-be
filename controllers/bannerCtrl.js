const Banner = require("../models/bannerModel");
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

const bannerCtrl = {
  // Lấy tất cả banner (active và không active)
  getBanners: async (req, res) => {
    try {
      const { active } = req.query;
      let query = {};
      
      // Nếu có query active, chỉ lấy banner active
      if (active === "true") {
        query.active = true;
      }

      const banners = await Banner.find(query).sort({ order: 1, createdAt: -1 });
      res.json({
        status: "success",
        result: banners.length,
        banners: banners,
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  // Lấy một banner theo ID
  getBanner: async (req, res) => {
    try {
      const banner = await Banner.findById(req.params.id);
      if (!banner)
        return res.status(404).json({ msg: "Không tìm thấy banner" });

      res.json({
        status: "success",
        banner: banner,
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  // Upload và tạo banner mới
  createBanner: async (req, res) => {
    try {
      const { title, link, order, active } = req.body;

      if (!req.files || Object.keys(req.files).length === 0)
        return res.status(400).json({ msg: "Không có file nào." });

      const file = req.files.file;

      // Validate file type
      if (file.mimetype !== "image/jpeg" && file.mimetype !== "image/png" && file.mimetype !== "image/jpg" && file.mimetype !== "image/webp") {
        removeTmp(file.tempFilePath);
        return res
          .status(400)
          .json({ msg: "File không đúng định dạng (jpeg/png/jpg/webp)" });
      }

      // Validate file size (có thể lớn hơn 1MB cho banner)
      if (file.size > 5 * 1024 * 1024) {
        removeTmp(file.tempFilePath);
        return res.status(400).json({ msg: "File không được lớn hơn 5MB" });
      }

      // Upload lên Cloudinary
      cloudinary.v2.uploader.upload(
        file.tempFilePath,
        { folder: "banners" },
        async (err, result) => {
          if (err) {
            removeTmp(file.tempFilePath);
            return res.status(500).json({ msg: err.message });
          }

          removeTmp(file.tempFilePath);

          // Tạo banner mới
          const newBanner = new Banner({
            title: title || "",
            image: {
              public_id: result.public_id,
              url: result.secure_url,
            },
            link: link || "",
            order: order ? parseInt(order) : 0,
            active: active !== undefined ? active === "true" : true,
          });

          await newBanner.save();
          res.json({ msg: "Tạo banner thành công", banner: newBanner });
        }
      );
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  // Cập nhật banner (không upload ảnh mới)
  updateBanner: async (req, res) => {
    try {
      const { title, link, order, active } = req.body;

      const banner = await Banner.findById(req.params.id);
      if (!banner)
        return res.status(404).json({ msg: "Không tìm thấy banner" });

      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (link !== undefined) updateData.link = link;
      if (order !== undefined) updateData.order = parseInt(order);
      if (active !== undefined) updateData.active = active === "true" || active === true;

      await Banner.findByIdAndUpdate(req.params.id, updateData);

      res.json({ msg: "Cập nhật banner thành công" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  // Cập nhật banner với ảnh mới
  updateBannerImage: async (req, res) => {
    try {
      const banner = await Banner.findById(req.params.id);
      if (!banner)
        return res.status(404).json({ msg: "Không tìm thấy banner" });

      if (!req.files || Object.keys(req.files).length === 0)
        return res.status(400).json({ msg: "Không có file nào." });

      const file = req.files.file;

      // Validate file type
      if (file.mimetype !== "image/jpeg" && file.mimetype !== "image/png" && file.mimetype !== "image/jpg" && file.mimetype !== "image/webp") {
          removeTmp(file.tempFilePath);
          return res
          .status(400)
          .json({ msg: "File không đúng định dạng (jpeg/png/jpg/webp)" });
      }

      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        removeTmp(file.tempFilePath);
        return res.status(400).json({ msg: "File không được lớn hơn 5MB" });
      }

      // Xóa ảnh cũ trên Cloudinary
      if (banner.image && banner.image.public_id) {
        cloudinary.v2.uploader.destroy(banner.image.public_id, (err) => {
          if (err) console.log("Lỗi khi xóa ảnh cũ:", err);
        });
      }

      // Upload ảnh mới
      cloudinary.v2.uploader.upload(
        file.tempFilePath,
        { folder: "banners" },
        async (err, result) => {
          if (err) {
            removeTmp(file.tempFilePath);
            return res.status(500).json({ msg: err.message });
          }

          removeTmp(file.tempFilePath);

          // Cập nhật banner với ảnh mới
          banner.image = {
            public_id: result.public_id,
            url: result.secure_url,
          };

          await banner.save();
          res.json({ msg: "Cập nhật ảnh banner thành công", banner: banner });
        }
      );
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  // Xóa banner
  deleteBanner: async (req, res) => {
    try {
      const banner = await Banner.findById(req.params.id);
      if (!banner)
        return res.status(404).json({ msg: "Không tìm thấy banner" });

      // Xóa ảnh trên Cloudinary
      if (banner.image && banner.image.public_id) {
        cloudinary.v2.uploader.destroy(banner.image.public_id, (err) => {
          if (err) console.log("Lỗi khi xóa ảnh:", err);
        });
      }

      await Banner.findByIdAndDelete(req.params.id);
      res.json({ msg: "Xóa banner thành công" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

module.exports = bannerCtrl;

