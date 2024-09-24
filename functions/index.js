const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

exports.helloWorld = onRequest((request, response) => {
   logger.info("Hello logs!", {structuredData: true});
   response.send("Hello from Firebase!");
});

// Send Postmark Email Function

const functions = require("firebase-functions");
const postmark = require("postmark");
//const express = require("express");
//const postmarkKey = functions.config().postmark.key; 
// Initialize Postmark with your server API token
const client = new postmark.ServerClient("cda672e5-607c-4922-ae5c-653882ee5eac");

exports.sendEmail = functions.https.onRequest(async (req, res) => {
  
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    //test 
  }

  try {
    const {email, subject, message, name, category} = req.body;
    const contactUsEmail = "abram@smallblueidea.com"

    // Send the email through Postmark
    await client.sendEmail({
      From: contactUsEmail,
      To: contactUsEmail,
      Subject: "Contact Us Submission",
      TextBody: `from: ${email}, name: ${name}, message: ${message}`, // Fixed TextBody construction
    });

    // Respond with success
    res.status(200).send(`
      <html>
        <body>
          <h1>Thank You!</h1>
          <p>Your email has been sent successfully.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error(error);
    // Respond with error
    res.status(500).send(`
      <html>
        <body>
          <h1>There was an issue with your submission.</h1>
          <p>Please try again.</p>
        </body>
      </html>
    `);
  }
});
