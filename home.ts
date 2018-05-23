import { Component,ViewChild } from '@angular/core';
import { NavController,Platform } from 'ionic-angular';
import {Geolocation} from '@ionic-native/geolocation';
import {File} from '@ionic-native/file';
import leaflet, { marker } from 'leaflet';



@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController,public file:File,public platform:Platform,public geo:Geolocation) {
    
  }
  @ViewChild('map') mapContainer;
  options={
    enableHighAccuracy:true
  };
  lat:any;
  lon:any;
  flag:any;
  map:any;
  obj={
    LatLon_arr:[]
  }
  dirPath:any;

  ionViewDidLoad()
  {
    this.file.createDir(this.file.externalApplicationStorageDirectory,'finalApp',true).then((dir)=>{
      alert("directory created"+dir.nativeURL);
      this.dirPath=dir.toURL;

    }).catch((err)=>{alert("unable to create a dir"+err )});
    this.map = leaflet.map("map").fitWorld();
      leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18
      }).addTo(this.map);

      this.map.locate({
        setView: true,
        maxZoom: 10
      })
      // .on('locationfound', (e) => {
      //   let markerGroup = leaflet.featureGroup();
      //   let marker: any = leaflet.marker([e.latitude, e.longitude]).on('click', () => {
      //     alert('Marker clicked');
      //   })
      //   markerGroup.addLayer(marker);
      //   this.map.addLayer(markerGroup);
      //   }).on('locationerror', (err) => {
      //     alert(err.message);
      // })
  }

  startWatch()
  {
    
    let mg={

    };

    this.flag=setInterval(()=>{
      this.geo.getCurrentPosition(this.options).then((res)=>{
        this.lat=res.coords.latitude;
        this.lon=res.coords.longitude;
        this.obj.LatLon_arr.push({lat:res.coords.latitude,lon:res.coords.longitude});
        if(mg != undefined) 
          this.map.removeLayer(mg);
        mg=leaflet.marker([this.lat,this.lon]).addTo(this.map);
      });
    },1000);
  }
  stopWatch()
  {
    let jObj=JSON.stringify(this.obj);
    let fop=this.file.writeFile(this.dirPath,'LatLon.json',jObj,{append:true,replace:false});
    fop.then((fData)=>{
      alert("Fle created at:"+this.dirPath)
    }).catch(error=>{
      alert("unable to create a file :"+error);
    });
    clearInterval(this.flag);
  }

}
