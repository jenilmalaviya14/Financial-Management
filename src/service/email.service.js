const nodemailer = require("nodemailer");

let transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
    },
});

const sendEmail = async (to, data, subject) => {
    try {
        const info = await transport.sendMail({
            from: process.env.EMAIL_FROM,
            to,
            subject,
            html: data,
        });
        return info;
    } catch (error) {
        console.error("Error sending email: ", error);
        return false;
    }
};

module.exports = {
    sendEmail,
};