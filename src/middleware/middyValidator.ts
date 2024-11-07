import middy from '@middy/core';
import httpEventNormalizer from '@middy/http-event-normalizer';
import httpErrorHandler from '@middy/http-error-handler';
import validator from '@middy/validator';
import createError from 'http-errors';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const middleWare = (): middy.MiddlewareObj<APIGatewayProxyEvent, APIGatewayProxyResult> => {
    const before: middy.MiddlewareFn<APIGatewayProxyEvent, APIGatewayProxyResult> = async (request): Promise<void> => {
        const validMethods = ["POST", "PUT", "GET", "DELETE"];
        const validContentType = "application/json";

        // Validate HTTP method
        if (!validMethods.includes(request.event.requestContext.httpMethod)) {
            throw new createError.MethodNotAllowed(`Unsupported method: ${request.event.requestContext.httpMethod}`);
        }

        // Validate Content-Type
        const contentType = request.event.headers['Content-Type'] || request.event.headers['content-type'];
        if (contentType !== validContentType) {
            throw new createError.UnsupportedMediaType(`Unsupported Content-Type: ${contentType}`);
        }

        console.log("Request method and content type are valid");
    };

    const after: middy.MiddlewareFn<APIGatewayProxyEvent, APIGatewayProxyResult> = async (requestContext): Promise<void> => {
        console.log("Request is processed");
        console.log(requestContext.response);
    };

    return {
        before,
        after
    };
};

const applyMiddlewares = (handler: any, eventSchema: object) => {
    return middy(handler)
        .use(httpEventNormalizer())
        .use(httpErrorHandler())
        .use(validator({ eventSchema }))
        .use(middleWare());
};

export const middyValidator = (handler: any, eventSchema: object = {}) => {
    return applyMiddlewares(handler, eventSchema);
};

export default middyValidator;