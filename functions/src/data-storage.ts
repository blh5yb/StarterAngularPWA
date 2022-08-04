import { db} from './config';
import { handleDates} from './helpers';
import { sendError } from './log-error';
import { MyError } from './models/error.model';
import { UserProfile } from './models/user-profile.model';

// Users
export const fetchUname = async(uname: any) => {
    console.log("fetchUser\n User name: " + uname)
    return await db.collection('users')
        .where('uname', '==', uname)
        .get()
        .then((snapShot: any )=> {
            let profile: UserProfile = snapShot.docs[0].data();
            profile.created = handleDates(profile.created)
            if (profile.expiration_date){
                profile.expiration_date = handleDates(profile.expiration_date)
            }
            return profile;
    })
}

export const fetchUser = async(uid: any) => {
    console.log("fetchUser\n User: " + uid)
    return await db.collection('users').doc(uid)
        .get()
        .then((snapShot: any )=> {
            let profile: UserProfile = snapShot.data();
            profile.created = handleDates(profile.created)
            if (profile.expiration_date){
                profile.expiration_date = handleDates(profile.expiration_date)
            }
            return profile;
    })
}

export const updateUser = async(profile: UserProfile) => {
    console.log("updateUser\n User: " + profile.uid);
    const mydoc = 'users/' + profile.uid;
    return await db.doc(mydoc).set(profile, {merge: true})
}

export const deleteUser = async(uid: any) => {
    return await db.collection('users').doc(uid).delete()
}

export const fetchUsers = async() => {

}

// error logs
export const logError = async(doc: string, error: any) => {
    console.log("log error");
    const mydoc = `error_logs/${doc}_${error.date_time}`;
    return await db.doc(mydoc).set(error)
}

// arrays


export const fetchArrayItems = async() => {
    return await db.collection('public').doc('arrays').get().then((doc: any) => {
      return doc.data();
    }).catch((error) => {
        const my_error: MyError = {
            error_code: error,
            error_type: 'fetch array items',
            message: "An Unknown Error Occurred",
            user: 'unknown',
            date_time: new Date()
        }
       return sendError(my_error)
    })
}

export const updateArray = async(arrays: any) => {
    const mydoc = 'public/arrays';
    return await db.doc(mydoc).set(arrays, {merge: true})
        .catch((error) => {
        const my_error: MyError = {
            error_code: error,
            error_type: 'add array items',
            message: "An Unknown Error Occurred",
            user: 'unknown',
            date_time: new Date()
        }
        return sendError(my_error)
    })
}

export const checkArrayItem = async(field: string, item: string) =>  {
    return db.collection('public').doc('arrays')
        .get()
        .then((res: any) => {
            if ((res[field]).includes(item.toLowerCase())){
              return true
            }
            return false
        }).catch((error) => {
            const my_error: MyError = {
                error_code: error,
                error_type: `check ${field} array`,
                message: "An Unknown Error Occurred",
                user: 'unknown',
                date_time: new Date()
            }
            return sendError(my_error)

        })
}
