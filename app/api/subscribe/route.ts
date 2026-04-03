import { NextResponse } from "next/server";
import { sendEmail, emailTemplates } from "@/utils/EmailService";
import { subscriberSchema } from "@/utils/validation";
import { z } from "zod";

// Simple in-memory store (replace with database in production)
let subscribers = new Set();

export async function POST(request) {
  try {
    const body = await request.json();

    // Validate input with Zod
    try {
      const validatedData = subscriberSchema.parse(body);
      const { email } = validatedData;

      // Check if already subscribed
      if (subscribers.has(email)) {
        return NextResponse.json(
          {
            success: false,
            message: "This email is already subscribed to our newsletter.",
          },
          { status: 400 },
        );
      }

      // Add to subscribers list
      subscribers.add(email);

      // Send welcome email
      const welcomeTemplate = emailTemplates.subscriberAutoReply(email);

      await sendEmail({
        to: email,
        subject: welcomeTemplate.subject,
        html: welcomeTemplate.html,
      });

      // Notify admin about new subscriber
      await sendEmail({
        to: process.env.ADMIN_EMAIL || "syedabutalib.dev@gmail.com",
        subject: "New Newsletter Subscriber",
        html: `
          <h2>New Newsletter Subscriber</h2>
          <p>A new user has subscribed to the newsletter:</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Total Subscribers:</strong> ${subscribers.size}</p>
        `,
      });

      return NextResponse.json(
        {
          success: true,
          message: "Successfully subscribed to our newsletter!",
        },
        { status: 200 },
      );
    } catch (zodError) {
      if (zodError instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            message: zodError.errors[0].message,
          },
          { status: 400 },
        );
      }

      throw zodError;
    }
  } catch (error) {
    console.error("Subscribe API error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error.message || "Failed to subscribe. Please try again later.",
      },
      { status: 500 },
    );
  }
}

// Get subscriber count and list (admin only)
export async function GET(request) {
  try {
    // Add authentication check here in production
    const authToken = request.headers.get("authorization");

    // Simple check - in production, use proper authentication
    if (!authToken || authToken !== `Bearer ${process.env.ADMIN_SECRET}`) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        count: subscribers.size,
        subscribers: Array.from(subscribers),
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to get subscribers" },
      { status: 500 },
    );
  }
}

// Unsubscribe endpoint
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 },
      );
    }

    // Validate email format
    try {
      subscriberSchema.parse({ email });
    } catch (zodError) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 400 },
      );
    }

    if (subscribers.has(email)) {
      subscribers.delete(email);

      // Send goodbye email (optional)
      await sendEmail({
        to: email,
        subject: "Sorry to see you go",
        html: `
          <h2>You've been unsubscribed</h2>
          <p>You have been successfully unsubscribed from the Daily World Blog newsletter.</p>
          <p>If you change your mind, you can always subscribe again.</p>
          <p>Best regards,<br>The Daily World Blog Team</p>
        `,
      });

      return NextResponse.json(
        { success: true, message: "Successfully unsubscribed" },
        { status: 200 },
      );
    } else {
      return NextResponse.json(
        { success: false, message: "Email not found in subscribers list" },
        { status: 404 },
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to unsubscribe" },
      { status: 500 },
    );
  }
}
