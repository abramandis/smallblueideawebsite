const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const cors = require("cors");
const corsOptions = {
  origin: ["https://smallblueidea.com", "https://www.smallblueidea.com", "smallblueidea.com", "www.smallblueidea.com"],
  methods: ["GET", "POST"],
};

// Simple in-memory rate limiting (for production, use Redis or similar)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 10; // Max 10 requests per 15 minutes

function checkRateLimit(ip) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }
  
  const requests = rateLimitMap.get(ip);
  // Remove old requests outside the window
  const validRequests = requests.filter(timestamp => timestamp > windowStart);
  
  if (validRequests.length >= MAX_REQUESTS_PER_WINDOW) {
    return false; // Rate limit exceeded
  }
  
  validRequests.push(now);
  rateLimitMap.set(ip, validRequests);
  return true; // Rate limit OK
}

exports.helloWorld = onRequest((request, response) => {
   logger.info("Hello logs!", {structuredData: true});
   response.send("Hello from Firebase!");
});

// Send Postmark Email Function


const postmark = require("postmark");
//const express = require("express");
//const postmarkKey = functions.config().postmark.key; 
// Initialize Postmark with your server API token
const client = new postmark.ServerClient("cda672e5-607c-4922-ae5c-653882ee5eac");

exports.sendEmail = onRequest(cors(corsOptions), async (req, res) => {
  
  // Set CORS headers explicitly
  res.set('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

      try {
      logger.info("Request Body: ", req.body);
      
      // Firebase Functions v2 automatically parses JSON when Content-Type is application/json
      const {email, subject, message, name, category, honeypot, human, timestamp} = req.body;
    const contactUsEmail = "abram@smallblueidea.com";
    
    // Get client IP for rate limiting
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
    
    // Check rate limiting
    const rateLimitResult = checkRateLimit(clientIP);
    if (!rateLimitResult) {
      logger.warn(`Rate limit exceeded for IP: ${clientIP}`);
      res.status(429).json({ error: "Too many requests. Please wait before submitting another message." });
      return;
    }

    // Validate required fields with specific error messages
    if (!name) {
      res.status(400).json({ error: "Name is required." });
      return;
    }
    if (!email) {
      res.status(400).json({ error: "Email is required." });
      return;
    }
    if (!message) {
      res.status(400).json({ error: "Message is required." });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: "Please enter a valid email address." });
      return;
    }

    // Check honeypot field (should be empty if hidden properly)
    if (honeypot) {
      logger.warn(`Honeypot triggered by IP: ${clientIP}`);
      res.status(400).json({ error: "Spam detected. Your email has not been sent." });
      return;
    }



    // Validate timestamp (prevent instant submissions) - temporarily disabled for debugging
    if (timestamp) {
      const submissionTime = parseInt(timestamp);
      const currentTime = Date.now();
      const timeDiff = currentTime - submissionTime;
      
      logger.info(`Timestamp validation: submissionTime=${submissionTime}, currentTime=${currentTime}, timeDiff=${timeDiff}ms`);
      
      // If submission is too fast (less than 2 seconds), it's likely a bot
      if (timeDiff < 2000) {
        logger.warn(`Suspiciously fast submission from IP: ${clientIP}, time diff: ${timeDiff}ms`);
        // Temporarily allow fast submissions for debugging
        // res.status(400).json({ error: "Submission was too fast. Please take your time." });
        // return;
      }
    }

    // Additional bot detection: check for suspicious patterns
    const suspiciousPatterns = [
      /buy.*viagra/i,
      /casino/i,
      /loan/i,
      /make.*money.*fast/i,
      /click.*here/i,
      /free.*offer/i
    ];
    
    const messageText = `${message} ${name} ${email}`.toLowerCase();
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(messageText)) {
        logger.warn(`Suspicious content detected from IP: ${clientIP}`);
        res.status(400).json({ error: "Your message contains suspicious content." });
        return;
      }
    }

    // Log legitimate submission
    logger.info(`Legitimate contact form submission from: ${email}, IP: ${clientIP}`);

    // Send the email through Postmark
    await client.sendEmail({
      From: contactUsEmail,
      To: contactUsEmail,
      Subject: `Contact Us Submission - ${name}`,
      TextBody: `Name: ${name}\nEmail: ${email}\nMessage: ${message}\nIP: ${clientIP}`,
    });

    // Respond with success
    res.status(200).json({ success: "Your email has been sent successfully." });
  } catch (error) {
    logger.error('Error in sendEmail function:', error);
    // Respond with error
    res.status(500).json({ error: "There was an issue with your submission. Please try again." });
  }
});
