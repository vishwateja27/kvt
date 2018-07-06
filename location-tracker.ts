import { HttpClient ,HttpClientModule} from '@angular/common/http';
import { HttpModule, Jsonp } from '@angular/http';
import { Injectable, NgZone } from '@angular/core';
import { BackgroundGeolocation } from '@ionic-native/background-geolocation';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import {File} from '@ionic-native/file';
import 'rxjs/add/operator/filter';
import { LoadingController } from 'ionic-angular';
 
import { MediaCapture, MediaFile, CaptureError, CaptureVideoOptions  } from '@ionic-native/media-capture';
import { Storage } from '@ionic/storage';
/*
  Generated class for the LocationTrackerProvider provider.
  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
const MEDIA_FILES_KEY = 'mediaFiles';
const LOCATION_FILES_KEY = 'locationFiles';
@Injectable()

export class LocationTrackerProvider {
  file_json: any;
  flag: any;
  //duration: any;
  fname: any;
  lastModifiedSec: number;
  lastModifiedMin: number;
  PhoneDir: any;
  mediaFiles=[];//mediaFiles[0] contains the current video file
  listOfFiles=[];
  watch: any;   
  lat: number = 0;
  lng: number = 0;
  LatLon_arr=[];

  constructor(public zone: NgZone,public storage:Storage,public mediaCapture:MediaCapture,public geolocation:Geolocation,public loadingController:LoadingController,public backgroundGeolocation:BackgroundGeolocation,public file:File) {
    console.log('Hello LocationTrackerProvider Provider');
  }


  startTracking() {  
     let config = {
      desiredAccuracy: 0,
      stationaryRadius: 0,
      distanceFilter: 0,
      debug: true,
      interval: 1000
    };
    
    this.watch=this.backgroundGeolocation.configure(config).subscribe((location) => {
      
      let d:Date=new Date();
      
        this.zone.run(()=>{
          this.lat=location.latitude;
          this.lng=location.longitude;
        })
    //     alert("lat:"+this.lat+"    "+"lon:"+this.lng+"\n"+"min:"+d.getMinutes()+"\nsec:"+d.getSeconds());
      
        this.LatLon_arr.push({lat:this.lat,lon:this.lng,min:d.getMinutes(),sec:d.getSeconds()});
    });
   
    // Turn ON the background-geolocation system.
    this.backgroundGeolocation.start();
   
   
    // Foreground Tracking
   
  let options = {
    frequency: 3000,
    enableHighAccuracy: true
  };
 
}
 
  stopTracking() {
     
    this.backgroundGeolocation.finish(); 
    //this.watch.unsubscribe();
 
  }

  empty()
  {
    this.LatLon_arr.length=0;
  }
  videoCapture():any {
    this.flag=0;
    let duration;
    let options: CaptureVideoOptions = {
      limit: 1
      //duration: 30
    }
    this.mediaCapture.captureVideo(options).then((res: MediaFile[]) => {
      let capturedFile = res[0];
      let d=new Date(capturedFile.lastModifiedDate);
      this.lastModifiedMin=d.getMinutes();
      this.lastModifiedSec=d.getSeconds();
      let fileName = capturedFile.name;
      //alert("video file name: "+fileName);
      this.fname=fileName;
//      alert(d.getMinutes()+"  "+d.getSeconds());
      // capturedFile.getFormatData((fdata)=>{this.duration=fdata.duration;this.writeFile(fileName);});
//       err=>{alert("error getting duration: "+JSON.stringify(err))});
      
      let dir = capturedFile['localURL'].split('/');
      dir.pop();
      let fromDirectory = dir.join('/');
      this.PhoneDir=fromDirectory;  
      var toDirectory = this.file.dataDirectory;
      this.file.copyFile(fromDirectory , fileName , toDirectory , fileName).then((res) => {
        this.storeMediaFiles([{name: fileName}]);
        capturedFile.getFormatData((fdata)=>{duration=fdata.duration;this.writeFile(fileName,duration);},
        err=>{alert("error getting duration: "+JSON.stringify(err))});
      this.file.removeFile(fromDirectory,fileName).then(()=>{
      }).catch((err)=>{
        alert("error removing file:"+JSON.stringify(err));
      })
      
      },err => {
        alert('error: '+ JSON.stringify(err));
        this.file.removeFile(fromDirectory,fileName).then(()=>{
        }).catch((err)=>{
          alert("error removing file:"+JSON.stringify(err));
        })
      });
      //return this.fname;
    },
    (err: CaptureError) => {
      //alert("error:"+JSON.stringify(err));
      this.file.removeFile(this.PhoneDir,this.fname).then(()=>{
      }).catch((err)=>{
        //alert("error removing file:"+JSON.stringify(err));
      })
      //return null;
    }
  );
  }

  storeMediaFiles(files)  {
    this.storage.get(MEDIA_FILES_KEY).then(res => {
      if (res) {
        let arr = JSON.parse(res);
        arr = arr.concat(files);
        this.storage.set(MEDIA_FILES_KEY, JSON.stringify(arr));
      } else {
        this.storage.set(MEDIA_FILES_KEY, JSON.stringify(files))
      }
      this.mediaFiles=files;
    }).catch(err=>{
      alert("Error Storing the file:"+JSON.stringify(err));
    });
  }

  writeFile(file_name,dur)
  {
    
    let dur_LatLon_arr=[];
    let end=(this.lastModifiedMin*60)+(this.lastModifiedSec);
    let start=end-dur;
    //alert("start:"+start+"\nend:"+end);
    //alert("contents of latlon arr"+JSON.stringify(this.LatLon_arr));
    //alert("latlon_arr length:"+this.LatLon_arr.length);
    for(let j=0;j<this.LatLon_arr.length;j++)
    {

      let a=this.LatLon_arr[j].min*60+this.LatLon_arr[j].sec;
      let elem = new Object();
      
      if(a>=start && a<=end)
      {
          elem=this.LatLon_arr[j];
          dur_LatLon_arr.push(elem);
      }
      if(a>end)
      {
        break;
      }
    }
    //alert("dur_LatLon_arr :"+JSON.stringify(dur_LatLon_arr) );
    this.file_json=file_name.split('.');
    this.file_json.pop();
    this.file_json=this.file_json+".json";
    //alert("latlon arr fioe name:"+this.file_json)
    //alert("dur_latLon_arr length: "+dur_LatLon_arr.length);
    this.file.writeFile(this.file.externalApplicationStorageDirectory,this.file_json,JSON.stringify(dur_LatLon_arr),{replace:true}).then(()=>{
      this.storeLocationFiles([{name: this.file_json}]);
  }).catch(err=>{
    alert("error writing the contents into the file: "+"      "+err);
  })
  this.empty();
  
  }
  
  storeLocationFiles(files)  {
    this.storage.get(LOCATION_FILES_KEY).then(res => {
      if (res) {
        let arr = JSON.parse(res);
        arr = arr.concat(files);
        this.storage.set(LOCATION_FILES_KEY, JSON.stringify(arr));
      } else {
        this.storage.set(LOCATION_FILES_KEY, JSON.stringify(files));
      }
      //this.listOfFiles=this.listOfFiles.concat(files);
      //alert("list of files in store function:"+this.listOfFiles);
      this.flag=1;
    }).catch(err=>{
      alert("Error Storing the file:"+JSON.stringify(err));
    });
  }

  getPathToMeidaFile(myFile):string
  {
    
    let path = this.file.dataDirectory + myFile;
    let url = path.replace(/^file:\/\//, '');
    return url;
  }

  getLocationFileName(file):string
  {
    let name=file.split('.');
    name.pop();
    name=name+".json";
    return name;
  }
  
}
