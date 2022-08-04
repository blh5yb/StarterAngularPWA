import { firebase_project, messaging} from './config';
import * as functions from "firebase-functions";
import { assert, assertUID, catchErrors} from './helpers';
import { fetchUname } from './data-storage';

export const sendNotifications = functions.https.onCall(
    async (data: any, context: any) => {
        assertUID(context)
        const uname = assert(data, 'uname')
        const notification = assert(data, 'notification')
        const user = await fetchUname(uname)
        const payload = {
            notification: {
                title: notification.title,
                body: notification.body,
                icon: firebase_project.logo_url,
                image: firebase_project.logo_url,
                sound: 'default'
            }
        }
        return await catchErrors(messaging.sendToDevice([user.fire_push], payload));
    }
)