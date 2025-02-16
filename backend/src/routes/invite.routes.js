const { supabase } = require('../config/supabase'); // Import Supabase client
const nodemailer = require('nodemailer'); // For sending emails

exports.sendInvitation = async (req, res) => {
  try {
    const { email, role } = req.body; // Get email & role from request

    // ✅ Step 1: Create a new user in Supabase auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      email_confirm: false, // Set to false so they verify via the invite email
      user_metadata: { role }
    });

    if (error) throw error; // Handle any errors

    // ✅ Step 2: Generate an invite link
    const inviteLink = `https://your-app.com/signup?email=${email}`;

    // ✅ Step 3: Send Email using Yahoo SMTP
    let transporter = nodemailer.createTransport({
      host: "smtp.mail.yahoo.com",
      port: 465,
      secure: true, // Use SSL (465) or TLS (587)
      auth: {
        user: "talanamarion@yahoo.com",
        pass: "your-yahoo-app-password" // Use Yahoo's App Password
      }
    });

    let mailOptions = {
      from: '"Your App Name" <talanamarion@yahoo.com>',
      to: email,
      subject: "You're invited to join Propease!",
      text: `Hello, you've been invited to join Propease. Click here to sign up: ${inviteLink}`,
      html: `<p>Hello,</p><p>You've been invited to join Propease.</p><p><a href="${inviteLink}">Click here to sign up</a></p>`
    };

    await transporter.sendMail(mailOptions); // Send the email

    return res.status(200).json({ message: "Invitation sent successfully", inviteLink });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

// Example route setup
const express = require('express');
const router = express.Router();

router.post('/send-invitation', sendInvitation);

module.exports = router;
