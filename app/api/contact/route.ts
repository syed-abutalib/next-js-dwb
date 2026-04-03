import { NextResponse } from "next/server";
import { emailTemplates, sendEmail } from "@/utils/EmailService";
import { contactFormSchema } from "@/utils/validation";
import { z } from "zod";
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input with Zod
    try {
      const validatedData = contactFormSchema.parse(body);

      const { name, email, company, subject, message, contactType } =
        validatedData;

      // Send email to admin
      const adminEmailTemplate = emailTemplates.contactFormAdmin({
        name,
        email,
        company,
        subject,
        message,
        contactType,
      });

      await sendEmail({
        to: process.env.ADMIN_EMAIL || "info@dailyworldblog.com",
        subject: adminEmailTemplate.subject,
        html: adminEmailTemplate.html,
        replyTo: adminEmailTemplate.email,
      });

      // Send auto-reply to user
      const userAutoReplyTemplate = emailTemplates.contactFormAutoReply({
        name,
        email,
        subject,
        message,
      });

      await sendEmail({
        to: email,
        subject: userAutoReplyTemplate.subject,
        html: userAutoReplyTemplate.html,
      });

      return NextResponse.json(
        {
          success: true,
          message:
            "Your message has been sent successfully! We will get back to you soon.",
        },
        { status: 200 },
      );
    } catch (zodError) {
      // Handle Zod validation errors
      if (zodError instanceof z.ZodError) {
        const errors = zodError.errors.map((err: any) => ({
          field: err.path.join("."),
          msg: err.message,
        }));

        return NextResponse.json(
          {
            success: false,
            message: "Validation failed",
            errors,
          },
          { status: 400 },
        );
      }

      throw zodError; // Re-throw if it's not a Zod error
    }
  } catch (error) {
    console.error("Contact API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to send message. Please try again later.",
      },
      { status: 500 },
    );
  }
}
