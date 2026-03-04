const nodemailer = require('nodemailer');
const Contact = require('../models/contactModel');

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'rubiesin2015@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your_app_password_here'
  }
});

const contactCtrl = {
  // Send contact email
  sendMail: async (req, res) => {
    try {
      const { name, email, phone, subject, message } = req.body;

      // Validate fields
      if (!name || !email || !phone || !subject || !message) {
        return res.status(400).json({ msg: 'Vui lòng điền đầy đủ tất cả các trường' });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ msg: 'Email không hợp lệ' });
      }

      // Save to database
      const newContact = new Contact({
        name,
        email,
        phone,
        subject,
        message,
        status: 'new'
      });

      await newContact.save();

      // Prepare email content
      const mailOptions = {
        from: process.env.EMAIL_USER || 'rubiesin2015@gmail.com',
        to: process.env.ADMIN_EMAIL || 'rubiesin2015@gmail.com',
        replyTo: email,
        subject: `[Liên Hệ] ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f5f5f5; padding: 20px; border-radius: 8px;">
            <h2 style="color: #ff6b6b; margin-bottom: 20px;">Thông Tin Liên Hệ Mới</h2>
            
            <div style="background-color: white; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; font-weight: 600; color: #333; width: 120px;">Tên:</td>
                  <td style="padding: 10px 0; color: #666;">${name}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; font-weight: 600; color: #333;">Email:</td>
                  <td style="padding: 10px 0; color: #666;">
                    <a href="mailto:${email}" style="color: #ff6b6b; text-decoration: none;">${email}</a>
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; font-weight: 600; color: #333;">Điện thoại:</td>
                  <td style="padding: 10px 0; color: #666;">
                    <a href="tel:${phone}" style="color: #ff6b6b; text-decoration: none;">${phone}</a>
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; font-weight: 600; color: #333;">Chủ đề:</td>
                  <td style="padding: 10px 0; color: #666;">${subject}</td>
                </tr>
              </table>
            </div>

            <div style="background-color: white; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
              <h3 style="color: #333; margin: 0 0 15px 0; font-size: 16px;">Nội dung:</h3>
              <p style="color: #666; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
            </div>

            <div style="text-align: center; color: #999; font-size: 12px;">
              <p>Thời gian gửi: ${new Date().toLocaleString('vi-VN')}</p>
            </div>
          </div>
        `
      };

      // Send email
      await transporter.sendMail(mailOptions);

      // Send confirmation email to user
      const confirmationEmail = {
        from: process.env.EMAIL_USER || 'rubiesin2015@gmail.com',
        to: email,
        subject: 'Xác nhận nhận được tin nhắn liên hệ - Lamia Shop',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f5f5f5; padding: 20px; border-radius: 8px;">
            <h2 style="color: #ff6b6b; margin-bottom: 20px;">Cảm ơn bạn đã liên hệ!</h2>
            
            <div style="background-color: white; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
              <p style="color: #666; line-height: 1.6; margin: 0 0 15px 0;">Xin chào ${name},</p>
              <p style="color: #666; line-height: 1.6; margin: 0 0 15px 0;">
                Chúng tôi đã nhận được tin nhắn của bạn. Đội ngũ hỗ trợ khách hàng của Lamia sẽ liên hệ bạn trong thời gian sớm nhất.
              </p>
              
              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0;">
                <h3 style="color: #333; margin: 0 0 10px 0; font-size: 14px;">Thông tin tin nhắn của bạn:</h3>
                <p style="color: #666; margin: 5px 0; font-size: 13px;"><strong>Chủ đề:</strong> ${subject}</p>
                <p style="color: #666; margin: 5px 0; font-size: 13px;"><strong>Thời gian gửi:</strong> ${new Date().toLocaleString('vi-VN')}</p>
              </div>

              <p style="color: #666; line-height: 1.6; margin: 0 0 15px 0;">
                Nếu bạn không nhận được phản hồi trong 24 giờ, vui lòng gọi hotline của chúng tôi: <strong>070 347 0938</strong>
              </p>

              <p style="color: #666; line-height: 1.6; margin: 0;">Cảm ơn bạn vì sự tin tưởng!</p>
              <p style="color: #999; font-size: 12px; margin: 20px 0 0 0;">- Đội ngũ Lamia</p>
            </div>
          </div>
        `
      };

      await transporter.sendMail(confirmationEmail);

      res.status(200).json({ msg: 'Gửi tin nhắn thành công!' });
    } catch (error) {
      console.error('Contact email error:', error);
      res.status(500).json({ msg: 'Lỗi khi gửi tin nhắn. Vui lòng thử lại sau!' });
    }
  },

  // Get all contact messages (admin only)
  getContacts: async (req, res) => {
    try {
      const contacts = await Contact.find().sort({ createdAt: -1 });
      res.status(200).json(contacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      res.status(500).json({ msg: 'Lỗi khi lấy danh sách liên hệ' });
    }
  },

  // Mark contact as read
  markAsRead: async (req, res) => {
    try {
      const { id } = req.params;
      const contact = await Contact.findByIdAndUpdate(
        id,
        { status: 'read' },
        { new: true }
      );
      res.status(200).json(contact);
    } catch (error) {
      console.error('Error updating contact:', error);
      res.status(500).json({ msg: 'Lỗi khi cập nhật trạng thái' });
    }
  },

  // Delete contact message
  deleteContact: async (req, res) => {
    try {
      const { id } = req.params;
      await Contact.findByIdAndDelete(id);
      res.status(200).json({ msg: 'Xóa tin nhắn thành công' });
    } catch (error) {
      console.error('Error deleting contact:', error);
      res.status(500).json({ msg: 'Lỗi khi xóa tin nhắn' });
    }
  }
};

module.exports = contactCtrl;
