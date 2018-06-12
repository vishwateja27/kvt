import { Component,ViewChild,ElementRef, NgZone } from '@angular/core';
import { NavController,Platform, LoadingController } from 'ionic-angular';
import { NewPlacePage } from '../new-place/new-place';
import { Geolocation,Geoposition,PositionError } from '@ionic-native/geolocation';
import { MediaCapture, MediaFile, CaptureError, CaptureVideoOptions  } from '@ionic-native/media-capture';
import { Camera } from '@ionic-native/camera';
import {File} from '@ionic-native/file';
import leaflet from 'leaflet';
import { BackgroundGeolocation,BackgroundGeolocationConfig } from '@ionic-native/background-geolocation';
import { LocationTrackerProvider } from '../../providers/location-tracker/location-tracker';
import {Media,MediaObject} from '@ionic-native/media';
import { Storage } from '@ionic/storage';
import { Jsonp } from '@angular/http';
import { MapPage } from '../map/map';

const MEDIA_FILES_KEY = 'mediaFiles';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  fname: any;
  watch: any;duration:any;
  @ViewChild('map') mapContainer: ElementRef;
  map:any;lastModifiedMin:any;
  lat:any;lastModifiedSec:any;
  lon:any;file_json:any;
  dirPath:any;
  flag:any=0;
  LatLon_arr=[];
  mediaFiles = [];
  
  key=["lat","lon","min","sec"];
  @ViewChild('myvideo') myVideo: any;

  config: BackgroundGeolocationConfig = {
    desiredAccuracy: 0,
    stationaryRadius: 20,
    distanceFilter: 30,
    debug: true, //  enable this hear sounds for background-geolocation life-cycle.
    stopOnTerminate: false, // enable this to clear background location settings when the app terminates
};
 
  constructor(public navCtrl: NavController,public loadingController:LoadingController,public storage: Storage,public locationTracker: LocationTrackerProvider,public platform:Platform,public file:File,public mediaCapture: MediaCapture,public media: Media,public backgroundGeolocation:BackgroundGeolocation,public ngZone:NgZone) 
  {
    
  }
  
  ionViewDidLoad() {
    this.storage.get(MEDIA_FILES_KEY).then(res => {
      this.mediaFiles = JSON.parse(res) || [];
    })
    this.file.createFile(this.file.externalApplicationStorageDirectory,'perm.txt',true);
    if(this.locationTracker.lat==0)
    {
      let loader=this.loadingController.create({content:"fetching location"});
    loader.present().then(()=>{  
    this.locationTracker.startTracking();
      this.fname=setInterval(()=>{
        this.flag=this.locationTracker.lat;
        if(this.flag!=0)
        {
          loader.dismiss();
          clearInterval(this.fname);
        }
        
      },1000);
    });
      
    }
    
    // this.file.createFile(this.file.externalApplicationStorageDirectory,'fname.json',true).then(fcon=>{
    //   alert("created a fiile");
    // }).catch(err=>{
    //   alert("error creating s file"+JSON.stringify(err));
    // })
     
  }

  captureVideo() {
    this.flag=0;
    let options: CaptureVideoOptions = {
      limit: 1,
//      duration: 30
    }
    
     this.mediaCapture.captureVideo(options).then((res: MediaFile[]) => {
      let capturedFile = res[0];
     
      let d=new Date(capturedFile.lastModifiedDate);
      this.lastModifiedMin=d.getMinutes();
      this.lastModifiedSec=d.getSeconds();
      alert(d.getMinutes()+"  "+d.getSeconds());
     
      let fileName = capturedFile.name;
      this.fname=fileName;
      let dir = capturedFile['localURL'].split('/');
      dir.pop();
      let fromDirectory = dir.join('/');      
      var toDirectory = this.file.dataDirectory;
      this.file.copyFile(fromDirectory , fileName , toDirectory , fileName).then((res) => {
      this.storeMediaFiles([{name: fileName, size: capturedFile.size}]);
      this.file.removeFile(fromDirectory,fileName).then(()=>{
      }).catch((err)=>{
        alert("error removing file:"+JSON.stringify(err));
      })
      capturedFile.getFormatData((fdata)=>{this.duration=fdata.duration;this.writeFile();},
      err=>{alert("error getting duration: "+err)});
      },err => {
        alert('error: '+ JSON.stringify(err));
        this.watch.unsubscribe();
      });
      
      
    },
    (err: CaptureError) => {alert(JSON.stringify(this.LatLon_arr));console.error(err);alert("error:"+JSON.stringify(err));this.watch.unsubscribe();});   
          
  }
  play(myFile) {
    
      let path = this.file.dataDirectory + myFile.name;
      let url = path.replace(/^file:\/\//, '');
      let video = this.myVideo.nativeElement;
      video.src = url;
      video.play();
  }
  storeMediaFiles(files) {
    this.storage.get(MEDIA_FILES_KEY).then(res => {
      if (res) {
        let arr = JSON.parse(res);
        arr = arr.concat(files);
        this.storage.set(MEDIA_FILES_KEY, JSON.stringify(arr));
      } else {
        this.storage.set(MEDIA_FILES_KEY, JSON.stringify(files))
      }
      this.mediaFiles = this.mediaFiles.concat(files);
    })
  }

  stop(){
    this.locationTracker.stopTracking();
    alert(JSON.stringify(this.locationTracker.LatLon_arr));
  }

  writeFile()
  {
    let dur_LatLon_arr=[];
//    alert("duration down hrere: "+this.duration);
    let end=(this.lastModifiedMin*60)+(this.lastModifiedSec);
    let start=end-this.duration;
    // let start_Min=Math.floor(start/60);
    // let start_Sec=Math.ceil(((start/60)-Math.floor(start/60))*60);
    // alert(start_Min+" end min:"+start_Sec);
//    alert(JSON.stringify(this.locationTracker.LatLon_arr));
//    alert("latlon_arr length:"+this.locationTracker.LatLon_arr.length);
    for(let j=0;j<this.locationTracker.LatLon_arr.length;j++)
    {

      let a=this.locationTracker.LatLon_arr[j].min*60+this.locationTracker.LatLon_arr[j].sec;
      let elem = new Object();
      
      if(a>=start && a<=end)
      {

          elem=this.locationTracker.LatLon_arr[j];
          dur_LatLon_arr.push(elem);
      }
      if(a>end)
      {

        break;
      }
    }
    alert("dur_LatLon_arr length:"+dur_LatLon_arr.length);
    alert("du_arr cntnts:"+dur_LatLon_arr[0].lat+"lon: "+dur_LatLon_arr[0].lon+"min: "+dur_LatLon_arr[0].min);
    this.file_json=this.fname.split('.');
    this.file_json.pop();
    this.file_json=this.file_json+".json";
//    alert("dur_latLon_arr length: "+this.dur_LatLon_arr.length);
  this.file.writeFile(this.file.externalApplicationStorageDirectory,this.file_json,JSON.stringify(dur_LatLon_arr),{replace:true}).then(()=>{
//    alert("file written succesfully:");
    
  }).catch(err=>{
    alert("error writing the contents into the file");
  })
  this.locationTracker.empty();
  
  }

  mappage(myFile)
  {
    this.navCtrl.push(MapPage,{
      name:myFile.name
    });
  }
  

 }                                                                    






//  this.file.readAsText(this.file.externalApplicationStorageDirectory,this.file_json).then(fdata=>{
//   alert("contents of the file are:"+fdata);
// }).catch(err=>{alert("error reading the contents of te files")});