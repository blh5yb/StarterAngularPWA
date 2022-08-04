import * as functions from "firebase-functions";

export const dailyTasks = functions.pubsub.schedule('0 7 * * *').onRun(async() => {
    console.log('Run Every morning at 7am PST?')
    const my_date = new Date();
    const today = new Date();
    const dayOfMonth = today.getDate();
    const dayOfWeek = today.getDay();
    const lastMonth = today.getMonth() - 1
    const dateOfLastMonth = new Date(my_date.setMonth(lastMonth)) // adjust for Jan

    if (dayOfMonth === 1) {
        console.log('do some monthly task\nlast month: ' + dateOfLastMonth)
    }
    if (dayOfWeek === 1) {
        console.log('do some weekly task')
    }
})