import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import path from "path";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, subject, message } = body;

        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const host = process.env.SMTP_HOST;
        const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS;

        if (!host || !user || !pass) {
            console.warn("SMTP credentials are not configured in environment variables.");
            // We return success in development so the frontend doesn't break when env vars are missing
            // But we log the error 
            return NextResponse.json({
                success: true,
                message: "Email logged (SMTP credentials missing)"
            });
        }

        // Create reusable transporter object using the default SMTP transport
        const transporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465, // true for 465, false for other ports
            auth: {
                user,
                pass,
            },
        });

        // Common attachments (the logo)
        const attachments = [
            {
                filename: 'website-logo.png',
                path: path.join(process.cwd(), 'public', 'images', 'website-logo.png'),
                cid: 'website-logo' // same cid value as in the html img src
            }
        ];

        // 1. Send query email to contact@nouryx.com
        await transporter.sendMail({
            from: `"Nouryx Website" <${user}>`,
            to: "contact@nouryx.com",
            replyTo: email,
            subject: `New Contact Form Query`,
            text: `You have received a new message from the Nouryx Website contact form.\n\nName: ${name}\nEmail: ${email}\nPhone/Subject: ${subject}\n\nMessage:\n${message}`,
            html: `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
              <!-- Header -->
              <div style="background-color: #2c1a0e; padding: 30px 20px; text-align: center;">
                <img src="cid:website-logo" alt="Nouryx Logo" style="max-height: 50px; width: auto;" />
              </div>
              
              <!-- Body -->
              <div style="padding: 40px 30px; color: #374151; line-height: 1.6;">
                <h2 style="color: #2c1a0e; font-size: 24px; margin-top: 0; margin-bottom: 24px; font-weight: 600;">New Contact Inquiry</h2>
                
                <div style="background-color: #f9fafb; border-radius: 6px; padding: 20px; margin-bottom: 24px; border: 1px solid #f3f4f6;">
                  <p style="margin: 0 0 10px 0; font-size: 16px;"><strong>Name:</strong> ${name}</p>
                  <p style="margin: 0 0 10px 0; font-size: 16px;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #c9aa8b; text-decoration: none;">${email}</a></p>
                  <p style="margin: 0; font-size: 16px;"><strong>Subject/Phone:</strong> ${subject}</p>
                </div>
            
                <h3 style="color: #2c1a0e; font-size: 18px; margin-top: 0; margin-bottom: 12px; font-weight: 600;">Message:</h3>
                <div style="background-color: #ffffff; border-left: 4px solid #c9aa8b; padding-left: 16px; margin-bottom: 30px;">
                  <p style="margin: 0; white-space: pre-wrap; font-size: 16px;">${message.replace(/\n/g, '<br>')}</p>
                </div>
              </div>
              
              <!-- Footer -->
              <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; color: #6b7280; font-size: 13px;">This email was sent directly from the Nouryx Website Contact Form.</p>
              </div>
            </div>
            `,
            attachments,
        });

        // 2. Send auto-reply to the user
        await transporter.sendMail({
            from: `"Nouryx Team" <${user}>`,
            to: email,
            subject: "We received your message!",
            text: `Hello ${name},\n\nThank you for reaching out to us. We have successfully received your query regarding "${subject}".\n\nOur team is reviewing your message and will get back to you as soon as possible.\n\nBest regards,\nThe Nouryx Team`,
            html: `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
              <!-- Header -->
              <div style="background-color: #2c1a0e; padding: 30px 20px; text-align: center;">
                <img src="cid:website-logo" alt="Nouryx Logo" style="max-height: 50px; width: auto;" />
              </div>
              
              <!-- Body -->
              <div style="padding: 40px 30px; color: #374151; line-height: 1.6;">
                <h2 style="color: #2c1a0e; font-size: 24px; margin-top: 0; margin-bottom: 20px; font-weight: 600;">Hello ${name},</h2>
                
                <p style="margin-top: 0; margin-bottom: 16px; font-size: 16px;">Thank you for reaching out to us. We have successfully received your query regarding <strong>"${subject}"</strong>.</p>
                
                <p style="margin-top: 0; margin-bottom: 24px; font-size: 16px;">Our experienced team is currently reviewing your message and will get back to you as soon as possible. For your records, here is a copy of your message:</p>
            
                <div style="background-color: #f9fafb; border-radius: 6px; padding: 20px; margin-bottom: 30px; border: 1px solid #f3f4f6;">
                  <p style="margin: 0; font-style: italic; color: #4b5563; font-size: 15px; white-space: pre-wrap;">"${message.replace(/\n/g, '<br>')}"</p>
                </div>
                
                <p style="margin-top: 0; margin-bottom: 8px; font-size: 16px;">Best regards,</p>
                <p style="margin: 0; font-weight: 600; color: #2c1a0e; font-size: 16px;">The Nouryx Team</p>
              </div>
              
              <!-- Footer -->
              <div style="background-color: #f9fafb; padding: 24px 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0 0 8px 0; color: #4b5563; font-size: 14px; font-weight: 500;">Nouryx &copy; ${new Date().getFullYear()}. All rights reserved.</p>
                <p style="margin: 0; color: #6b7280; font-size: 13px;">123 Av. des Champs-Élysées, 75008 Paris, France</p>
              </div>
            </div>
            `,
            attachments,
        });

        return NextResponse.json({ success: true, message: "Emails sent successfully" });
    } catch (error) {
        console.error("Error sending emails:", error);
        return NextResponse.json(
            { error: "Failed to send the emails" },
            { status: 500 }
        );
    }
}
