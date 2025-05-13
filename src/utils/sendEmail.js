// const { Request, Response } = require("express");
const { Resend } = require("resend");
const resend = new Resend("re_MrwSAZDs_JK8SbUnaUeiz12TWhFrqNqJM");

const sendEmail = async ({ to, subject, html }) => {
  console.log(to);
  console.log(subject);
  console.log(html);
  try {
    const { data, error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Email send error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Unexpected error while sending email:", err);
    return { success: false, error: err };
  }
};

module.exports = sendEmail;
