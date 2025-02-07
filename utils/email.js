const pug = require("pug");
const sgMail = require("@sendgrid/mail");

//*
// const nodemailer = require("nodemailer");
// const htmlToText = require("nodemailer-html-to-text");
// const nodemailerTransporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST,
//   port: process.env.EMAIL_PORT,
//   auth: {
//     user: process.env.EMAIL_USERNAME,
//     pass: process.env.EMAIL_PASSWORD,
//   },
//   debug: true,
//   logger: true,
// });
// const nodemailerTransporter = nodemailer.createTransport({
//   host: "sandbox.smtp.mailtrap.io",
//   port: 2525,
//   auth: {
//     user: "599c83f2a8ef0b",
//     pass: "a16ac89a3d3a5e",
//   },
//   debug: true,
//   logger: true,
// });
// const nodemailerTransporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 465,
//   secure: true,
//   auth: {
//     user: "omar.hisham.fouad@gmail.com",
//     pass: "touf uifl tehe rcco",
//   },
//   debug: true,
//   logger: true,
//   tls: {
//     rejectUnauthorized: false, // Ignore self-signed certificate errors
//   },
// });

const apiKey =
  process.env.NODE_ENV === "production"
    ? process.env.SENDGRID_API_KEY_PROD
    : process.env.SENDGRID_API_KEY_DEV;

sgMail.setApiKey(apiKey);
module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.from = process.env.EMAIL_FROM;
  }

  //? Send the actual email
  async send(template, subject) {
    //: 1. Render HTML based on the pug template
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );
    //: 2. Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      // text: htmlToText.htmlToText.toString(html),
      mailSettings: {
        sandboxMode: {
          enable: process.env.NODE_ENV !== "production", // Enable sandbox mode in non-production environments
        },
      },
    };

    //: 3. Create a transport and send email
    // await this.newTransport().sendMail(mailOptions);
    await sgMail.send(mailOptions);
  }

  async sendWelcome() {
    await this.send("welcome", "Welcome to the Naturs Family!");
  }

  async sendPasswordReset() {
    await this.send(
      "passwordReset",
      "Your password reset token (valid for only 10 minutes)"
    );
  }
};

//*
// /* const sendEmail = async (options) => {
//   //: 1. Create a transporter
//   //: for SMTP transport
//   // const transporter = nodemailer.createTransport({
//   //   host: process.env.EMAIL_HOST,
//   //   port: process.env.EMAIL_PORT,
//   //   auth: {
//   //     user: process.env.EMAIL_USERNAME,
//   //     pass: process.env.EMAIL_PASSWORD,
//   //   },
//   // });
//   //: for API transport
//   const transport = nodemailer.createTransport(
//     MailtrapTransport({
//       token: process.env.EMAIL_TOKEN,
//       testInboxId: 3419860,
//     })
//   );
//   //: 2. Define the email options
//   const mailOptions = {
//     from: "Omar H <omar@gmail.com>",
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//     // html:
//   };
//   // //: 3. Actually send the email
//   await transport.sendMail(mailOptions);
// }; */
