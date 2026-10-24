import nodemailer from 'nodemailer';

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const hasValidCreds =
      process.env.EMAIL_USER &&
      process.env.EMAIL_PASS &&
      process.env.EMAIL_USER !== 'your_email@gmail.com' &&
      process.env.EMAIL_PASS !== 'your_email_app_password';

    let transporter;

    if (hasValidCreds) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    } else {
      // Test development mode: nodemailer ethereal or console logger fallback
      console.log(`\n================= [SIMULATED EMAIL DISPATCH] =================`);
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Message: ${text || html}`);
      console.log(`===============================================================\n`);
      return { success: true, simulated: true };
    }

    const mailOptions = {
      from: `"Social App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`Email sending error: ${error.message}`);
    // Do not crash the caller; return error state
    return { success: false, error: error.message };
  }
};
