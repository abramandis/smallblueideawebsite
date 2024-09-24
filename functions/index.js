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

exports.sendEmail = onRequest(async (req, res) => {
  logger.info("hello logs!")
  
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    //test 
  }

  try {
    const {email, subject, message} = req.body;
    const contactUsEmail = "abram@smallblueidea.com"

    // Send the email through Postmark
    await client.sendEmail({
      From: email,
      To: contactUsEmail,
      Subject: subject,
      TextBody: message,
    });

    // Respond with success
    res.status(200).json({
      success: true,
      message: "Email sent successfully"});
  } catch (error) {
    console.error(error);
    // Respond with error
    res.status(500).json({
      success: false,
      message: error.message});
  }
});
