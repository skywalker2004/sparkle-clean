require("dotenv").config();
const nodemailer = require("nodemailer");

async function testEmail() {
  console.log("Testing with:", process.env.EMAIL_USER);
  console.log("Password length:", process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : "MISSING");
  console.log("Admin email:", process.env.ADMIN_EMAIL);

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: { rejectUnauthorized: false },
  });

  try {
    await transporter.verify();
    console.log("✅ Transporter verified successfully");

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: "✅ SparkleClean Email Test — " + new Date().toLocaleTimeString(),
      html: "<h1 style='color:green'>SparkleClean Email Test</h1><p>If you see this, emails are working perfectly!</p><p>Sent at: " + new Date().toString() + "</p>",
    });

    console.log("✅ Email sent successfully!");
    console.log("Message ID:", info.messageId);
    console.log("Response:", info.response);
  } catch (error) {
    console.error("❌ EMAIL FAILED:", error && error.message ? error.message : error);
    console.error("Error code:", error && error.code ? error.code : "-");
    console.error("Full error:", error);
  }
}

testEmail();
