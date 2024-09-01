const nodeMailer = require('nodemailer');

const MailSender = {
    sendMail: async (email, subject, body) => {
        return new Promise((resolve, reject) => {
            const transport = nodeMailer.createTransport({ 
                service: 'Gmail',
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.APP_PASSWORD
                }
             });
        
            const mailOptions = {
                from: process.env.EMAIL,
                to: email,
                subject: subject,
                text: body
            };
        
            transport.sendMail(mailOptions, (error, info) => {
                if(error){
                    reject(Error('Cannot send an email right now!'));
                }
        
               resolve('Password reset otp sent to your email.')
        
            });
        });
    },
};

module.exports = MailSender;