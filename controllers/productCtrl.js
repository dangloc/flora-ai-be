const Products = require("../models/productModel");

// Lọc, sắp xếp và phân trang

class APIfeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
    this.filterObj = {};
  }
  filtering() {
    const queryObj = { ...this.queryString }; //queryString = req.query

    const excludedFields = ["page", "sort", "limit", "skip"];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(gte|gt|lt|lte|regex)\b/g,
      (match) => "$" + match
    );

    //    gte = greater than or equal
    //    lte = lesser than or equal
    //    lt = lesser than
    //    gt = greater than
    this.filterObj = JSON.parse(queryStr);
    this.query.find(this.filterObj);

    return this;
  }

  sorting() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }

    return this;
  }

  paginating() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 9;
    const skip = this.queryString.skip * 1 || (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

const productCtrl = {
  getProducts: async (req, res) => {
    try {
      const features = new APIfeatures(Products.find(), req.query)
        .filtering()
        .sorting()
        .paginating();

      const products = await features.query;
      const totalCount = await Products.countDocuments(features.filterObj);

      res.json({
        status: "success",
        result: totalCount,
        products: products,
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  createProduct: async (req, res) => {
    try {
      const {
        product_id,
        title,
        price,
        description,
        content,
        images,
        category,
        brand,
        variants,
      } = req.body;
      if (!images)
        return res.status(400).json({ msg: "Chưa có hình sản phẩm" });

      const product = await Products.findOne({ product_id });
      if (product)
        return res.status(400).json({ msg: "Sản phẩm này đã tồn tại" });

      // Validate SKU unique nếu có variants
      if (variants && variants.length > 0) {
        const skus = variants.map(v => v.sku).filter(Boolean);
        if (skus.length !== new Set(skus).size) {
          return res.status(400).json({ msg: "SKU không được trùng lặp trong cùng sản phẩm" });
        }

        // Kiểm tra SKU có trùng với sản phẩm khác không
        for (const sku of skus) {
          const existingProduct = await Products.findOne({ "variants.sku": sku });
          if (existingProduct) {
            return res.status(400).json({ msg: `SKU ${sku} đã tồn tại trong sản phẩm khác` });
          }
        }
      }

      const newProduct = new Products({
        product_id,
        title: title.toLowerCase(),
        price,
        description,
        content,
        images,
        category,
        brand: brand ? brand.trim() : brand,
        variants: variants || [],
      });

      await newProduct.save();
      res.json({ msg: "Tạo thành công sản phẩm" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  deleteProduct: async (req, res) => {
    try {
      await Products.findByIdAndDelete(req.params.id);
      res.json({ msg: "Xóa thành công sản phẩm" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  updateProduct: async (req, res) => {
    try {
      const { title, price, description, content, images, category, brand, variants } = req.body;
      if (!images)
        return res.status(400).json({ msg: "Không có hình ảnh tải lên" });

      // Validate SKU unique nếu có variants
      if (variants && variants.length > 0) {
        const skus = variants.map(v => v.sku).filter(Boolean);
        if (skus.length !== new Set(skus).size) {
          return res.status(400).json({ msg: "SKU không được trùng lặp trong cùng sản phẩm" });
        }

        // Kiểm tra SKU có trùng với sản phẩm khác không (trừ sản phẩm hiện tại)
        for (const sku of skus) {
          const existingProduct = await Products.findOne({ 
            "variants.sku": sku,
            _id: { $ne: req.params.id }
          });
          if (existingProduct) {
            return res.status(400).json({ msg: `SKU ${sku} đã tồn tại trong sản phẩm khác` });
          }
        }
      }

      const updateData = {
        title: title.toLowerCase(),
        price,
        description,
        content,
        images,
        category,
        brand: brand ? brand.trim() : brand,
      };

      if (variants !== undefined) {
        updateData.variants = variants;
      }

      await Products.findOneAndUpdate(
        { _id: req.params.id },
        updateData
      );

      res.json({ msg: "Cập nhật sản phẩm thành công." });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  // Lấy tất cả variants của một sản phẩm
  getProductVariants: async (req, res) => {
    try {
      const product = await Products.findById(req.params.id);
      if (!product)
        return res.status(404).json({ msg: "Không tìm thấy sản phẩm" });

      res.json({
        status: "success",
        variants: product.variants || [],
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  // Thêm variant mới vào sản phẩm
  addVariant: async (req, res) => {
    try {
      const { sku, attributes, inventory, price, images } = req.body;

      if (!sku || !attributes || inventory === undefined) {
        return res.status(400).json({ 
          msg: "Vui lòng cung cấp đầy đủ: SKU, attributes, và inventory" 
        });
      }

      const product = await Products.findById(req.params.id);
      if (!product)
        return res.status(404).json({ msg: "Không tìm thấy sản phẩm" });

      // Kiểm tra SKU đã tồn tại chưa
      const existingVariant = product.variants.find(v => v.sku === sku);
      if (existingVariant) {
        return res.status(400).json({ msg: "SKU đã tồn tại trong sản phẩm này" });
      }

      // Kiểm tra SKU có trùng với sản phẩm khác không
      const existingProduct = await Products.findOne({ 
        "variants.sku": sku,
        _id: { $ne: req.params.id }
      });
      if (existingProduct) {
        return res.status(400).json({ msg: `SKU ${sku} đã tồn tại trong sản phẩm khác` });
      }

      product.variants.push({
        sku,
        attributes,
        inventory,
        price,
        images,
      });

      await product.save();
      res.json({ msg: "Thêm biến thể thành công" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  // Cập nhật variant
  updateVariant: async (req, res) => {
    try {
      const { variantId } = req.params;
      const { sku, attributes, inventory, price, images } = req.body;

      const product = await Products.findById(req.params.id);
      if (!product)
        return res.status(404).json({ msg: "Không tìm thấy sản phẩm" });

      const variant = product.variants.id(variantId);
      if (!variant)
        return res.status(404).json({ msg: "Không tìm thấy biến thể" });

      // Nếu SKU thay đổi, kiểm tra unique
      if (sku && sku !== variant.sku) {
        const existingVariant = product.variants.find(
          v => v.sku === sku && v._id.toString() !== variantId
        );
        if (existingVariant) {
          return res.status(400).json({ msg: "SKU đã tồn tại trong sản phẩm này" });
        }

        const existingProduct = await Products.findOne({ 
          "variants.sku": sku,
          _id: { $ne: req.params.id }
        });
        if (existingProduct) {
          return res.status(400).json({ msg: `SKU ${sku} đã tồn tại trong sản phẩm khác` });
        }
      }

      if (sku) variant.sku = sku;
      if (attributes) variant.attributes = attributes;
      if (inventory !== undefined) variant.inventory = inventory;
      if (price !== undefined) variant.price = price;
      if (images !== undefined) variant.images = images;

      await product.save();
      res.json({ msg: "Cập nhật biến thể thành công" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  // Xóa variant
  deleteVariant: async (req, res) => {
    try {
      const { variantId } = req.params;

      const product = await Products.findById(req.params.id);
      if (!product)
        return res.status(404).json({ msg: "Không tìm thấy sản phẩm" });

      const variant = product.variants.id(variantId);
      if (!variant)
        return res.status(404).json({ msg: "Không tìm thấy biến thể" });

      product.variants.pull(variantId);

      await product.save();

      res.json({ msg: "Xóa biến thể thành công" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  // Cập nhật số lượng tồn kho của variant
  updateVariantInventory: async (req, res) => {
    try {
      const { variantId } = req.params;
      const { inventory } = req.body;

      if (inventory === undefined || inventory < 0) {
        return res.status(400).json({ msg: "Số lượng tồn kho không hợp lệ" });
      }

      const product = await Products.findById(req.params.id);
      if (!product)
        return res.status(404).json({ msg: "Không tìm thấy sản phẩm" });

      const variant = product.variants.id(variantId);
      if (!variant)
        return res.status(404).json({ msg: "Không tìm thấy biến thể" });

      variant.inventory = inventory;

      await product.save();

      res.json({ 
        msg: "Cập nhật số lượng tồn kho thành công",
        inventory: variant.inventory,
        totalInventory: product.inventory
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  // Lấy sản phẩm bán chạy nhất
  getBestSellingProducts: async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 10; // Mặc định 10 sản phẩm
      const minSold = parseInt(req.query.minSold) || 1; // Số lượng bán tối thiểu (mặc định 0)

      const products = await Products.find({ 
        sold: { $gte: minSold } // Chỉ lấy sản phẩm có số lượng bán >= minSold
      })
        .sort({ sold: -1 }) // Sắp xếp theo số lượng bán giảm dần
        .limit(limit)
        .select('-__v'); // Loại bỏ field __v

      res.json({
        status: "success",
        result: products.length,
        products: products,
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

module.exports = productCtrl;
