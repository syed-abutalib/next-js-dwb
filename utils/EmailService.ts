import nodemailer from "nodemailer";

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.hostinger.com",
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true, // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER || "info@dailyworldblog.com",
      pass: process.env.SMTP_PASS, // your Hostinger email password
    },
  });
};

// Get formatted from address
const getFromAddress = (customFrom) => {
  if (customFrom) return customFrom;

  const domainEmail = process.env.DOMAIN_EMAIL || "info@dailyworldblog.com";
  const domainName = process.env.DOMAIN_NAME || "Daily World Blog";

  return `"${domainName}" <${domainEmail}>`;
};

export const sendEmail = async ({ to, subject, html, from, replyTo }) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: getFromAddress(from),
      to,
      subject,
      html,
      replyTo,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email sending error:", error);
    throw error;
  }
};

// Update email templates to use the domain email
export const emailTemplates = {
  subscriberAutoReply: (email) => ({
    subject: "Welcome to Daily World Blog Newsletter!",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Daily World Blog</title>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; padding: 20px; background: #f9f9f9; border-radius: 8px; }
          .header { text-align: center; padding: 20px 0; background: linear-gradient(135deg, #2563eb, #000); border-radius: 8px 8px 0 0; }
          .header h1 { color: white; margin: 0; font-size: 24px; }
          .content { padding: 30px; background: white; border-radius: 0 0 8px 8px; }
          .signature { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Daily World Blog! 📬</h1>
          </div>
          <div class="content">
            <h2>Hello Subscriber!</h2>
            <p>Thank you for subscribing to the Daily World Blog newsletter. We're excited to have you on board!</p>
            
            <p>You'll now receive:</p>
            <ul>
              <li>📰 Daily news updates</li>
              <li>💡 Expert insights and analysis</li>
              <li>📈 Market trends and reports</li>
              <li>🎉 Exclusive content and offers</li>
            </ul>
            
            <p>Stay tuned for our next newsletter coming soon!</p>
            
            <div class="signature">
              <p>Best regards,<br>
              <strong>The Daily World Blog Team</strong><br>
              <a href="mailto:info@dailyworldblog.com" style="color: #2563eb; text-decoration: none;">info@dailyworldblog.com</a></p>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Daily World Blog. All rights reserved.</p>
            <p>You're receiving this because you subscribed to our newsletter.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  contactFormAdmin: (data) => ({
    subject: `New Contact Form Inquiry: ${data.subject}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Form Submission</title>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 20px auto; background: #fff; border: 1px solid #ddd; border-radius: 8px; }
          .header { padding: 20px; background: linear-gradient(135deg, #2563eb, #000); color: white; border-radius: 8px 8px 0 0; }
          .header h2 { margin: 0; }
          .content { padding: 30px; }
          .field { margin-bottom: 20px; padding: 15px; background: #f5f5f5; border-left: 4px solid #2563eb; border-radius: 4px; }
          .label { font-weight: bold; color: #2563eb; margin-bottom: 5px; }
          .value { color: #333; }
          hr { border: none; border-top: 1px solid #ddd; margin: 20px 0; }
          .reply-info { background: #e8f0fe; padding: 15px; border-radius: 6px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>📬 New Contact Form Submission</h2>
          </div>
          <div class="content">
            <p>You have received a new message from the contact form:</p>
            
            <div class="field">
              <div class="label">Name:</div>
              <div class="value">${data.name}</div>
            </div>
            
            <div class="field">
              <div class="label">Email:</div>
              <div class="value">${data.email}</div>
            </div>
            
            ${
              data.company
                ? `
            <div class="field">
              <div class="label">Company:</div>
              <div class="value">${data.company}</div>
            </div>
            `
                : ""
            }
            
            <div class="field">
              <div class="label">Inquiry Type:</div>
              <div class="value">${data.contactType}</div>
            </div>
            
            <div class="field">
              <div class="label">Subject:</div>
              <div class="value">${data.subject}</div>
            </div>
            
            <div class="field">
              <div class="label">Message:</div>
              <div class="value">${data.message.replace(/\n/g, "<br>")}</div>
            </div>
            
            <div class="reply-info">
              <p><strong>Reply-to:</strong> ${data.email}</p>
              <p>When replying, the email will come from info@dailyworldblog.com</p>
            </div>
            
            <hr>
            
            <p><small>This message was sent from the contact form on Daily World Blog.</small></p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  contactFormAutoReply: (data) => ({
    subject: "Thank you for contacting Daily World Blog",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Thank You for Contacting Us</title>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 20px auto; background: #fff; border: 1px solid #ddd; border-radius: 8px; }
          .header { padding: 20px; background: linear-gradient(135deg, #2563eb, #000); color: white; border-radius: 8px 8px 0 0; }
          .header h2 { margin: 0; }
          .content { padding: 30px; }
          .message-preview { background: #f5f5f5; padding: 15px; border-radius: 6px; margin: 20px 0; }
          .signature { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Thank You for Contacting Us! ✨</h2>
          </div>
          <div class="content">
            <p>Dear ${data.name},</p>
            
            <p>Thank you for reaching out to Daily World Blog. We have received your message and will get back to you within 24-48 hours.</p>
            
            <p><strong>Here's a copy of your message:</strong></p>
            
            <div class="message-preview">
              <p><strong>Subject:</strong> ${data.subject}</p>
              <p><strong>Message:</strong></p>
              <p>${data.message.replace(/\n/g, "<br>")}</p>
            </div>
            
            <p>If you have any additional information to add, please feel free to reply to this email.</p>
            
            <div class="signature">
              <p>Best regards,<br>
              <strong>The Daily World Blog Team</strong><br>
              <a href="mailto:info@dailyworldblog.com" style="color: #2563eb; text-decoration: none;">info@dailyworldblog.com</a></p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
};

export default {
  sendEmail,
  emailTemplates,
};
