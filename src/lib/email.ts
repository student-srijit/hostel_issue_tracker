import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS || process.env.SMTP_PASSWORD,
  },
});

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    const recipients = Array.isArray(to) ? to.join(", ") : to;
    
    const info = await transporter.sendMail({
      from: `"Hostel Issue Tracker" <${process.env.SMTP_FROM || process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
      to: recipients,
      subject,
      text: text || html.replace(/<[^>]*>/g, ""),
      html,
    });

    console.log("Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}

// Email Templates

export function issueCreatedEmail(data: {
  userName: string;
  issueTitle: string;
  issueNumber: string;
  category: string;
  priority: string;
  issueUrl: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Issue Created</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">Issue Reported Successfully</h1>
    </div>
    <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
        Hello <strong>${data.userName}</strong>,
      </p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
        Your issue has been successfully reported. Our team will review it shortly.
      </p>
      
      <div style="background: #f9fafb; padding: 20px; border-radius: 12px; margin: 20px 0;">
        <h3 style="color: #111827; margin: 0 0 15px 0; font-size: 18px;">Issue Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280; width: 40%;">Issue Number</td>
            <td style="padding: 8px 0; color: #111827; font-weight: 600;">#${data.issueNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Title</td>
            <td style="padding: 8px 0; color: #111827; font-weight: 600;">${data.issueTitle}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Category</td>
            <td style="padding: 8px 0; color: #111827; font-weight: 600; text-transform: capitalize;">${data.category.replace("_", " ")}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Priority</td>
            <td style="padding: 8px 0;">
              <span style="display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase; ${
                data.priority === "emergency" ? "background: #fef2f2; color: #dc2626;" :
                data.priority === "high" ? "background: #fff7ed; color: #ea580c;" :
                data.priority === "medium" ? "background: #fefce8; color: #ca8a04;" :
                "background: #f0fdf4; color: #16a34a;"
              }">${data.priority}</span>
            </td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.issueUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
          View Issue Details
        </a>
      </div>

      <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
        You will receive email notifications when there are updates to your issue.
      </p>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
      
      <p style="color: #9ca3af; font-size: 12px; text-align: center;">
        This is an automated message from Hostel Issue Tracker. Please do not reply to this email.
      </p>
    </div>
  </div>
</body>
</html>
`;
}

export function issueStatusUpdateEmail(data: {
  userName: string;
  issueTitle: string;
  issueNumber: string;
  newStatus: string;
  statusNote?: string;
  issueUrl: string;
}) {
  const statusColors: Record<string, { bg: string; text: string; label: string }> = {
    open: { bg: "#fef3c7", text: "#d97706", label: "Open" },
    in_progress: { bg: "#dbeafe", text: "#2563eb", label: "In Progress" },
    resolved: { bg: "#dcfce7", text: "#16a34a", label: "Resolved" },
    closed: { bg: "#f3f4f6", text: "#6b7280", label: "Closed" },
  };

  const status = statusColors[data.newStatus] || statusColors.open;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Issue Status Update</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">Issue Status Updated 🔄</h1>
    </div>
    <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
        Hello <strong>${data.userName}</strong>,
      </p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
        The status of your issue has been updated.
      </p>
      
      <div style="background: #f9fafb; padding: 20px; border-radius: 12px; margin: 20px 0;">
        <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Issue #${data.issueNumber}</p>
        <h3 style="color: #111827; margin: 0 0 15px 0; font-size: 18px;">${data.issueTitle}</h3>
        
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="color: #6b7280;">New Status:</span>
          <span style="display: inline-block; padding: 6px 16px; border-radius: 9999px; font-size: 14px; font-weight: 600; background: ${status.bg}; color: ${status.text};">
            ${status.label}
          </span>
        </div>
        
        ${data.statusNote ? `
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; color: #6b7280; font-size: 14px;">Note:</p>
          <p style="margin: 5px 0 0 0; color: #374151;">${data.statusNote}</p>
        </div>
        ` : ""}
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.issueUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
          View Issue
        </a>
      </div>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
      
      <p style="color: #9ca3af; font-size: 12px; text-align: center;">
        This is an automated message from Hostel Issue Tracker.
      </p>
    </div>
  </div>
</body>
</html>
`;
}

export function newCommentEmail(data: {
  userName: string;
  issueTitle: string;
  issueNumber: string;
  commenterName: string;
  commentContent: string;
  issueUrl: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Comment</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">New Comment 💬</h1>
    </div>
    <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
        Hello <strong>${data.userName}</strong>,
      </p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
        <strong>${data.commenterName}</strong> commented on your issue.
      </p>
      
      <div style="background: #f9fafb; padding: 20px; border-radius: 12px; margin: 20px 0;">
        <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Issue #${data.issueNumber}: ${data.issueTitle}</p>
        
        <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #8b5cf6;">
          <p style="margin: 0; color: #374151; font-style: italic;">"${data.commentContent}"</p>
        </div>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.issueUrl}" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
          Reply to Comment
        </a>
      </div>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
      
      <p style="color: #9ca3af; font-size: 12px; text-align: center;">
        This is an automated message from Hostel Issue Tracker.
      </p>
    </div>
  </div>
</body>
</html>
`;
}
