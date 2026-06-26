/*
 * HOW TO GET GMAIL APP PASSWORD:
 * 1. Go to myaccount.google.com
 * 2. Click Security
 * 3. Enable 2-Step Verification if not already on
 * 4. Search for "App Passwords" in the search bar
 * 5. Select app: Mail, device: Windows Computer
 * 6. Copy the 16-character password generated
 * 7. Paste it as EMAIL_PASS in .env (no spaces)
 * 8. Use your full Gmail as EMAIL_USER
 *
 * IMPORTANT: EMAIL_PASS must be a Gmail App Password, not the regular Gmail password.
 * Admin must go to Google Account → Security → 2-Step Verification → App Passwords → Generate one for "Mail".
 */

import nodemailer from 'nodemailer';
import { IBooking } from '../models/Booking.model';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export function formatBookingDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-KE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatKES(amount: number): string {
  return `KSh ${amount.toLocaleString('en-KE')}`;
}

function getFirstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || fullName;
}

function buildClientConfirmationHtml(booking: IBooking): string {
  const firstName = getFirstName(booking.fullName);
  const formattedDate = formatBookingDate(booking.preferredDate);
  const amount = formatKES(booking.totalPrice);
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  const detailRow = (label: string, value: string, valueStyle = '') =>
    `<tr>
      <td style="padding:12px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:14px;width:40%;">${label}</td>
      <td style="padding:12px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:14px;text-align:right;${valueStyle}">${value}</td>
    </tr>`;

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background-color:#10b981;border-radius:12px 12px 0 0;padding:32px 24px;text-align:center;">
          <p style="margin:0 0 8px;font-size:36px;">✨</p>
          <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:bold;">SparkleClean Kenya</h1>
          <p style="margin:8px 0 0;color:#d1fae5;font-size:14px;">Premium Cleaning Services · Nairobi</p>
        </td></tr>

        <!-- Hero -->
        <tr><td style="background-color:#ffffff;padding:40px 32px;text-align:center;">
          <p style="margin:0 0 16px;font-size:48px;">✅</p>
          <h2 style="margin:0 0 12px;color:#0f172a;font-size:24px;font-weight:bold;">Your Booking is Confirmed!</h2>
          <p style="margin:0;color:#64748b;font-size:15px;line-height:1.6;">Thank you ${firstName}! We have received your booking and our team will call you within 2 hours to confirm your appointment.</p>
        </td></tr>

        <!-- Booking Details -->
        <tr><td style="background-color:#ffffff;padding:0 32px 32px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border-radius:8px;border-left:4px solid #10b981;padding:20px 24px;">
            <tr><td>
              <h3 style="margin:0 0 16px;color:#0f172a;font-size:16px;font-weight:bold;">📋 Booking Details</h3>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${detailRow('Booking Reference', booking.bookingRef, 'font-weight:bold;color:#10b981;')}
                ${detailRow('Service', booking.serviceType)}
                ${detailRow('Total Amount', amount, 'font-weight:bold;')}
                ${detailRow('Date', formattedDate)}
                ${detailRow('Time', booking.preferredTime)}
                ${detailRow('Property', `${booking.propertyType} · ${booking.propertySize}`)}
                ${detailRow('Address', booking.address)}
                ${detailRow('Frequency', booking.frequency, 'border-bottom:none;')}
              </table>
            </td></tr>
          </table>
        </td></tr>

        <!-- What Happens Next -->
        <tr><td style="background-color:#ffffff;padding:0 32px 32px;">
          <h3 style="margin:0 0 16px;color:#0f172a;font-size:16px;font-weight:bold;">What Happens Next?</h3>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:12px;background-color:#f8fafc;border-radius:8px;margin-bottom:8px;">
              <p style="margin:0 0 4px;color:#0f172a;font-size:14px;font-weight:bold;">1. 📞 We Call You</p>
              <p style="margin:0;color:#64748b;font-size:13px;">Our team will call you on ${booking.phone} within 2 hours to confirm your appointment time</p>
            </td></tr>
            <tr><td style="height:8px;"></td></tr>
            <tr><td style="padding:12px;background-color:#f8fafc;border-radius:8px;">
              <p style="margin:0 0 4px;color:#0f172a;font-size:14px;font-weight:bold;">2. 🧹 We Arrive</p>
              <p style="margin:0;color:#64748b;font-size:13px;">Our professional cleaners will arrive at your address at the scheduled time with all equipment</p>
            </td></tr>
            <tr><td style="height:8px;"></td></tr>
            <tr><td style="padding:12px;background-color:#f8fafc;border-radius:8px;">
              <p style="margin:0 0 4px;color:#0f172a;font-size:14px;font-weight:bold;">3. ✨ Enjoy Clean Space</p>
              <p style="margin:0;color:#64748b;font-size:13px;">Sit back and enjoy your freshly cleaned home. We guarantee your satisfaction</p>
            </td></tr>
          </table>
        </td></tr>

        <!-- Contact -->
        <tr><td style="background-color:#10b981;padding:28px 32px;text-align:center;">
          <p style="margin:0 0 16px;color:#ffffff;font-size:16px;font-weight:bold;">Need help? We are always available</p>
          <p style="margin:0 0 8px;color:#d1fae5;font-size:14px;">📞 Phone: <a href="tel:+254768362805" style="color:#ffffff;text-decoration:underline;">0768 362 805</a></p>
          <p style="margin:0 0 8px;color:#d1fae5;font-size:14px;">📧 Email: <a href="mailto:admin@sparkleclean.co.ke" style="color:#ffffff;text-decoration:underline;">admin@sparkleclean.co.ke</a></p>
          <p style="margin:0;color:#d1fae5;font-size:14px;">🌍 Website: sparkleclean.co.ke</p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background-color:#0f172a;border-radius:0 0 12px 12px;padding:24px 32px;text-align:center;">
          <p style="margin:0 0 8px;color:#94a3b8;font-size:12px;">© 2026 SparkleClean Kenya · Premium Cleaning Services · Nairobi</p>
          <p style="margin:0;color:#64748b;font-size:11px;">You received this email because you booked a cleaning service. No account required.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildAdminNotificationHtml(booking: IBooking): string {
  const formattedDate = formatBookingDate(booking.preferredDate);
  const amount = formatKES(booking.totalPrice);
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const now = new Date();
  const receivedDate = new Intl.DateTimeFormat('en-KE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(now);
  const receivedTime = new Intl.DateTimeFormat('en-KE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(now);

  const detailRow = (label: string, value: string, valueStyle = '') =>
    `<tr>
      <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:13px;width:40%;">${label}</td>
      <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:13px;text-align:right;${valueStyle}">${value}</td>
    </tr>`;

  const specialInstructions = booking.notes
    ? `<tr><td style="padding:16px 32px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fef3c7;border-radius:8px;padding:16px 20px;">
          <tr><td>
            <p style="margin:0 0 8px;color:#92400e;font-size:14px;font-weight:bold;">📝 Client Special Instructions:</p>
            <p style="margin:0;color:#78350f;font-size:13px;font-style:italic;">${booking.notes}</p>
          </td></tr>
        </table>
      </td></tr>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;box-shadow:0 4px 6px rgba(0,0,0,0.1);overflow:hidden;">

        <!-- Alert Banner -->
        <tr><td style="background-color:#f59e0b;padding:16px 24px;text-align:center;">
          <p style="margin:0;color:#ffffff;font-size:15px;font-weight:bold;">🔔 NEW BOOKING RECEIVED — ACTION REQUIRED</p>
        </td></tr>

        <!-- Header -->
        <tr><td style="padding:24px 32px 16px;">
          <h1 style="margin:0 0 8px;color:#0f172a;font-size:20px;font-weight:bold;">SparkleClean Kenya Admin Dashboard</h1>
          <p style="margin:0;color:#64748b;font-size:13px;">Received on ${receivedDate} at ${receivedTime}</p>
        </td></tr>

        <!-- Client Details -->
        <tr><td style="padding:0 32px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-left:4px solid #10b981;padding:16px 20px;background-color:#f8fafc;border-radius:0 8px 8px 0;">
            <tr><td>
              <h3 style="margin:0 0 12px;color:#0f172a;font-size:15px;font-weight:bold;">👤 Client Information</h3>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${detailRow('Full Name', booking.fullName)}
                ${detailRow('Phone', `<a href="tel:${booking.phone}" style="display:inline-block;background-color:#10b981;color:#ffffff;padding:6px 14px;border-radius:6px;text-decoration:none;font-size:13px;font-weight:bold;">📞 Call Client</a>`)}
                ${detailRow('Email', booking.email || 'Not provided')}
                ${detailRow('Address', booking.address, 'border-bottom:none;')}
              </table>
            </td></tr>
          </table>
        </td></tr>

        <!-- Booking Details -->
        <tr><td style="padding:0 32px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-left:4px solid #3b82f6;padding:16px 20px;background-color:#f8fafc;border-radius:0 8px 8px 0;">
            <tr><td>
              <h3 style="margin:0 0 12px;color:#0f172a;font-size:15px;font-weight:bold;">📋 Booking Information</h3>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${detailRow('Booking Ref', booking.bookingRef, 'font-weight:bold;font-size:16px;')}
                ${detailRow('Service', booking.serviceType)}
                ${detailRow('Property', `${booking.propertyType} · ${booking.propertySize}`)}
                ${detailRow('Preferred Date', formattedDate)}
                ${detailRow('Preferred Time', booking.preferredTime)}
                ${detailRow('Frequency', booking.frequency)}
                ${detailRow('Total Value', amount, 'font-weight:bold;color:#10b981;font-size:18px;border-bottom:none;')}
              </table>
            </td></tr>
          </table>
        </td></tr>

        <!-- Revenue Highlight -->
        <tr><td style="padding:0 32px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#059669,#10b981);border-radius:8px;padding:20px 24px;text-align:center;">
            <tr><td>
              <p style="margin:0 0 4px;color:#ffffff;font-size:20px;font-weight:bold;">💰 Booking Value: ${amount}</p>
              <p style="margin:0;color:#d1fae5;font-size:13px;">This booking is currently PENDING confirmation</p>
            </td></tr>
          </table>
        </td></tr>

        ${specialInstructions}

        <!-- Action Required -->
        <tr><td style="padding:16px 32px 24px;">
          <h3 style="margin:0 0 16px;color:#0f172a;font-size:15px;font-weight:bold;">⚡ Action Required</h3>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-right:8px;width:50%;">
                <a href="${frontendUrl}/bookings" style="display:block;background-color:#10b981;color:#ffffff;padding:14px;text-align:center;border-radius:8px;text-decoration:none;font-size:14px;font-weight:bold;">✅ Confirm Booking</a>
              </td>
              <td style="padding-left:8px;width:50%;">
                <a href="${frontendUrl}/bookings" style="display:block;background-color:#ef4444;color:#ffffff;padding:14px;text-align:center;border-radius:8px;text-decoration:none;font-size:14px;font-weight:bold;">❌ Cancel Booking</a>
              </td>
            </tr>
          </table>
          <p style="margin:16px 0 8px;color:#64748b;font-size:13px;text-align:center;">Log into the admin dashboard to manage this booking</p>
          <p style="margin:0;text-align:center;"><a href="${frontendUrl}/bookings" style="color:#10b981;font-size:13px;">${frontendUrl}/bookings</a></p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background-color:#f8fafc;padding:20px 32px;text-align:center;border-top:1px solid #e2e8f0;">
          <p style="margin:0 0 4px;color:#64748b;font-size:12px;">SparkleClean Kenya Admin Notification · Do not reply to this email</p>
          <p style="margin:0;color:#94a3b8;font-size:11px;">Manage bookings at <a href="${frontendUrl}/bookings" style="color:#10b981;">${frontendUrl}/bookings</a></p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendClientConfirmationEmail(booking: IBooking): Promise<void> {
  if (!booking.email) return;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'SparkleClean Kenya <noreply@sparkleclean.co.ke>',
      to: booking.email,
      subject: `✅ Booking Confirmed — ${booking.bookingRef} | SparkleClean Kenya`,
      html: buildClientConfirmationHtml(booking),
    });
  } catch (error) {
    console.error('Failed to send client confirmation email:', error);
  }
}

export async function sendAdminNotificationEmail(booking: IBooking): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.error('ADMIN_EMAIL not configured — skipping admin notification');
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'SparkleClean Kenya <noreply@sparkleclean.co.ke>',
      to: adminEmail,
      subject: `🔔 New Booking: ${booking.fullName} — ${booking.bookingRef}`,
      html: buildAdminNotificationHtml(booking),
    });
  } catch (error) {
    console.error('Failed to send admin notification email:', error);
  }
}
