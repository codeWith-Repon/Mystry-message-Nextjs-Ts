import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/VerificationEmails";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode: string
): Promise<ApiResponse> {
    try {
        await resend.emails.send({
            from: 'Acme <onboarding@resend.dev>',
            to: email,
            subject: 'Mystry message | Verification code',
            react: VerificationEmail({ username, otp: verifyCode }),
        });

        return { success: true, message: "Verification email send successfully" }

    } catch (emailError) {
        console.error("Error Sending Verification Email", emailError)
        return { success: false, message: "Faileed to send verfication email" }
    }
}
