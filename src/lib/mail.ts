import sgMail from "@sendgrid/mail";

const domain = process.env.NEXT_PUBLIC_APP_URL;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL as string;
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY as string;
sgMail.setApiKey(SENDGRID_API_KEY);

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${domain}/auth/new-verification?token=${token}`;

  const msg = {
    from: ADMIN_EMAIL,
    to: email,
    subject: "Confirm your email",
    html: `<p>Click <a href="${confirmLink}">here</a> to confirm email.</p>`,
  };

  await sgMail.send(msg);
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${domain}/auth/new-password?token=${token}`;

  const msg = {
    from: ADMIN_EMAIL,
    to: email,
    subject: "Reset your password",
    html: `<p>Click <a href="${resetLink}">here</a> to reset password.</p>`,
  };

  await sgMail.send(msg);
};

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  const msg = {
    from: ADMIN_EMAIL,
    to: email,
    subject: "2FA Code",
    html: `<p>Your 2FA code: ${token}</p>`,
  };

  await sgMail.send(msg);
};
