import { IAppSettings } from "./models";


let defaults = {
    DYNAMO_TABLE: "dynamo-table"
};

function getVar(name: string): string {
    if (process.env[name]) {
        console.log('Getting value', name, 'from environmental variable with value', process.env[name], ' overriding ', defaults[name]);
        return process.env[name];
    }
    return defaults[name];
}

export const APP_SETTINGS: IAppSettings = {
    table: {
        addTimestamps: true,
        idFields: ['id'],
        name: getVar('DYNAMO_TABLE'),
    }
};
