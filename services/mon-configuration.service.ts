import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Subject } from 'rxjs/Subject';
import { Message } from 'primeng/primeng';
import * as URL from '../constants/mon-url-constants';
import { RestApiService } from './rest-api.service';
import { MonDataService } from './mon-data.service';
import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import * as _ from "lodash";
import { Store } from '@ngrx/store';

@Injectable()
export class MonConfigurationService {

    private topoName: string = "mosaic_stress_as1";

    private profileName: string = "test";
    private profileDesc: string;

    monTierTreeTableData: any[] = null;

    tierHeaderList: any[] = null;

    /***hold components array of components ***/
    compArgData: any[];

    saveMonitorData: any;

    constructor(private http: Http, private _restApi: RestApiService,
                private monDataService: MonDataService,
                private store: Store<any>,

                
                ) {

    }

    handleError;
    getDataFromServerTierMonitors(): Promise<any> {
        let url = this.monDataService.getserviceURL() + URL.GET_TIER_MONITORS_DATA;

        let params: URLSearchParams = new URLSearchParams();
        params.set('topoName', this.topoName);
        params.set('jsonName', this.profileName);
        params.set('userName', this.monDataService.getUserName());
        params.set('testRun', this.monDataService.getTestRunNum().toString());

        return this.http.get(url, { search: params }).map(res => res.json())
            .toPromise()
            .then(res => {
                this.tierHeaderList = res["tierList"];
                console.log("Getting from server tierList--", this.tierHeaderList)
                this.monTierTreeTableData = res["treeTableData"]["data"];

            }).
            catch(this.handleError);
    }



    /**** This method sends request to server for getting  *****/
    getChildNodes(categoryName, id) {
        console.log("getChildNodes method called--", categoryName + categoryName + ", id = " + id);
        console.log("----------\n befor adding children---", this.monTierTreeTableData[id]);
        let url = this.monDataService.getserviceURL() + URL.GET_CHILD_NODES;


        let params: URLSearchParams = new URLSearchParams();
        params.set('topoName', this.topoName);
        params.set('jsonName', this.profileName);
        params.set('categoryName', categoryName);
        params.set('categoryId', id);
        params.set('userName', this.monDataService.getUserName());
        params.set('testRun', this.monDataService.getTestRunNum().toString());


        return this.http.get(url, { search: params }).map(res => res.json())
            .toPromise()
            .then(res => {
                let nodeData = _.find(this.monTierTreeTableData, function (each) { return each['data']['monitor'] == categoryName });
                nodeData['children'] = res;
                console.log("----------\n after adding children---", this.monTierTreeTableData[id]);
                console.log("--zzzzz--------\n");
                console.log("getChildNodes method called--", res)
            }).
            catch(this.handleError);
    }


    getComponentData(drivenJsonName, id): Promise<any> {

        console.log("id--", id)
        let url = this.monDataService.getserviceURL() + URL.GET_COMPONENTS + "?menuDrivenJsonName=" + drivenJsonName + "&userName=netstorm";
        console.log("url----", url)

        let params: URLSearchParams = new URLSearchParams();
        params.set('topoName', this.topoName);
        params.set('jsonName', this.profileName);
        params.set('userName', this.monDataService.getUserName());
        params.set('testRun', this.monDataService.getTestRunNum().toString());

        return this.http.get(url, { search: params }).map(res => res.json())
            .toPromise()
            .then(res => {

                this.addComponentsData(id, res)
                let obj = {};
                obj['data'] = res,
                obj['id'] = id;
                this.setCompArgsData(obj);
                this.store.dispatch({type:"ADD_COMPONENTS_DATA",payload: obj });
            }).
            catch(this.handleError);
    }

    /**
     * Add compArgsJson to selected node if treetable data
     * @param id  = id of selected row
     * @param data = compArgsJson data i.e components Data  of selected monitor
     */

    addComponentsData(id, data) {
        let arrId = id.split(".");

        /***getting parent  Node if selected node is any of the child node ****/
        let rowData = _.find(this.monTierTreeTableData, function (each) { return each['data']['id'] == arrId[0] });
        console.log("rowData--", rowData)

        if (arrId.length > 1) {
            let childNodes = rowData["children"];
            console.log("childNodes--", childNodes)
            rowData = _.find(childNodes, function (each) { return each['data']['id'] == id });
        }
        rowData["compArgsJson"] = data;
        console.log("monTierTreeTableData--", this.monTierTreeTableData)
    }

    saveConfiguredData(saveMonitorData) {
        this.saveMonitorData = saveMonitorData;
    }
    
    setCompArgsData(data) {
        console.log("data--", data)
        this.compArgData = data["data"];
    }


    getTierHeaderList(): any[] {
        return this.tierHeaderList;
    }

    getMonTierTableData(): any[] {
        return this.monTierTreeTableData;
    }

    getTopoName(): string {
        return this.topoName;
    }

    setTopoName(topoName: string) {
        this.topoName = topoName;
    }

    getProfileName(): string {
        return this.profileName;
        //return "cavisson";
    }

    setProfileName(profileName: string) {
        this.profileName = profileName;
    }

    getProfileDesc(): string {
        return this.profileDesc;
        //return "cavisson";
    }

    setProfileDesc(profileDesc: string) {
        this.profileDesc = profileDesc;
    }

    clearData() {

        this.topoName = null;

        this.profileName = null;
        this.profileDesc = "NA";

        this.monTierTreeTableData = null;

        this.tierHeaderList = null;
    }

}