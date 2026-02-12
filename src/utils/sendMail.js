import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendEmail = async ({ from = process.env.SMTP_FROM, to, subject, html }) => {
  const info = await transporter.sendMail({
    from,
    to,
    subject,
    html,
  });

  return info; 
};