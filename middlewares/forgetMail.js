const nodemailer = require("nodemailer");
const { pool } = require("../db/db");

exports.forgetMail = function (req, res, user) {
  const pageurl =
    req.protocol + "://" + req.get("host") + "/change-password/" + user.id;
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
    from: "Chakravarti Pvt. Ltd.<chakravartiashish2406@gmail.com>",
    to: req.body.email,
    subject: "Password Reset Link",
    text: "Do not share this link to anyone.",
    html: `<a href=${pageurl}>Password Reset Link</a>`,
  };

  transport.sendMail(mailOptions, (err, info) => {
    if (err) return res.send(err);
    console.log(info);
    const passwordResetToken = 1;
    const updateQuery =
      "UPDATE customers SET passwordResetToken = ? WHERE id = ?";
    pool.execute(updateQuery, [passwordResetToken, user.id]);

    return res.send(
      "<h1 style='text-align:center;color: greenyellow; margin-top:10%'><span style='font-size:60px;'></span> <br />Password Reset Link Sent! Check your inbox , <br/>check spam in case not found in inbox.</h1>"
    );
  });
};
