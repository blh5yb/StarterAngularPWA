import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const assert = (data: any, key: string) => {
    if(!data[key]){
        console.error("parameter, " + key + ", not provided")
        throw new functions.https.HttpsError('invalid-argument', `function called without ${key} data`);
    } else {
        console.log("Input parameter, " + key + " successfully asserted")
        return data[key];
    }
}

export const assertUID = (context: any) => {
    if(!context.auth) {
        console.log("Permission denied. Context: " + context)
        throw new functions.https.HttpsError('permission-denied', `function called without auth`);
    } else {
        return
    }
}

export const catchErrors = async (promise: Promise<any>) => {
    try {
        return await promise;
    } catch(err: any) {
        console.error("An unknown error occurred: " + err)
        throw new functions.https.HttpsError('unknown', err)
    }
}


export const handleDates = (date: any) => {
    let my_date = date.toDate()
    let fixed_date = admin.firestore.Timestamp.fromDate(new Date(my_date))
    return fixed_date
}


export const getMonthId = async (today: Date) => {
    const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
    ];
    const month_id: string = monthNames[today.getMonth()] + '_' + today.getFullYear();
    console.log("Returning  monthly statement doc id, " + month_id);
    return month_id
}