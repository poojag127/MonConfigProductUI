import { Component, OnInit } from '@angular/core';
import { TreeNode } from 'primeng/primeng';
import { MonConfigurationService } from '../../services/mon-configuration.service';
import { ActivatedRoute, Params, Router } from '@angular/router';

import * as URL from '../../constants/mon-url-constants';
import { Store } from '@ngrx/store';


@Component({
  selector: 'app-cav-mon-configuration-home',
  templateUrl: './cav-mon-configuration-home.component.html',
  styleUrls: ['./cav-mon-configuration-home.component.css']
})

export class CavMonConfigurationHomeComponent implements OnInit {

  profileName: String;
  topoName: String;
  cols: any[] = [];
  compData: TreeNode[];

  constructor(private monConfServiceObj: MonConfigurationService,
              private router:Router,
              private route: ActivatedRoute,
              private store: Store<any>
   ) { }

  ngOnInit() 
  {

    this.profileName = this.monConfServiceObj.getProfileName();
    this.topoName = this.monConfServiceObj.getTopoName();

    if (this.monConfServiceObj.getTierHeaderList() == null) {
      this.monConfServiceObj.getDataFromServerTierMonitors().then(data => {
        this.createHeadersList(this.monConfServiceObj.getTierHeaderList());
        this.compData = this.monConfServiceObj.getMonTierTableData();
      });
    }
    else {
      this.createHeadersList(this.monConfServiceObj.getTierHeaderList());
      this.compData = this.monConfServiceObj.getMonTierTableData();
    }
  }

  /***Function used to create header list array for treetable component *****/
  createHeadersList(tierList) {
    if (tierList != null) {
      console.log("tierList--", tierList)
      let that = this;
      tierList.forEach((function (val) {
        that.cols.push({ field: val.id, header: val.name })
      }));
    }
  }

  loadNode(event) {
    console.log("event---", event)
    if (event.node) {
      //in a real application, make a call to a remote url to load children of the current node and add the new nodes as children
      if (event.node.children.length == 0)
        this.monConfServiceObj.getChildNodes(event.node.data.monitor,event.node.data.id);
    }
  }

    /*** for advance settings ***/
  advanceSettings(monData,tierId,tierName)
  {
    console.log("monData--",monData)
    let currNode = monData["data"];
    console.log("currNode-",currNode)
    let monName = currNode["monitor"];
    console.log("monData--",monData)
    console.log("monName",monName)
    if(monName.startsWith('Weblogic'))
    {
      //this.router.navigate(['../../../weblogicSettings',this.profileName,this.topoName,monName,tierId,tierName],{ relativeTo: this.route });
    }
    else
    {
      console.log("monData--",monName)
      let compData = '';
      let obj ={};
      if(!currNode.hasOwnProperty("compArgJson") )
      {
       this.monConfServiceObj.getComponentData(currNode['drivenJsonName'],currNode['id']).then(data => {
         this.router.navigate([URL.MON_CONFIGURATION,this.profileName,this.topoName,monName,tierId,tierName],{ relativeTo: this.route });
       })   
      }
      else 
      {
       compData = currNode['compArgJson'];
       obj['data']=compData,
       obj['id']= currNode["id"] 
      //  this.store.dispatch({type:"ADD_COMPONENTS_DATA",payload: obj });
       this.monConfServiceObj.setCompArgsData(obj);
       this.store.dispatch({type:"ADD_COMPONENTS_DATA",payload: obj });
       this.router.navigate([URL.MON_CONFIGURATION,this.profileName,this.topoName,monName,tierId,tierName],{ relativeTo: this.route });
      }
    }
  }
}