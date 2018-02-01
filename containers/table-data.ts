 export class TableData
 {
   id:number;
   serverName:string;
   arguments:string; //field used for showing data to UI
   options:string;   //field used for sroring argumnet to be send to server
   appName:string;  
   compValWithId : Object;//field used to storing data mapped with its id,used for edit purpose
 }