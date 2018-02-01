import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { SelectItem } from 'primeng/primeng';
import { Subscription } from 'rxjs/Subscription';
import { MonDataService } from '../../services/mon-data.service';
import { MonProfileService } from '../../services/mon-profile.service';
import { UtilityService } from '../../services/utility.service';
import { MonConfigurationService } from '../../services/mon-configuration.service';
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

  constructor(public dataService: MonDataService, private router: Router, private profileService: MonProfileService, private utilityObj: UtilityService, private monConfServiceObj: MonConfigurationService) { }

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

}
