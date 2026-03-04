const { response } = require("express");
const Users = require("../models/userModel");
const Payments = require("../models/paymentModal");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userCtrl = {
  register: async (req, res) => {
    try {
      const { name, email, password } = req.body;

      const user = await Users.findOne({ email });

      if (user) return res.status(400).json({ msg: "Email đã được đăng ký" });

      if (password.length < 6)
        return res
          .status(400)
          .json({ msg: "Mật khẩu không được ít hơn 6 ký tự." });

      // Mã hóa mật khẩu
      const passwordHash = await bcrypt.hash(password, 10);
      const newUser = new Users({
        name,
        email,
        password: passwordHash,
      });
      await newUser.save();

      //Tạo token để xác thực
      const accesstoken = createAccessToken({ id: newUser._id });
      const refreshtoken = createRefreshToken({ id: newUser._id });

      res.cookie("refreshtoken", refreshtoken, {
        httpOnly: true,
        path: "/user/refresh_token",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7days
      });

      res.json(accesstoken);
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await Users.findOne({ email });

      if (!user)
        return res.status(400).json({ msg: "Người dùng không tồn tại." });

      isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ msg: "Sai mật khẩu." });

      const accesstoken = createAccessToken({ id: user._id });
      const refreshtoken = createRefreshToken({ id: user._id });

      res.cookie("refreshtoken", refreshtoken, {
        httpOnly: true,
        path: "/user/refresh_token",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7days
      });

      res.json(accesstoken);
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  logout: async (req, res) => {
    try {
      res.clearCookie('refreshtoken', {path: "/user/refresh_token"});
      return res.json({msg: "Đăng xuất"})
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  refreshToken: (req, res) => {
    try {
      const rf_token = req.cookies.refreshtoken;
      if (!rf_token)
        return res.status(400).json({ msg: "Hãy đăng nhập hoặc đăng ký" });

      jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err)
          return res.status(400).json({ msg: "Hãy đăng nhập hoặc đăng ký" });
        const accesstoken = createAccessToken({ id: user.id });

        return res.json({ accesstoken });
      });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  getUser: async (req, res) => {
    try {
      const user = await Users.findById(req.user.id).select('-password');
      if(!user) return res.status(404).json({ msg:"Người dùng không tồn tại."});

      res.json(user);
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  addCart: async (req, res) => {
    try {
      const user = await Users.findById(req.user.id)
      if(!user) return res.status(400).json({msg:"Người dùng không tồn tại."})

      await Users.findOneAndUpdate({_id:req.user.id}, {
        cart: req.body.cart
      })

      return res.json({msg:"Đã thêm sản phẩm"})
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  history: async (req, res) => {
    try {
        const history = await Payments.find({user_id: req.user.id})
        res.json(history);
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  likeProduct: async (req, res) => {
    try {
      const { productId } = req.body;
      
      if (!productId) {
        return res.status(400).json({ msg: "Product ID is required" });
      }

      const user = await Users.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ msg: "Người dùng không tồn tại" });
      }

      // Check if product already liked
      const alreadyLiked = user.likes.includes(productId);
      if (alreadyLiked) {
        return res.status(400).json({ msg: "Sản phẩm đã được thích rồi" });
      }

      // Add to user likes
      user.likes.push(productId);
      await user.save();

      // Increment product likes count
      const Products = require("../models/productModel");
      await Products.findByIdAndUpdate(
        productId,
        { $inc: { likes: 1 } },
        { new: true }
      );

      res.json({ msg: "Đã thích sản phẩm" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  unlikeProduct: async (req, res) => {
    try {
      const { productId } = req.body;
      
      if (!productId) {
        return res.status(400).json({ msg: "Product ID is required" });
      }

      const user = await Users.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ msg: "Người dùng không tồn tại" });
      }

      // Check if product is liked
      const isLiked = user.likes.includes(productId);
      if (!isLiked) {
        return res.status(400).json({ msg: "Sản phẩm chưa được thích" });
      }

      // Remove from user likes
      user.likes = user.likes.filter(id => id.toString() !== productId);
      await user.save();

      // Decrement product likes count
      const Products = require("../models/productModel");
      await Products.findByIdAndUpdate(
        productId,
        { $inc: { likes: -1 } },
        { new: true }
      );

      res.json({ msg: "Đã bỏ thích sản phẩm" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  getUserLikes: async (req, res) => {
    try {
      const user = await Users.findById(req.user.id).populate('likes');
      if (!user) {
        return res.status(404).json({ msg: "Người dùng không tồn tại" });
      }

      res.json({
        status: "success",
        result: user.likes.length,
        likes: user.likes
      });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  checkProductLike: async (req, res) => {
    try {
      const { productId } = req.params;

      const user = await Users.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ msg: "Người dùng không tồn tại" });
      }

      const isLiked = user.likes.includes(productId);
      res.json({ isLiked });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  getAllAdmins: async (req, res) => {
    try {
      const admins = await Users.find({ role: 1 }).select('-password');
      res.json(admins);
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  // Lấy admin duy nhất (admin support)
  getMainAdmin: async (req, res) => {
    try {
      // Lấy admin đầu tiên (hoặc có thể lấy theo ID cố định)
      const admin = await Users.findOne({ role: 1 }).select('_id name email');
      
      if (!admin) {
        return res.status(404).json({ msg: "Không tìm thấy admin" });
      }

      res.json({
        status: "success",
        admin: admin
      });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }
};

const createAccessToken = (user) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1d" });
};

const createRefreshToken = (user) => {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
};

module.exports = userCtrl;
