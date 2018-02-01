import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { SelectItem } from 'primeng/primeng';
import { Subscription } from 'rxjs/Subscription';
import { MonDataService } from '../../services/mon-data.service';
import { MonProfileService } from '../../services/mon-profile.service';
import { UtilityService } from '../../services/utility.service';
import { MonConfigurationService } from '../../services/mon-configuration.service';
import { MessageService } from '../../services/message.service';
import * as URL from '../../constants/mon-url-constants';
import { ProfileData } from '../../containers/profile-data';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cav-mon-profiles',
  templateUrl: './cav-mon-profiles.component.html',
  styleUrls: ['./cav-mon-profiles.component.css']
})

export class CavMonProfilesComponent implements OnInit {

  //show topology list in the pull down
  topologyList: SelectItem[];
  selectedTopology: String = "";

  //to show data in table
  profileTableData: ProfileData[] = [];

  //those profile which are selected
  selectedProfile: ProfileData[];

  /** Flag to show and hide search filter in the datatable */
  isShowFilter: boolean;

  addProfileDialog: boolean = false;
  addProfile: ProfileData;

  /**This is used to emit "isShowFilter" value */
  @Output()
  showFilterEvent = new EventEmitter<boolean>();

  constructor(public dataService: MonDataService, private router: Router, private profileService: MonProfileService, private utilityObj: UtilityService, private monConfServiceObj: MonConfigurationService, private messageService: MessageService) { }

  ngOnInit() {
    //this method set the parameters come from the product UI
    this.setMonDefaultDataInDataService();

    this.profileService.getTopologyList()
      .subscribe(data => {
        this.topologyList = UtilityService.createDropdown(data);
      });

    this.isShowFilter = false; //setting default value of show filter to false
  }


  setMonDefaultDataInDataService() {

  }

  /** Method to load profile data in the table for the selected topology */
  loadProfileData(topoName) {
    this.profileService.getProfileList(this.selectedTopology)
      .subscribe(data => {
        this.profileTableData = data;
      })
  }

  openAddDialog() {
    this.addProfileDialog = true;
    this.addProfile = new ProfileData();
  }
  saveEditProfile(topoName, addProfile) {

    this.addProfileDialog = false;
    this.monConfServiceObj.clearData();
    this.monConfServiceObj.setProfileName(addProfile.profileName);
    this.monConfServiceObj.setProfileDesc(addProfile.desc);
    this.monConfServiceObj.setTopoName(topoName);
    this.router.navigate([URL.PROF_CONFIGURATION]);

    //to insert new row in table ImmutableArray.push() is created as primeng 4.0.0 does not support above line 
    //this.jsonsTableData=ImmutableArray.push(this.jsonsTableData, this.mJsonData);
  }

  editProfile(jsonName, topoName) {
    console.log(URL.PROF_CONFIGURATION + "," + jsonName + "," + topoName)

    this.router.navigate([URL.PROF_CONFIGURATION]);
  }


  /**Method for the show filter in the datatable */
  showFilter() {
    this.isShowFilter = !this.isShowFilter;
    this.showFilterEvent.emit(this.isShowFilter);
    console.log("CavMonRightPaneComponent", "showFilter", "isShowFilter = ", this.isShowFilter);
  }

  /**
  * Method to delete profile(s) 
  * This method is called when user clicks on the delete button in the profile list table
  */
  deleteProfile() {
    /**** Check whether user has selected rows to delete or not */
    if (!this.selectedProfile || this.selectedProfile.length < 1) {
      this.messageService.errorMessage("Select profile(s) to delete");
      return;
    }

    let selectedProfileData = this.selectedProfile; // used to hold selected row data of the table
    let arrProf = []; // this array holds profile name of the selected row in the profile list table
    for (let index in selectedProfileData) {
      arrProf.push(selectedProfileData[index].profileName);
    }
    console.log("arrProf contains following profileName for delete --", arrProf)

    /**** here request is send to server to delete profiles  */
    this.profileService.deleteProfileData(this.selectedTopology, arrProf)
      .subscribe(data => {
        this.deleteProfileData(); // this is used to delete the profiles from the table from ui side
        this.messageService.infoMessage("Deleted Successfully");
      })

  }

  /**
   * This method is used to delete profile data from ui
   */
  deleteProfileData() {
    let arrId = []; // array to hold id of each selected profile to perform delete operation
    this.selectedProfile.map(function (each) {
      arrId.push(each.id)
    })

    this.profileTableData = this.profileTableData.filter(function (val) {
      return arrId.indexOf(val.id) == -1;  //value to be deleted should return false
    })

    /**** clearing object used for storing data */
    this.selectedProfile = [];
  }

  /**
   * This method is used to download/import the json file 
   * for the selected monitor profile.
   */
  importProfile(profile) {
    /***download file directly in server  */
    // let url = window.location.protocol + "//"+ window.location.hostname +":"+window.location.port; 

    /***to download file in local */
    let url = this.dataService.getserviceURL();
    console.log("url-----", url)

    this.profileService.downloadProfile(this.selectedTopology, profile.profileName).subscribe(data => {
      if (data) {
        let path = url + "netstorm/temp/";
        path = path + profile.profileName + ".json";
        this.downloadURI(path, profile.profileName + ".json");
      }
    })
  }


  /** This method is used to make the download link to download the selected json file */
  downloadURI(uri, name) {
    var link = document.createElement("a");
    console.log("link--", link)

    link.download = name;
    link.href = uri;

    // Because firefox not executing the .click()
    // Hence, We need to create mouse event initialization.
    var clickEvent = document.createEvent("MouseEvent");
    clickEvent.initEvent("click", true, true);

    link.dispatchEvent(clickEvent);
  }


}


