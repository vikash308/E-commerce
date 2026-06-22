const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  console.log('\n====================================');
  console.log(`📧 SENDING EMAIL (via Nodemailer)`);
  console.log(`To: ${options.email}`);
  console.log(`Subject: ${options.subject}`);
  console.log(`Message:\n${options.message}`);
  console.log('====================================\n');

  // Check if SMTP is configured (not using placeholder values)
  const isSmtpConfigured = 
    process.env.SMTP_MAIL && 
    process.env.SMTP_MAIL !== 'your-email@gmail.com' && 
    process.env.SMTP_PASSWORD && 
    process.env.SMTP_PASSWORD !== 'your-app-password';

  if (!isSmtpConfigured) {
    console.log('⚠️ SMTP credentials not fully configured in .env. Email was logged to console above.');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    service: process.env.SMTP_SERVICE || 'gmail',
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"E-Commerce Support" <${process.env.SMTP_MAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
