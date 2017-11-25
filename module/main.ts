import { APIGatewayEvent } from "aws-lambda";
import { LambdaError } from "../utils/errors";
import { IModuleService } from "./services";
import * as Models from "./models";
import container from "./container";

const service = container.get<IModuleService>(Models.MODULE_TYPES.IModuleService);

export function post(request: APIGatewayEvent): Promise<any> {
    return service.post(JSON.parse(request.body));
}

export function get(request: Models.IGetRequest): Promise<any> {
    return service.get(request.pathParameters.id);
}

// export function list(request: APIGatewayEvent): Promise<any> {
//     return service.list();
// }

export function del(request: Models.IDeleteRequest): Promise<any> {
    return service.del(request.pathParameters.id);
}

export function put(request: APIGatewayEvent): Promise<any> {
    return service.put(JSON.parse(request.body));
}