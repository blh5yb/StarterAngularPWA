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
    created: Date;
    expiration_date?: Date;
    anonymous?: boolean;
    stripeCustomerId?: string;
    access_token?: string;
}