import { IAppSettings } from "./models";


let defaults = {
    DYNAMO_TABLE: "dynamo-table",
    EXAMPLE_SETTING: "bruh"
};

function getVar(name: string): string {
    let value = defaults[name];
    if (process.env[name]) {
        console.log('Getting value', name, 'from environmental variable with value', process.env[name], ' overriding ', defaults[name]);
        value = process.env[name];
    }
    return value;
}

export const APP_SETTINGS: IAppSettings = {
    table: {
        addTimestamps: true,
        idFields: ['id'],
        name: getVar('DYNAMO_TABLE'),
    },
    example: getVar('EXAMPLE_SETTING')
};
