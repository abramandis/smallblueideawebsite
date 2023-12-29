//const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

//require('dotenv').config()
const functions = require("firebase-functions");
const config = functions.config()
const sgMail = require("@sendgrid/mail");
const cors = require("cors")({
  origin: true
});


exports.emailMessage = functions.https.onRequest((req, res) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  const { name, email, category, message } = req.body;
  return cors(req, res, () => {
    var text = `<div>
      <h4>Information</h4>
      <ul>
        <li>
          Name - ${name || ""}
        </li>
        <li>
          Email - ${email || ""}
        </li>
        <li>
          Category - ${category || ""}
        </li>
      </ul>
      <h4>Message</h4>
      <p>${message || ""}</p>
    </div>`;
    const msg = {
      to: "smallblueidea@gmail.com",
      from: "info@smallblueidea.com",
      subject: `${name} sent you a new message`,
      text: text,
      html: text
    };
    sgMail.setApiKey(
      //process.env.SENDGRID_API_KEY
      config.sendgrid.key
    );
    sgMail.send(msg);
    res.status(200).send("success");
  }).catch(() => {
    res.status(500).send("error");
  });
});