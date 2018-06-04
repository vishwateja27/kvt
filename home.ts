import { Component, ViewChild, NgZone } from '@angular/core';
import { NavController,Platform } from 'ionic-angular';
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
  w:any;c:any;
  mediaFiles = [];
  @ViewChild('myvideo') myVideo: any;
  lat:any;lon:any;
  dirPath:any;
  LatLon_arr=[]
  flag:any;
  fname:any;
  constructor(public navCtrl: NavController,public backgroundGeolocation:BackgroundGeolocation,public platform:Platform,public zone:NgZone,private geo:Geolocation ,private mediaCapture: MediaCapture, private storage: Storage, private file: File, private media: Media) 
  {
    
  }
 
  ionViewDidLoad() {
    this.storage.get(MEDIA_FILES_KEY).then(res => {
    this.mediaFiles = JSON.parse(res) || [];
    })
    this.geo.getCurrentPosition({enableHighAccuracy:true}).then(res=>{
      this.lat=res.coords.latitude;
      this.lon=res.coords.longitude;
    })
  }
  

  captureVideo() {
    let options: CaptureVideoOptions = {
      limit: 1,
      duration: 30
    }
    
    this.mediaCapture.captureVideo(options).then((res: MediaFile[]) => {
      clearInterval(this.flag);
      let capturedFile = res[0];
      let d=new Date(capturedFile.lastModifiedDate);
      alert(d.getMinutes()+"  "+d.getSeconds())
      let fileName = capturedFile.name;
      this.fname=fileName;
      let dir = capturedFile['localURL'].split('/');
      dir.pop();
      let fromDirectory = dir.join('/');      
      var toDirectory = this.file.dataDirectory;
      //let d:Date=new Date(res[0].lastModifiedDate);
      // alert("length: "+this.obj.LatLon_arr.length);
      // alert("min:"+d.getMinutes()+"sec: "+d.getSeconds()+"\n"+"LatLon_min:"+this.obj.LatLon_arr[this.obj.LatLon_arr.length-1].min+"\nLatlon_sec"+this.obj.LatLon_arr[this.obj.LatLon_arr.length-1].sec);
      this.file.copyFile(fromDirectory , fileName , toDirectory , fileName).then((res) => {
        this.storeMediaFiles([{name: fileName, size: capturedFile.size}]);
      this.watch.unsubscribe();
      this.stopWatch();        
      },err => {
        console.log('err: ', err);
        this.watch.unsubscribe();
      });
          },
    (err: CaptureError) => {console.error(err);alert("error:"+err);this.watch.unsubscribe();}); 
  }
  play(myFile) {
    if (myFile.name.indexOf('.wav') > -1) {
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

    this.watch = this.geo.watchPosition({enableHighAccuracy:true}).subscribe((position: Geoposition) =>{ 
    let d:Date=new Date(); 
    this.lat = position.coords.latitude;
    this.lon = position.coords.longitude;
    this.LatLon_arr.push({lat:this.lat,lon:this.lon,min:d.getMinutes(),sec:d.getSeconds()});
    
    }) 
  }
  stopWatch()
  {
   // alert(this.LatLon_arr.length);
    let jObj=JSON.stringify(this.LatLon_arr);
    this.file.createFile(this.file.externalApplicationStorageDirectory,'fname.json',true).then(()=>{
    alert("file created "); 
    }).catch(err=>{
      alert("error creating a file");
    });
   // let f=this.fname.append('.json');
    this.file.writeFile(this.file.externalApplicationStorageDirectory,"fname.json",JSON.stringify(this.LatLon_arr),{replace:true}).then(()=>{
      alert("contents written succcesfully");
      this.file.readAsText(this.file.externalApplicationStorageDirectory,'fname.json').then(fData=>{
        alert("contents are:"+fData);
      }).catch(err=>{
        alert("error reading the comntentrs of the files");
      })
    }).catch(err=>{
      alert("error writing into filr: "+JSON.stringify(err));
    })
    // for(let i=0;i<this.LatLon_arr.length;i++)
    //   this.LatLon_arr.pop();

  }

 
}
