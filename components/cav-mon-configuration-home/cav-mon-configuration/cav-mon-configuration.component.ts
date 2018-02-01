import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { Store } from '@ngrx/store';
import { MonConfigurationService } from '../../../services/mon-configuration.service';
import { SelectItem } from 'primeng/primeng';
//import { ConfigUiUtility } from '../../../utility/monconfig-utility';
import { TableData } from '../../../containers/table-data';
import { ImmutableArray } from '../../../utility/immutable-array';
import * as _ from "lodash";
import { UtilityService } from '../../../services/utility.service';
import { MessageService } from '../../../services/message.service';
import { ROUTING_PATH } from '../../../constants/mon-url-constants';


@Component({
  selector: 'app-cav-mon-configuration',
  templateUrl: './cav-mon-configuration.component.html',
  styleUrls: ['./cav-mon-configuration.component.css']

})
export class CavMonConfigurationComponent implements OnInit {

  //Here profileId is used for fetching list of xml files
  @Input()
  dependent: number;

  subscription: Subscription;

  subscriptionConfiguredData: Subscription;

  tierField: string;

  monName: string;

  topoName: string;

  tierId: number;

  serverList: SelectItem[];

  tableData: TableData[] = [];

  selectedTableData: TableData;

  formData: TableData;

  isNewConfig: boolean = true;

  /***It holds array of object of component Type ****/
  compArgs: any[] = [];

  tierName: string;

  dropDownList: SelectItem[] = [];

  configuredUIData: any[];

  /***Used to store clone data *****/
  tempData: any[];

  /***It holds array of server name and corresponding app name  */
  tempArr = [];

  /**Counter for adding id to the tableData */
  count: number = 0;

