
//Initialize Firebase Admin
import * as functions from 'firebase-functions';

//Initialize Firebase Admin
import * as admin from 'firebase-admin';
admin.initializeApp();

//Initialize cloud firestore database
export const db = admin.firestore();
const settings = { timestampsInSnapshots: true};
db.settings(settings);
export const messaging = admin.messaging();

import * as nodemailer from "nodemailer";

export const stripeSecret = functions.config().stripe.secret;
import Stripe from 'stripe';
export const stripe = new Stripe(stripeSecret, {
    apiVersion: '2020-08-27'
});

export const firebase_project = functions.config().af_auth;

//const nodemailer = require('nodemailer');
// need new
//export const fitbitBasic = functions.config().fitbit.oauth_basic
//export const fitbit_token_url = functions.config().fitbit.oauth_url
export const host_url = functions.config().app_url.host
export const vapid = functions.config().vapid


export const mailCred = functions.config().email;
export const transporter = nodemailer.createTransport({
    host: mailCred.host,
    port: mailCred.port,
    secure: mailCred.secure,
    service: mailCred.service,
    auth: {
    user: mailCred.user,
    pass: mailCred.pass,
    }
})

export const my_environment = '- TEST - '

export const errorTimeLimit = 604800000 // 7 days

export const arrayMax = 20;

//export const fitbitStepsUrl = 'https://api.fitbit.com/1/user/-/activities/tracker/steps/date/'
