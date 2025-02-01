const nodemailer = require("nodemailer");
const { MailtrapTransport } = require("mailtrap");
const sendEmail = async (options) => {
  //: 1. Create a transporter
  //: for SMTP transport
  // const transporter = nodemailer.createTransport({
  //   host: process.env.EMAIL_HOST,
  //   port: process.env.EMAIL_PORT,
  //   auth: {
  //     user: process.env.EMAIL_USERNAME,
  //     pass: process.env.EMAIL_PASSWORD,
  //   },
  // });
  //: for API transport
  const transport = nodemailer.createTransport(
    MailtrapTransport({
      token: process.env.EMAIL_TOKEN,
      testInboxId: 3419860,
    })
  );
  //: 2. Define the email options
  const mailOptions = {
    from: "Omar H <omar@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };
  // //: 3. Actually send the email
  await transport.sendMail(mailOptions);
};

module.exports = sendEmail;
