import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function formatDate(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat("en-KE", {
      weekday: "long", year: "numeric",
      month: "long", day: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

function formatKES(amount: number): string {
  return `KSh ${Number(amount).toLocaleString("en-KE")}`;
}

function getServiceName(booking: any): string {
  if (Array.isArray(booking.services)) {
    return booking.services.map((s: any) => s.name).join(", ");
  }
  return booking.serviceName || booking.serviceType || "Cleaning Service";
}

function getTotalAmount(booking: any): number {
  return booking.totalAmount ?? booking.totalPrice ?? 0;
}

function getFrequency(booking: any): string {
  return booking.bookingFrequency || booking.frequency || "One-time Booking";
}

// ── CLIENT EMAIL ──────────────────────────────────────────────
export async function sendClientConfirmationEmail(booking: any): Promise<void> {
  if (!booking.email) return;

  const firstName = booking.fullName?.split(" ")[0] || "Valued Client";
  const serviceName = getServiceName(booking);
  const totalAmount = getTotalAmount(booking);
  const bookingFrequency = getFrequency(booking);

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:Arial,Helvetica,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- HEADER -->
          <tr>
            <td style="background-color:#10b981;border-radius:16px 16px 0 0;padding:40px 40px 30px;text-align:center;">
              <div style="font-size:48px;margin-bottom:12px;">✨</div>
              <h1 style="color:#ffffff;font-size:28px;font-weight:800;margin:0 0 8px;">SparkleClean Kenya</h1>
              <p style="color:#d1fae5;font-size:14px;margin:0;">Premium Cleaning Services · Nairobi</p>
            </td>
          </tr>

          <!-- HERO -->
          <tr>
            <td style="background-color:#ffffff;padding:40px 40px 30px;text-align:center;">
              <div style="font-size:56px;margin-bottom:16px;">✅</div>
              <h2 style="color:#0f172a;font-size:26px;font-weight:700;margin:0 0 16px;">Your Booking is Confirmed!</h2>
              <p style="color:#475569;font-size:16px;line-height:1.6;margin:0;">
                Thank you <strong>${firstName}</strong>! We have received your booking and our team will 
                call you within <strong>2 hours</strong> to confirm your appointment.
              </p>
            </td>
          </tr>

          <!-- BOOKING DETAILS -->
          <tr>
            <td style="background-color:#ffffff;padding:0 40px 30px;">
              <div style="background-color:#f8fafc;border-radius:12px;border-left:4px solid #10b981;padding:24px;">
                <h3 style="color:#0f172a;font-size:16px;font-weight:700;margin:0 0 20px;">📋 Booking Details</h3>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:14px;width:45%;">Booking Reference</td>
                    <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#10b981;font-size:14px;font-weight:700;">${booking.bookingRef}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:14px;">Service</td>
                    <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:14px;font-weight:600;">${serviceName}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:14px;">Total Amount</td>
                    <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:15px;font-weight:700;">${formatKES(totalAmount)}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:14px;">Preferred Date</td>
                    <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:14px;">${formatDate(booking.preferredDate)}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:14px;">Preferred Time</td>
                    <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:14px;">${booking.preferredTime}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:14px;">Address</td>
                    <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:14px;">${booking.address}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;color:#64748b;font-size:14px;">Frequency</td>
                    <td style="padding:10px 0;color:#0f172a;font-size:14px;">${bookingFrequency}</td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- WHAT HAPPENS NEXT -->
          <tr>
            <td style="background-color:#ffffff;padding:0 40px 30px;">
              <h3 style="color:#0f172a;font-size:16px;font-weight:700;margin:0 0 16px;">What Happens Next?</h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align:top;padding:0 0 16px;">
                    <div style="background:#f0fdf4;border-radius:10px;padding:16px;display:flex;">
                      <span style="font-size:24px;margin-right:12px;">📞</span>
                      <div>
                        <p style="color:#0f172a;font-weight:700;font-size:14px;margin:0 0 4px;">1. We Call You</p>
                        <p style="color:#475569;font-size:13px;margin:0;">Our team calls <strong>${booking.phone}</strong> within 2 hours to confirm your appointment time</p>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="vertical-align:top;padding:0 0 16px;">
                    <div style="background:#f0fdf4;border-radius:10px;padding:16px;">
                      <span style="font-size:24px;margin-right:12px;">🧹</span>
                      <div>
                        <p style="color:#0f172a;font-weight:700;font-size:14px;margin:0 0 4px;">2. We Arrive</p>
                        <p style="color:#475569;font-size:13px;margin:0;">Our professional cleaners arrive at your address with all equipment at the scheduled time</p>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="vertical-align:top;padding:0 0 8px;">
                    <div style="background:#f0fdf4;border-radius:10px;padding:16px;">
                      <span style="font-size:24px;margin-right:12px;">✨</span>
                      <div>
                        <p style="color:#0f172a;font-weight:700;font-size:14px;margin:0 0 4px;">3. Enjoy Your Clean Space</p>
                        <p style="color:#475569;font-size:13px;margin:0;">Sit back and enjoy your freshly cleaned home. We guarantee your satisfaction</p>
                      </div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CONTACT -->
          <tr>
            <td style="background-color:#10b981;padding:30px 40px;text-align:center;">
              <p style="color:#ffffff;font-size:15px;font-weight:600;margin:0 0 16px;">Need help? We are always available</p>
              <table align="center" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:0 8px;">
                    <a href="tel:0768362805" style="color:#d1fae5;font-size:14px;text-decoration:none;">📞 0768 362 805</a>
                  </td>
                  <td style="padding:0 8px;color:#a7f3d0;">|</td>
                  <td style="padding:0 8px;">
                    <a href="mailto:admin@sparkleclean.co.ke" style="color:#d1fae5;font-size:14px;text-decoration:none;">📧 admin@sparkleclean.co.ke</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color:#0f172a;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;">
              <p style="color:#475569;font-size:12px;margin:0 0 6px;">© 2026 SparkleClean Kenya · Premium Cleaning Services · Nairobi</p>
              <p style="color:#334155;font-size:11px;margin:0;">You received this email because you booked a cleaning service. No account required.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: booking.email,
    subject: `✅ Booking Confirmed — ${booking.bookingRef} | SparkleClean Kenya`,
    html,
  });

  console.log(`✅ Client confirmation email sent to ${booking.email}`);
}

// ── ADMIN EMAIL ───────────────────────────────────────────────
export async function sendAdminNotificationEmail(booking: any): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  const serviceName = getServiceName(booking);
  const totalAmount = getTotalAmount(booking);
  const bookingFrequency = getFrequency(booking);
  const dashboardUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/bookings`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- ALERT BANNER -->
          <tr>
            <td style="background-color:#f59e0b;border-radius:16px 16px 0 0;padding:18px 40px;text-align:center;">
              <p style="color:#ffffff;font-size:15px;font-weight:800;margin:0;letter-spacing:0.5px;">
                🔔 NEW BOOKING RECEIVED — ACTION REQUIRED
              </p>
            </td>
          </tr>

          <!-- HEADER -->
          <tr>
            <td style="background-color:#ffffff;padding:24px 40px 20px;border-bottom:1px solid #e2e8f0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h2 style="color:#0f172a;font-size:20px;font-weight:700;margin:0 0 4px;">SparkleClean Kenya</h2>
                    <p style="color:#64748b;font-size:13px;margin:0;">Admin Dashboard Notification</p>
                  </td>
                  <td align="right">
                    <p style="color:#94a3b8;font-size:12px;margin:0;">Received</p>
                    <p style="color:#0f172a;font-size:13px;font-weight:600;margin:0;">${new Date().toLocaleString("en-KE")}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- REVENUE HIGHLIGHT -->
          <tr>
            <td style="background:linear-gradient(135deg,#10b981,#059669);padding:24px 40px;text-align:center;">
              <p style="color:#d1fae5;font-size:13px;margin:0 0 6px;text-transform:uppercase;letter-spacing:1px;">Booking Value</p>
              <p style="color:#ffffff;font-size:36px;font-weight:800;margin:0 0 6px;">${formatKES(totalAmount)}</p>
              <span style="background:rgba(255,255,255,0.2);color:#ffffff;font-size:12px;padding:4px 12px;border-radius:20px;">⏳ PENDING CONFIRMATION</span>
            </td>
          </tr>

          <!-- CLIENT DETAILS -->
          <tr>
            <td style="background-color:#ffffff;padding:30px 40px 20px;">
              <div style="border-left:4px solid #10b981;padding-left:16px;margin-bottom:20px;">
                <h3 style="color:#0f172a;font-size:15px;font-weight:700;margin:0 0 16px;">👤 Client Information</h3>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px;width:40%;">Full Name</td>
                    <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#0f172a;font-size:14px;font-weight:600;">${booking.fullName}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px;">Phone</td>
                    <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;">
                      <a href="tel:${booking.phone}" style="background:#10b981;color:#ffffff;font-size:13px;font-weight:600;padding:6px 14px;border-radius:6px;text-decoration:none;display:inline-block;">📞 Call ${booking.phone}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px;">Email</td>
                    <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#0f172a;font-size:13px;">${booking.email || "Not provided"}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;color:#64748b;font-size:13px;">Address</td>
                    <td style="padding:8px 0;color:#0f172a;font-size:13px;">${booking.address}</td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- BOOKING DETAILS -->
          <tr>
            <td style="background-color:#ffffff;padding:0 40px 30px;">
              <div style="border-left:4px solid #3b82f6;padding-left:16px;">
                <h3 style="color:#0f172a;font-size:15px;font-weight:700;margin:0 0 16px;">📋 Booking Information</h3>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px;width:40%;">Booking Ref</td>
                    <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#10b981;font-size:15px;font-weight:800;">${booking.bookingRef}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px;">Service</td>
                    <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#0f172a;font-size:13px;font-weight:600;">${serviceName}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px;">Preferred Date</td>
                    <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#0f172a;font-size:13px;">${formatDate(booking.preferredDate)}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px;">Preferred Time</td>
                    <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#0f172a;font-size:13px;">${booking.preferredTime}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;color:#64748b;font-size:13px;">Frequency</td>
                    <td style="padding:8px 0;color:#0f172a;font-size:13px;">${bookingFrequency}</td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- SPECIAL INSTRUCTIONS -->
          ${booking.notes ? `
          <tr>
            <td style="background-color:#ffffff;padding:0 40px 30px;">
              <div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:10px;padding:16px;">
                <p style="color:#92400e;font-size:13px;font-weight:700;margin:0 0 8px;">📝 Client Special Instructions</p>
                <p style="color:#78350f;font-size:13px;margin:0;font-style:italic;">"${booking.notes}"</p>
              </div>
            </td>
          </tr>` : ""}

          <!-- ACTION BUTTONS -->
          <tr>
            <td style="background-color:#ffffff;padding:0 40px 30px;">
              <div style="background:#f8fafc;border-radius:10px;padding:20px;text-align:center;">
                <p style="color:#0f172a;font-size:14px;font-weight:600;margin:0 0 16px;">⚡ Action Required — Manage this booking</p>
                <table align="center" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:0 8px;">
                      <a href="${dashboardUrl}" style="background:#10b981;color:#ffffff;font-size:14px;font-weight:700;padding:12px 28px;border-radius:8px;text-decoration:none;display:inline-block;">✅ Confirm Booking</a>
                    </td>
                    <td style="padding:0 8px;">
                      <a href="${dashboardUrl}" style="background:#ef4444;color:#ffffff;font-size:14px;font-weight:700;padding:12px 28px;border-radius:8px;text-decoration:none;display:inline-block;">❌ Cancel Booking</a>
                    </td>
                  </tr>
                </table>
                <p style="color:#94a3b8;font-size:12px;margin:16px 0 0;">
                  <a href="${dashboardUrl}" style="color:#10b981;text-decoration:none;">View in Admin Dashboard →</a>
                </p>
              </div>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color:#0f172a;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;">
              <p style="color:#475569;font-size:12px;margin:0 0 4px;">SparkleClean Kenya Admin Notification · Do not reply to this email</p>
              <p style="color:#334155;font-size:11px;margin:0;">
                Manage bookings at <a href="${dashboardUrl}" style="color:#10b981;text-decoration:none;">${dashboardUrl}</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: adminEmail,
    subject: `🔔 New Booking — ${booking.bookingRef} | ${booking.fullName} | ${formatKES(totalAmount)}`,
    html,
  });

  console.log(`✅ Admin notification email sent to ${adminEmail}`);
}
