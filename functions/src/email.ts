import { mailCred, transporter } from './config'
import * as functions from "firebase-functions";
import { assert, catchErrors } from './helpers';
import { EmailModel } from './models/email.model';

export const internalSendMail = async(email: EmailModel) => {
    console.log(`Sending email to ${email.email_to}`)
    const mailOptions = {
        from: mailCred.user,
        to: email.email_to,
        subject: email.subject,
        text: email.body
    };

    let status = 'Email Sent'
    transporter.sendMail(mailOptions, function(error: any, info: any) {
        if (error) {
            status = "Email Error. Please try again later";
        }
    });
    console.log(status)
}

export const sendMail = functions.https.onCall(
    async (data: any) => {
        console.log('Beginning sendMail')
        const email: EmailModel = {
            subject: assert(data, 'subject'),
            body: assert(data, 'body'),
            email_to: assert(data, 'email_to')
        }
        return await catchErrors(internalSendMail(email))        
    }
)