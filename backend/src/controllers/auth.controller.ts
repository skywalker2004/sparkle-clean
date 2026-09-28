import crypto from "crypto";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.model";
import { AuthRequest } from "../types";
import { sendPasswordResetEmail } from "../utils/email.service";

const generateToken = (id: string, role: string): string => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user.id, user.role);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error.message, error.stack);
    res.status(500).json({ message: "Server error during login" });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.json({ message: "Logged out successfully" });
};

const GENERIC_RESET_RESPONSE = {
  message: "If an account with that email exists, reset instructions have been sent.",
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email?.toLowerCase().trim() });

    // Always return the SAME generic response whether or not the email exists,
    // to prevent user-enumeration attacks.
    if (!user) {
      return res.json(GENERIC_RESET_RESPONSE);
    }

    // Generate a raw random token, but persist ONLY its SHA-256 hash.
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 min expiry
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL?.trim();

    // If the production frontend URL is missing we cannot build a valid reset
    // link. Log the error and return the generic response (identical in every
    // case) WITHOUT sending an email that contains a broken link.
    if (!frontendUrl) {
      console.error(
        "FRONTEND_URL is not set — password-reset email was skipped (no valid reset link could be built)"
      );
      return res.json(GENERIC_RESET_RESPONSE);
    }

    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    // Send the reset email and WAIT for the outcome BEFORE responding — a
    // serverless function may be frozen/moved on right after the response is
    // sent, which would drop a fire-and-forget email. Failures are logged and
    // must never change the generic anti-enumeration response.
    const emailResults = await Promise.allSettled([
      sendPasswordResetEmail(user.email, user.name, resetUrl),
    ]);
    emailResults.forEach((r, i) => {
      if (r.status === "rejected") console.error(`Reset notification ${i} failed:`, r.reason);
    });

    // WhatsApp convenience link — this is NOT an automated WhatsApp send.
    // WhatsApp's Business API requires a paid Meta Business account for
    // automated message delivery. This link simply pre-fills a WhatsApp
    // message the admin can tap to send to themselves, or forward, as a
    // convenience alongside the automated email.
    const whatsappMessage = encodeURIComponent(
      `SparkleClean Kenya password reset requested. Reset link (expires in 30 min): ${resetUrl}`
    );
    const whatsappSelfLink = `https://wa.me/254768362805?text=${whatsappMessage}`;

    return res.json({
      ...GENERIC_RESET_RESPONSE,
      whatsappLink: whatsappSelfLink, // frontend may offer an optional "also send to WhatsApp" button
    });
  } catch (error: any) {
    console.error("Forgot password error:", error.message);
    // Still return the generic success response to avoid leaking system state.
    return res.json(GENERIC_RESET_RESPONSE);
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Reset token is required" });
    }
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    // Hash the presented token and compare against the stored hash only.
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Reset link is invalid or has expired" });
    }

    // The model's pre-save hook hashes this password.
    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.json({ message: "Password reset successfully. You can now log in with your new password." });
  } catch (error: any) {
    console.error("Reset password error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};
