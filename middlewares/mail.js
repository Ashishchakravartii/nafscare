const nodemailer = require("nodemailer");

exports.sendmail = function (req, res, email, name) {
  const transport = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      user: "chakravartiashish2406@gmail.com",
      pass: "mnytbsgcbmpcngjo",
    },
  });

  const mailOptions = {
    from: "NAFSCARE Pvt. Ltd.<chakravartiashish2406@gmail.com>",
    to: email,
    subject: "Thank you for registering to NAFSCARE.",
    text: "Thank you for registering and welcome to NAFSCARE.",
  };

  const adminMailOptions = {
    from: "NAFSCARE Pvt. Ltd.<chakravartiashish2406@gmail.com>",
    to: "shehbaz_vayani@randomforest.in",
    subject: "New registration on NAFSCARE.",
    text: `You have new registration on Nafscare. USERNAME: ${name}, EMAIL: ${email}`,
  };

  transport.sendMail(adminMailOptions, (err, info) => {
    if (err) {
      console.error("Error sending admin email:", err);
    } else {
      console.log("Admin email sent:", info);
    }
  });

  transport.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error("Error sending user email:", err);
      return res.status(500).send("<script> alert(' Error sending email to user')</script>");
    } else {
      console.log("User email sent:", info);
      return res.redirect("/auth");
    }
  });
};
