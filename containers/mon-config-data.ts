import { ServerConfigData } from './server-config-data';


export interface MonConfigData
{
    monName: String;
    isEnabled : boolean;
    serverDTOList: ServerConfigData[];
}