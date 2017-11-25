import { Context, APIGatewayEvent } from "aws-lambda";
import { LambdaError } from "./errors";


export function wrapFunction(func: (event: APIGatewayEvent) => Promise<any>): (event: APIGatewayEvent, context: Context, callback: AWSLambda.Callback) => void {
    return (event: APIGatewayEvent, context: Context, callback: AWSLambda.Callback) => {
        try {
            func(event).then((data) => {
                callback(null, {
                    statusCode: 200,
                    body: JSON.stringify(data)
                });
            }).catch((reason: any) => {
                if (reason instanceof LambdaError) {
                    console.log('Lambda error', reason);
                    callback(null, reason.toLambda());
                } else {
                    // An unexpected error occurred, log the error, dont send to user.
                    console.log('Unexpected error', reason);
                    callback(null, {
                        statusCode: 500,
                        body: JSON.stringify({
                            message: 'An internal error occurred',
                            type: 'internalError'
                        })
                    });
                }
            });
        } catch (e) {
            if (e instanceof LambdaError) {
                console.log('Uncaught Lambda error', e);
                callback(null, e.toLambda());
            } else {
                console.error('Uncaught exception', e, e.stack);
                callback(null, {
                    statusCode: 500,
                    body: JSON.stringify({
                        message: 'An internal error occurred',
                        type: 'internalError'
                    })
                });
            }
        }
    }
}

export default function wrapModule(mod) {
    let out = {};
    for (let key in mod) {
        out[key] = wrapFunction(mod[key]);
    }
    return out;
}