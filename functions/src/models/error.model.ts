export interface MyError {
    date_time: Date;
    message: string;
    user?: string;
    error_code: any;
    error_type: string;
}