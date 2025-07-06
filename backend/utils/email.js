const { Resend } = require('resend');

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@yourapp.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const APP_NAME = process.env.APP_NAME || 'Your App';

// Email templates
const emailTemplates = {
  verification: {
    subject: `Verify your email - ${APP_NAME}`,
    getHtml: (verificationLink, name) => `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${APP_NAME}</h1>
          </div>
          <div class="content">
            <h2>Welcome, ${name}!</h2>
            <p>Thank you for signing up for ${APP_NAME}. To complete your registration, please verify your email address by clicking the button below:</p>
            <a href="${verificationLink}" class="button">Verify Email Address</a>
            <p>This link will expire in 24 hours for security reasons.</p>
            <p>If you didn't create an account with us, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>If you're having trouble clicking the button, copy and paste this link into your browser:</p>
            <p><a href="${verificationLink}">${verificationLink}</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
    getText: (verificationLink, name) => `
      Welcome to ${APP_NAME}, ${name}!
      
      Thank you for signing up. To complete your registration, please verify your email address by visiting:
      
      ${verificationLink}
      
      This link will expire in 24 hours for security reasons.
      
      If you didn't create an account with us, please ignore this email.
    `
  },
  
  passwordReset: {
    subject: `Reset your password - ${APP_NAME}`,
    getHtml: (resetLink, name) => `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #dc2626; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .warning { background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${APP_NAME}</h1>
          </div>
          <div class="content">
            <h2>Hello, ${name}!</h2>
            <p>You have requested to reset your password for your ${APP_NAME} account. Please click the button below to reset your password:</p>
            <a href="${resetLink}" class="button">Reset Password</a>
            <p class="warning">This link is valid for only 1 hour. For security reasons, do not share this link with anyone.</p>
            <p>If you did not request a password reset, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>If you're having trouble clicking the button, copy and paste this link into your browser:</p>
            <p><a href="${resetLink}">${resetLink}</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
    getText: (resetLink, name) => `
      Hello, ${name}!
      
      You have requested to reset your password for your ${APP_NAME} account. Please visit the following link to reset your password:
      
      ${resetLink}
      
      This link is valid for only 1 hour. For security reasons, do not share this link with anyone.
      
      If you did not request a password reset, please ignore this email.
    `
  }
};


const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject,
      html,
      text,
    });

    if (error) {
      console.error('Error sending email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    // console.log('Email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Caught error in sendEmail:', error);
    throw error;
  }
};

module.exports = {
  sendEmail,
  emailTemplates,
  FRONTEND_URL,
  APP_NAME
};
