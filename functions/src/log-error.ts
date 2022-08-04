import * as functions from "firebase-functions";
import { mailCred, my_environment } from "./config";
import { logError } from "./data-storage";
import { internalSendMail } from "./email";
import { MyError } from "./models/error.model";
import { assert, catchErrors } from './helpers';
import { EmailModel } from "./models/email.model";

export const sendError = async(error: MyError) => {
    await logError(error.error_type.replace(' ', '_'), error)
    const email_body = `User: ${error.user}\nError Type: ${error.error_type}\nMessage: ${error.message}
                        \nError: ${error.error_code}`;
    const email_subject = 'MyTunez ' + my_environment + 'Error'
    const email: EmailModel = {
        subject: email_subject, 
        body: email_body, 
        email_to: mailCred.user
    }
    return await internalSendMail(email)
}

export const createErrorLog = functions.https.onCall(
    async (data: any) => {
        console.log('Beginning Error logging')
        const error: MyError = assert(data, 'error')

        return await catchErrors(sendError(error));
    }
)