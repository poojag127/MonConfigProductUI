import { AppConfigData } from './app-config-data';

export interface ServerConfigData
{
     serverName: String;
	 excludeServer: String;
	 instanceName: String;
	 isEnabled : boolean;
     appDTOList: AppConfigData[];
}