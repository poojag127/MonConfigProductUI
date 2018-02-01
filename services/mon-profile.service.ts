
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Subject } from 'rxjs/Subject';
import * as URL from '../constants/mon-url-constants';
import { RestApiService } from './rest-api.service';
import { MonDataService } from './mon-data.service';

@Injectable()
export class MonProfileService {

    //mjsonname: any[];
    constructor(private _restApi: RestApiService, private monDataService: MonDataService) {
 
    }

    getTopologyList() {

        return this._restApi.getDataByGetReq(this.monDataService.getserviceURL() + URL.GET_TOPO_LIST);
    }

    /** Method to send request to the server to get profile list for the selected topology */
    getProfileList(topoName) {
        let url = this.monDataService.getserviceURL() + URL.GET_PROFILE_LIST + `${topoName}`;
        console.log("url", url)
        return this._restApi.getDataByGetReq(url);

    }

    /** Method to send request to the server to delete profiles 
     * from the table for the selected topology. 
     */
    deleteProfileData(topoName, mjsonname) {
        let url = this.monDataService.getserviceURL() + URL.DEL_PROFILE + "?topoName=" + `${topoName}` + "&userName=netstorm";

        /**** This is used to get the list of profiles selected for delete operation */
        for (let i = 0; i < mjsonname.length; i++) {
            url = url + "&jsonNameList=" + `${mjsonname[i]}`;
        }
        console.log("url for deleting profile list --  ", url)
        return this._restApi.getDataByGetReq(url);
    }

}
