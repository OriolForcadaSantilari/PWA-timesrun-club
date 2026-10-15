import Resend from "@auth/core/providers/resend";

function generateNumericCode(length: number): string {
  const digits = "0123456789";
  let code = "";
  while (code.length < length) {
    const byte = crypto.getRandomValues(new Uint8Array(1))[0];
    if (byte === undefined || byte >= 250) {
      continue;
    }
    code += digits[byte % 10];
  }
  return code;
}

export const ResendOTPPasswordReset = Resend({
  id: "resend-otp",
  apiKey: process.env.AUTH_RESEND_KEY,
  maxAge: 60 * 60,
  async generateVerificationToken() {
    return generateNumericCode(8);
  },
  async sendVerificationRequest({ identifier: email, provider, token }) {
    if (!provider.apiKey) {
      throw new Error("Password reset email is not configured");
    }
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${provider.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.AUTH_EMAIL ?? "TimesRun Club <onboarding@resend.dev>",
        to: [email],
        subject: "Reset your TimesRun Club password",
        text: `Your TimesRun Club reset code is ${token}. It expires in 1 hour.`,
      }),
    });
    if (!response.ok) {
      throw new Error("Could not send the reset email");
    }
  },
});
