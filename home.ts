import { Component, ViewChild, NgZone} from '@angular/core';
import { NavController,Platform, LoadingController } from 'ionic-angular';
import { MediaCapture, MediaFile, CaptureError, CaptureVideoOptions } from '@ionic-native/media-capture';
import { Storage } from '@ionic/storage';
import { Media, MediaObject } from '@ionic-native/media';
import { File } from '@ionic-native/file';
import { MapPage } from '../map/map';
import {SecondPage} from '../second/second';
import { geoJSON } from 'leaflet';
import {Geolocation,Geoposition} from '@ionic-native/geolocation';
import { BackgroundGeolocation } from '@ionic-native/background-geolocation';
 
const MEDIA_FILES_KEY = 'mediaFiles';
 
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  watch: any;
  w:any;
  mediaFiles = [];
  @ViewChild('myvideo') myVideo: any;
  lat:any=0;lon:any=0;
  dirPath:any;
  LatLon_arr=[]
  flag:any=0;
  fname:any;
  constructor(public navCtrl: NavController,public loadingController:LoadingController,public backgroundGeolocation:BackgroundGeolocation,public platform:Platform,public zone:NgZone,private geo:Geolocation ,private mediaCapture: MediaCapture, private storage: Storage, private file: File, private media: Media) 
  {
    
  }
 
  ionViewWillEnter() {
    this.storage.get(MEDIA_FILES_KEY).then(res => {
    this.mediaFiles = JSON.parse(res) || [];
    })
     this.geo.getCurrentPosition({enableHighAccuracy:true});
     let loader=this.loadingController.create({content:"fetcing location.."});
     loader.present().then(()=>{
       this.watch = this.geo.watchPosition({enableHighAccuracy:true,maximumAge:0}).subscribe((position: Geoposition) =>{ 
         let d:Date=new Date();
         while(this.lat==0 && this.lon==0)
         {
           this.lat = position.coords.latitude;
           this.lon = position.coords.longitude;
         }
         this.lat = position.coords.latitude;
         this.lon = position.coords.longitude;
         setTimeout(()=>{
           this.LatLon_arr.push({lat:this.lat,lon:this.lon,min:d.getMinutes(),sec:d.getSeconds()});        

         },1000);
       });
    loader.dismiss();
      }); 
  }

  captureVideo() {
    this.flag=0;
    this.lat=0;
    this.lon=0;
    let options: CaptureVideoOptions = {
      limit: 1,
      duration: 30
    }
    
     this.mediaCapture.captureVideo(options).then((res: MediaFile[]) => {
      let capturedFile = res[0];
      let d=new Date(capturedFile.lastModifiedDate);
      alert(d.getMinutes()+"  "+d.getSeconds())
      let fileName = capturedFile.name;
      this.fname=fileName;
      let dir = capturedFile['localURL'].split('/');
      dir.pop();
      let fromDirectory = dir.join('/');      
      var toDirectory = this.file.dataDirectory;
      this.file.copyFile(fromDirectory , fileName , toDirectory , fileName).then((res) => {
      this.storeMediaFiles([{name: fileName, size: capturedFile.size}]);
//        this.watch.unsubscribe();

      this.stopWatch();        
      },err => {
        alert('error: '+ JSON.stringify(err));
        this.watch.unsubscribe();
      });
          },
    (err: CaptureError) => {alert(JSON.stringify(this.LatLon_arr));console.error(err);alert("error:"+JSON.stringify(err));this.watch.unsubscribe();});   
          
  }
  play(myFile) {
    if (myFile.name.indexOf('.2wav') > -1) {
      const audioFile: MediaObject = this.media.create(myFile.localURL);
      audioFile.play();
    } else {
      let path = this.file.dataDirectory + myFile.name;
      let url = path.replace(/^file:\/\//, '');
      let video = this.myVideo.nativeElement;
      video.src = url;
      video.play();

    }
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

  mappage()
  {
    this.navCtrl.push(MapPage);
  }
  startWatch()
  { 
    this.lat=0;this.lon=0;    
  }
  stopWatch()
  { 
    let jObj=JSON.stringify(this.LatLon_arr);
    alert(jObj);
    // this.file.createFile(this.file.externalApplicationStorageDirectory,'fname.json',true).then(()=>{ 
    // }).catch(err=>{
    //   alert("error creating a file");
    // });
    //let f=this.fname.append('.json');
    //this.file.writeFile(this.file.externalApplicationStorageDirectory,"fname.json",JSON.stringify(this.LatLon_arr),{replace:true}).then(()=>{
      //alert("contents written succcesfully");
      // this.file.readAsText(this.file.externalApplicationStorageDirectory,'fname.json').then(fData=>{
      //   alert("contents are:"+fData);
      // }).catch(err=>{
      //   alert("error reading the comntentrs of the files");
      // })
    // }).catch(err=>{
    //   alert("error writing into file: "+JSON.stringify(err));
    // }); 
    this.empty();
  }
  empty()
  {
    this.LatLon_arr.length=0;
  }
}