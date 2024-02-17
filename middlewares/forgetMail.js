const nodemailer = require("nodemailer");

exports.forgetMail = function (req, res, email, password) {
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
