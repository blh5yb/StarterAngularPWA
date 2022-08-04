import * as functions from "firebase-functions";
//import { request } from "http";
import { host_url, stripe } from './config'
import { assert, assertUID, catchErrors } from "./helpers";

export const stripeCreateAccount = functions.https.onCall(
    async (data: any, context: any) => {
        console.log("Beginning 'stripeCreateAccount'")
        assertUID(context);
        const email = assert(data, 'email');
        const card_payment_requested = assert(data, 'card_payment_requested');
        const transfers_requested = assert(data, 'transfers_requested');

        const onboarding = await catchErrors(
            stripe.accounts.create({
                email: email,
                type: "express",
                country: "US",
                capabilities: {
                    card_payments: {
                        requested: card_payment_requested
                    },
                    transfers: {
                        requested: transfers_requested
                    }
                }
            })
        );
        const stripe_auth = {
            account_id: onboarding.id,
            email: email
        }
        console.log("Successfully created stripe account")
        return stripe_auth
    }
)

export const stripeCreateAccountLink = functions.https.onCall(
    async (data: any, context: any) => {
        console.log("Beginning 'stripeCreateAccountLink'")
        assertUID(context);

        const return_url = assert(data, 'return_url');
        const account_id = assert(data, 'account_id');
        return await catchErrors(
            stripe.accountLinks.create({
                account: account_id,
                refresh_url: host_url + return_url + "/?action=refresh",
                return_url:  host_url + return_url + "/?action=done",
                type: "account_onboarding"
            })
        )
    }
)

export const stripeCheckAccountStatus = functions.https.onCall(
    async (data: any, context: any) => {
        console.log("Beginning 'stripeCheckAccountStatus'")
        assertUID(context);
        
        const account_id = assert(data, 'account_id')
        const accountStatus = await catchErrors(stripe.accounts.retrieve(account_id));
        console.log("Successfully retrieved stripe account id")
        return accountStatus
    }
)

