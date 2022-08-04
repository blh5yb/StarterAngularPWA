export interface UserProfile {
    uid: string;
    uname: string;
    email: string;
    emailVerified: boolean;
    online: boolean;
    complete: boolean;
    accepted_terms: boolean;
    accepted_policy: boolean;
    stripe?: any;
    fire_push: string;
    created: any;
    expiration_date?: any;
    anonymous?: boolean;
    stripeCustomerId?: string;
    access_token?: string;
}