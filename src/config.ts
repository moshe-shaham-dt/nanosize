export interface IConfig {
    database?: {
        host: string;
        user: string;
        password: string;
        database: string;
    }
}



export let Config: IConfig = {};

export const setConfig = (config: IConfig) => {
    Config = config;
}