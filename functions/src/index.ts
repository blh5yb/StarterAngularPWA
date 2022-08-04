export { sendNotifications } from './notifications';
export { sendMail } from './email';
export { createErrorLog } from './log-error';
export { 
    stripeCreateAccount, 
    stripeCheckAccountStatus, 
    stripeCreateAccountLink 
} from './create-stripe';
export { stripeCreateCharge } from './make-payment';
export { arraySearch, deleteArrayItem, addArrayItem} from './public-arrays';

export {dailyTasks} from './cron-tasks';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