  /** This boolean variable is used to hold the state of the accordion which holds the configured data table
   *  i.e. the second accordion of the configuration screen  
   *  When tableAccordionState is true then the configured Data table accordion is in collapsed state
   *  else it is in expanded state 
   */
  tableAccordionState: boolean = true;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private store: Store<any>,
    private monConfigurationService: MonConfigurationService,
    private utilityService: UtilityService,
    private messageService: MessageService
  ) { }



  ngOnInit() {

    console.log("Class CavMonConfiguration loaded")

    this.formData = new TableData();
    this.route.params.subscribe((params: Params) => {
      console.log("params--", params)
      this.topoName = params['topoName'];
      this.tierId = params['tierId'];
      this.monName = params['monName'];
      this.tierName = params['tierName'];
    });


    this.getTableData();

    /** getting data of monitor selected ****/
    let data = this.monConfigurationService.compArgData;
    if (data != null && Object.keys(data).length != 0)  /***handling case when data ="{}"****/ {
      this.compArgs = data;

      /******making a deep cloning of  data["data"] ,as initial object is used further for clearing the fields ******/
      this.tempData = JSON.parse(JSON.stringify(data))
    }

    /*** To get the server list in the dropdown ****/
    /*** Here unshift is used to insert element at 0 position of array ****/
    this.utilityService.getServerList(this.tierId)
      .subscribe(data => {
        if (data != null) {
          data.unshift("All Servers");
          this.serverList = UtilityService.createDropdown(data);
        }
      })

  }


  getTableData() {
    let data = this.monConfigurationService.saveMonitorData;
    if (data != null && data.hasOwnProperty(this.tierName)) {
      console.log("existing tier case")
      let tierObjList = data[this.tierName];
      if (tierObjList != null) {
        for (let i = 0; i < tierObjList.length; i++) {
          if (tierObjList[i].hasOwnProperty(this.monName)) {
            console.log("existing monitor case")
            this.tableData = tierObjList[i][this.monName];
            break;
          }
        }
      }
    }
    console.log("this.tableData--", this.tableData)
  }

  getDataForDependentComp(dependentCompArr, idValObj) {
    let val = '';
    let that = this;
    dependentCompArr.map(function (eachDepenComp) {
      let data = that.getDataForComp(eachDepenComp, idValObj);
      val = val + data["options"] + ",";
    })
    val = val.substring(0, val.length - 1);
    console.log("Method getDataForDependentComp caleed value =", val.trim())
    return val.trim();
  }

  /**
   * This method is called when user clicks on edit button
   */

  openEditMode() {
    this.formData = Object.assign({}, this.selectedTableData[0]);
    console.log(" this.formData--", this.formData)

    let that = this;
    this.constructData(this.compArgs);
    console.log("this.compArgs--after setting value---", this.compArgs)
    this.tableAccordionState = true;
    this.isNewConfig = false;
  }

  /**
   * 
   */
  constructData(arrData) {
    let that = this;
    arrData.map(function (eachComp) {
      that.setDataForComponents(eachComp)
    })
  }





  /**
   *  Function called setting value to the components for edit purpose 
   *  @param item 
   */

  setDataForComponents(eachComp) {
    let data = this.formData.compValWithId;

    if (data.hasOwnProperty(eachComp.id)) //skipping  those object whose value is not editable  by the  user (example -radioButton items)
    {
      eachComp["value"] = data[eachComp.id]
      console.log("eachComp component radio buttons--", eachComp)
    }


    if (eachComp["type"] == 'Table') {
      console.log("dispatching store for table data")
      //  this.store.dispatch({'type':"UPDATE_TABLECOMP_VALUE",'payload':{'id':eachComp["id"],'value':eachComp["value"]}})
    }

    if (eachComp.hasOwnProperty("dependentComp") && eachComp["dependentComp"] != null)
      this.constructData(eachComp["dependentComp"]);

    else if (eachComp.hasOwnProperty("items") && eachComp["items"] != null)
      this.constructData(eachComp["items"]);

  }

  getDataForRadioButtons(item, idValObj) {
    let val;
    if (item.hasOwnProperty("dependentComp") && item["dependentComp"] != null)
      val = this.getDataForDependentComp(item.dependentComp, idValObj)

    return val;
  }

  /**
   * This method updates the compArgsJson object for table type as it is custom component and
   * so ngmodel cant be used  and it is called from child comp.
   * @param data 
   */

  updateTableData(data) {
    console.log(" updateTableData method class  monitors.comp called", data)
    let obj = _.find(this.compArgs, function (each) {
      console.log("each---", each)
      return each.id == data.id
    })
    console.log("obj---", obj)
    obj["value"] = data.data;
  }

  /**
   * Getting data for table component and modifying it
   * @param tableData 
   */
  getDataForTable(tableData) {
    let val = '';
    tableData.map(function (each) {
      console.log("each---", each)
      for (let key of Object.keys(each)) {
        if (key != "id" && !key.startsWith("ui-"))
          val = val + key + ":" + each[key] + ",";
      }
    })
    val = val.substring(0, val.length - 1);
    console.log("Methd getDataForTable called value = ", val.trim())
    return val.trim();
  }

  /**
   * Generic function to get the value of each component
   * @param eachCompData 
   */

  getDataForComp(eachCompData, idValObj) {
    console.log("Method getDataForComp called for Component =  ", eachCompData)
    let data = '';
    let argumentData = '';
    idValObj[eachCompData['id']] = eachCompData.value;


    /*** for radio buttons ***/
    if (eachCompData.hasOwnProperty("items") && eachCompData["items"] != null) {

      /**  getting the object of selected radio   ****/
      let selectedObj = _.find(eachCompData["items"], function (each) { return each.value == eachCompData.value })

      //  data = data + " " + eachCompData.value;

      let val = this.getDataForRadioButtons(selectedObj, idValObj)

      console.log("val--", val)

      if (val == null || val == '') {
        /****** case when selected radiobutton doesnot have dependent component ****/
        data = data + " " + eachCompData.value;
        argumentData = argumentData + selectedObj.label + ":" + eachCompData.value;

      }
      else {
        data = data + " " + val;
        argumentData = argumentData + selectedObj.label + ":" + val;
      }

    }
    else if (eachCompData.hasOwnProperty("columnData") && eachCompData["columnData"] != null && eachCompData.value != null) {
      data = data + " " + eachCompData.arg;
      let val = this.getDataForTable(eachCompData.value);
      data = data + " " + val;
      argumentData = argumentData + eachCompData.label + ":" + val;
      console.log("data for tableData--", data)
    }
    else if (eachCompData.hasOwnProperty("dependentComp") && eachCompData["dependentComp"] != null) {
      let val = this.getDataForDependentComp(eachCompData.dependentComp, idValObj)

      if (eachCompData["arg"] != null && eachCompData["arg"] != "") {
        data = data + " " + eachCompData["arg"];
        argumentData = argumentData + " " + eachCompData["label"];
      }
      data = data + " " + val;
      argumentData = argumentData + ":" + val;
    }
    else if (eachCompData.type == 'Checkbox') {
      if (eachCompData.value) {
        data = data + " " + eachCompData.arg;
        argumentData = argumentData + eachCompData.label + ":" + eachCompData.value;
      }
    }
    else {
      if (eachCompData.arg != null && eachCompData.arg != "") {
        data = data + " " + eachCompData.arg + ":";
        argumentData = argumentData + eachCompData.label + ":"
      }
      data = data + " " + eachCompData.value
      argumentData = argumentData + eachCompData.value;
    }
    console.log("data---", data)
    console.log("argumentData---", argumentData)
    return { "options": data, "argumentData": argumentData };
  }


  /**
   * This method is called when add button is clicked 
   * This method forms the data for the table 
   */

  addData() {
    /**Check for whether following combination of server name and app name existing in the table or not */
    if (this.validateAppNameAndServerName()) {
      this.messageService.errorMessage("Following combination of server name and app name already exists.Please enter different server name or app name")
      return;
    }
    console.log("compArgs--", this.compArgs)
    console.log("selectedTableDta-", this.formData)
    let option = '';         // for column to display to the user
    let argumentData = '';  // for hidden column
    let arg = '';
    let valIdObj = {};

    /*** Check for whether selected monitor is configured for all tier or specific tier **/
    if (this.tierId == -1) {
      this.formData.serverName = 'All Server';
      this.messageService.successMessage(this.monName + " has been configured for All Servers");
    }
    else {
      if (this.formData.serverName == "" || this.formData.serverName == undefined) {
        this.messageService.errorMessage("Please select server ");
        return;
      }

      this.messageService.successMessage(this.monName + " has been configured for " + this.formData.serverName)
    }


    let that = this;
    this.compArgs.map(function (each) {
      let values = that.getDataForComp(each, valIdObj);
      option = option + " " + values["options"];
      argumentData = argumentData + "  " + values["argumentData"] + ",";
    })

    this.formData.arguments = argumentData
    this.formData.options = option
    this.formData.compValWithId = valIdObj;

    if (this.isNewConfig) {
      this.formData.id = this.count;
      //to insert new row in table ImmutableArray.push() is created as primeng 4.0.0 does not support above line 
      this.tableData = ImmutableArray.push(this.tableData, this.formData);
      this.count = this.count + 1;
    }
    else {
      //for edit functionality TO DO 
      this.tableData = ImmutableArray.replace(this.tableData, this.formData, this.getSelectedRowIndex(this.formData["id"]))
    }

    console.log("this.tableData after performing add/Edit Opertaion--", this.tableData)

    /** clearing the fields ****/
    this.compArgs = this.tempData;

    this.formData = new TableData(); // for clearing server name and app name fields in the form


    /**This is used to change the state of the Configured Data accordion from collapsed to expanded 
     * to show the configured data table when data is configured for the selected monitor.
     */
    this.tableAccordionState = false;
  }

  /** 
   * Method to validate following combination of server name and app name 
   * do exists in the configuration table or not
   */
  validateAppNameAndServerName(): boolean {
    let key = this.formData.serverName + this.formData.appName; // variable to hold server name and coresponding app name

    let keyFound = _.find(this.tempArr, function (each) { return each == key })

    /**** Check whether the key already exist or not in the tempArr 
     * if found then return else add the key to the tempArr
     */
    if (keyFound)
      return true;
    else {
      this.tempArr.push(key);
      return false
    }
  }


  /**This method returns selected row on the basis of Id */
  getSelectedRowIndex(data): number {
    let index = this.tableData.findIndex(each => each["id"] == data)
    return index;
  }



  ngOnDestroy() {
    console.log("moving out of compoent--", this.tableData)
    // var newData = _.map(this.tableData, function(o) { return _.omit(o, 'arguments'); });
    let obj = { "tier": this.tierName, "data": this.tableData, "monName": this.monName }
    this.store.dispatch({ type: "CONFIGURED_MONDATA", payload: obj });
    this.monConfigurationService.saveConfiguredData(obj);

    if (this.subscription)
      this.subscription.unsubscribe();

    if (this.subscriptionConfiguredData)
      this.subscriptionConfiguredData.unsubscribe();
  }


}
