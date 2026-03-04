const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);
const Payments = require("../models/paymentModal");
const Users = require("../models/userModel");
const Products = require("../models/productModel");

const paymentCtrl = {
  createPayment: async (req, res) => {
    try {
      const session = await stripe.checkout.sessions.create({
        line_items: req.body.lineItems,
        mode: "payment",
        payment_method_types: ["card"],
        success_url: `http://localhost:3000/success/{CHECKOUT_SESSION_ID}`,
        cancel_url: "http://localhost:3000",
      });

      return res.status(201).json(session);
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  retrieveSession: async (req, res) => {
    try {
      const sessionId = req.params.id;
      const retrievedSession = await stripe.checkout.sessions.retrieve(
        sessionId
      );

      return res.status(200).json(retrievedSession);
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  getPayments: async (req, res) => {
    try {
      const payments = await Payments.find();
      res.json(payments);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  updateIfSuccess: async (req, res) => {
    try {
      const user = await Users.findById(req.user.id).select("name email");
      if (!user) return res.status(400).json({ msg: "User does not exist." });

      const { cart, paymentID, address, status, paymentMethod = 'stripe', discount = 0, couponId } = req.body;

      const { _id, name, email } = user;

      // Tính tổng tiền từ cart
      const totalBeforeDiscount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const totalAmount = totalBeforeDiscount - discount;

      const newPayment = new Payments({
        user_id: _id,
        name,
        email,
        cart,
        paymentID,
        address,
        status,
        paymentMethod,
        deliveryStatus: 'pending',
        discount,
        couponId,
        totalAmount
      });

      // Update sold quantity for each item in cart
      await Promise.all(
        cart.map((item) => {
          return sold(item._id, item.quantity, item.sold);
        })
      );

      await newPayment.save();
      res.json({ msg: "Payment Success!" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  
  // Thêm endpoint để tạo đơn hàng thanh toán tiền mặt
  createCashPayment: async (req, res) => {
    try {
      const user = await Users.findById(req.user.id).select("name email");
      if (!user) return res.status(400).json({ msg: "User does not exist." });

      const { cart, address, discount = 0, couponId } = req.body;

      if (!cart || cart.length === 0) {
        return res.status(400).json({ msg: "Cart is empty" });
      }

      const { _id, name, email } = user;
      const paymentID = "CASH_" + Date.now();

      // Tính tổng tiền từ cart
      const totalBeforeDiscount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const totalAmount = totalBeforeDiscount - discount;

      const newPayment = new Payments({
        user_id: _id,
        name,
        email,
        cart,
        paymentID,
        address,
        status: false, // Chưa thanh toán vì thanh toán tiền mặt
        paymentMethod: 'cash',
        deliveryStatus: 'pending',
        discount,
        couponId,
        totalAmount
      });

      // Update sold quantity for each item in cart
      await Promise.all(
        cart.map((item) => {
          return sold(item._id, item.quantity, item.sold);
        })
      );

      await newPayment.save();
      
      res.status(201).json({ 
        msg: "Cash order created successfully!",
        payment: newPayment
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  // Update delivery status (User can only update their own orders, Admin can update any order)
  updateDeliveryStatus: async (req, res) => {
    try {
      const { paymentId, deliveryStatus } = req.body;
      const userId = req.user.id;
      
      // Lấy thông tin user từ database để có role
      const user = await Users.findById(userId);
      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }
      
      const userRole = user.role; // 0: user, 1: admin

      if (!['pending', 'shipping', 'delivered', 'cancelled'].includes(deliveryStatus)) {
        return res.status(400).json({ msg: "Invalid delivery status" });
      }

      const payment = await Payments.findById(paymentId);
      
      if (!payment) {
        return res.status(404).json({ msg: "Payment not found" });
      }

      // Check authorization:
      // - User can only update their own orders (only to "delivered" status for confirmed receipt)
      // - Admin can update any order to any status
      if (userRole !== 1) { // Not admin
        if (payment.user_id.toString() !== userId.toString()) {
          return res.status(403).json({ msg: `You don't have permission to update this order` });
        }
        // User can only mark as delivered (confirmed receipt)
        if (deliveryStatus !== 'delivered') {
          return res.status(403).json({ msg: "You can only confirm delivery status" });
        }
      }

      const updatedPayment = await Payments.findByIdAndUpdate(
        paymentId,
        { deliveryStatus },
        { new: true }
      );

      res.json({ msg: "Delivery status updated", payment: updatedPayment });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  }
};

const sold = async (id, quantity, oldSold) => {
  await Products.findOneAndUpdate(
    { _id: id },
    {
      sold: quantity + oldSold,
    }
  );
};

module.exports = paymentCtrl;
