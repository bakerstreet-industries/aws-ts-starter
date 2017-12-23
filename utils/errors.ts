
export class LambdaError {
    constructor(public statusCode: number, public message: string, public type: string) { }

    static internalError(err: { message: string }): LambdaError {
        return new LambdaError(500, err.message, 'internalError');
    }

    static notFound(obj: string): LambdaError {
        return new LambdaError(404, `The object ${obj} is not found`, 'notFound');
    }

    static putDataFailed(err: { message: string }): LambdaError {
        return new LambdaError(500, err.message, 'putFailed');
    }

    static deleteDataFailed(err: { message: string }): LambdaError {
        return new LambdaError(500, err.message, 'deleteFailed');
    }

    toLambda() {
        return {
            statusCode: this.statusCode,
            body: JSON.stringify({
                message: this.message,
                type: this.type
            })
        }
    }
}