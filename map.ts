import { Component,ViewChild, transition} from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import leaflet, { LatLng, geoJSON } from 'leaflet';
import { Geolocation } from '@ionic-native/geolocation'
import { File } from '@ionic-native/file';
/**
 * Generated class for the MapPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-map',
  templateUrl: 'map.html',
})
export class MapPage {
  watch:any;
  @ViewChild('map') mapContainer;
  map: any;
  lat:any;lon:any;
  obj ={
    LatLon_arr:[]
  };
  constructor(public navCtrl: NavController,public file:File,public navParams: NavParams,public geo:Geolocation) {
  }

  ionViewDidLoad() {
    let b=this.navParams.get('name');
    let a=b.split('.');
    a.pop();
    a=a+".json";
    
    console.log('ionViewDidLoad MapPage');
    this.map = leaflet.map("map").fitWorld();
    leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18
    }).addTo(this.map);
    this.file.readAsText(this.file.externalApplicationStorageDirectory,a).then((fdata)=>{
//      alert("contents in json format are:"+fdata);
      this.obj=JSON.parse(fdata);
    
//    alert("contents of the file are(map)"+this.obj);
    
    for(let i=0;i<Object.keys(this.obj).length-1;i++)
    {
      let a=new leaflet.LatLng(this.obj[i].lat,this.obj[i].lon);
      let b=new leaflet.LatLng(this.obj[i+1].lat,this.obj[i+1].lon);
      let pointList=[a,b];
      let firstpolyline = new leaflet.Polyline(pointList ,{
        });
      firstpolyline.addTo(this.map);
    }
  
    })
  }

  // startWatch()
  // {
  //   this.watch=this.geo.watchPosition({enableHighAccuracy:true}).subscribe((res)=>{
  //     let d=new Date();
  //     this.lat=res.coords.latitude;
  //     this.lon=res.coords.longitude;
  //     setTimeout(()=>{this.obj.LatLon_arr.push({lat:this.lat,lon:this.lon,min:d.getMinutes(),sec:d.getSeconds()})},1000)
  //   })
  // }
  // stopWatch()
  // {
  //   this.watch.unsubscribe();
  //   for(let i=0;i<this.obj.LatLon_arr.length-1;i++)
  //   {
  //     let a=new leaflet.LatLng(this.obj.LatLon_arr[i].lat,this.obj.LatLon_arr[i].lon);
  //     let b=new leaflet.LatLng(this.obj.LatLon_arr[i+1].lat,this.obj.LatLon_arr[i+1].lon);
  //     let pointList=[a,b];
  //     let firstpolyline = new leaflet.Polyline(pointList ,{
  //       });
  //     firstpolyline.addTo(this.map);
  //   }
  // }
}
