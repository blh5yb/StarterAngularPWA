import * as functions from "firebase-functions";
import { assert, assertUID, catchErrors } from './helpers';
import { stripe} from './config';
//import { payPartner} from './referral';
import { fetchUser, updateUser} from "./data-storage";
import { UserProfile } from "./models/user-profile.model";

export const getOrCreateCustomer = async(user: UserProfile) => {

    if (user.stripeCustomerId) {
        return await stripe.customers.retrieve(user.stripeCustomerId)
    } else {
        const customer = await stripe.customers.create({
            metadata: {firebaseUname: user.uname}
        })
        user.stripeCustomerId = customer.id
        await updateUser(user);
        return customer
    }
}

export const refund = async(CHARGE_ID: string) => {
    const refund = await stripe.refunds.create({
        charge: CHARGE_ID,
        reverse_transfer: true,
    });

    return refund.id
}

export const createCharge = async (payAmount: number, stripeToken: string, user: UserProfile) => {
    let customer: any = await getOrCreateCustomer(user);

    console.log('create source')
    //const existingSocd furce = customer.sources.data.filter((s: { id: string; }) => s.id === stripeToken)
    const source = await stripe.customers.createSource(customer.id, {source: stripeToken})
    const payIntent = await stripe.paymentIntents.create({
        customer: customer.id,
        amount: Math.round(payAmount * 100),
        currency: "usd",
        payment_method: source.id,
        //transfer_data: {
        //    amount: Math.round(dj_net * 100), // round dj_net (total - MyTunez fee)
        //    destination: dj.private.stripe.account_id
        //},
        receipt_email: user.email
    })
    return payIntent
    
}

export const payOuts = async (payIntent: any, amount: number, account_id: string) => {
    payIntent.transfer_data = {
        amount: amount,
        destination: account_id
    }
    
    return await payIntent
}

///////////////////// Callable Function /////////////////////
export const stripeCreateCharge = functions.https.onCall(
    async (data: any, context: any) => {
        console.log("Beginning stripeCreateCharge");
        assertUID(context);
        const finalAmount = assert(data, 'amount')
        const stripeToken = assert(data, 'stripeToken')

        let user: UserProfile = await fetchUser(context.auth.uid)
        let payIntent: any = catchErrors( createCharge(finalAmount, stripeToken, user))
        return await catchErrors(stripe.paymentIntents.confirm(payIntent.id))
    }
)

export const stripeCheckBalance = functions.https.onCall(
    async (data: any, context: any) => {
        console.log("Check Stripe Balance");
        const uid = assertUID(context);
        const account_id = assert(data, 'account_id')
        console.log(uid);
        const balance: any = await stripe.balance.retrieve({
            stripeAccount: account_id
        })
        console.log(balance)
        const pending = Number(balance.pending[0].amount) / 100
        const available = Number(balance.available[0].amount) / 100
        return {
            pending: `$${pending} ${balance.pending[0].currency}`,
            available: `$${available} ${balance.available[0].currency}`
        }
    }
)