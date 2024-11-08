import {NoteOutput} from "../../types/global";

export class ResponseClass {
    // Define properties
    public statusCode: number;
    public message: string;
    protected data: object | null;

    // Hold the single instance of the class
    private static instance: ResponseClass;

    // Private constructor to restrict instantiation
    private constructor(statusCode: number, message: string, data?: object) {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data || null; // if data is not provided, set it to null
    }

    // Method to get the single instance of the class
    public static getInstance(statusCode: number, message: string, data?: object): ResponseClass {
        if (!ResponseClass.instance) {
            ResponseClass.instance = new ResponseClass(statusCode, message, data);
        }
        return ResponseClass.instance;
    }

    // Method to get the response object
    public getResponse = () => ({
        statusCode: this.statusCode,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
            message: this.message,
            data: this.data
        })
    });
}

export class ErrorResponseClass extends ResponseClass {
    private readonly errorMessage: string;

    private static instance: ErrorResponseClass;

    private constructor(statusCode: number, errorMessage: string) {
        const responseInstance = ResponseClass.getInstance(statusCode, errorMessage);
        super(responseInstance.statusCode, responseInstance.message);
        this.errorMessage = errorMessage;
    }

    public static getInstance(statusCode: number, errorMessage: string): ErrorResponseClass {
        if (!ErrorResponseClass.instance) {
            ErrorResponseClass.instance = new ErrorResponseClass(statusCode, errorMessage);
        }
        return ErrorResponseClass.instance;
    }

    public getErrorResponse() {
        return {
            statusCode: this.statusCode,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify({
                error: this.errorMessage
            })
        };
    }
}
