import { HttpClient ,HttpClientModule} from '@angular/common/http';
import { HttpModule, Jsonp } from '@angular/http';
import { Injectable, NgZone } from '@angular/core';
import { BackgroundGeolocation } from '@ionic-native/background-geolocation';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import {File} from '@ionic-native/file';
import 'rxjs/add/operator/filter';
import { LoadingController } from 'ionic-angular';
 

/*
  Generated class for the LocationTrackerProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class LocationTrackerProvider {
  public watch: any;   
  public lat: number = 0;
  public lng: number = 0;
  public LatLon_arr=[];

  constructor(public zone: NgZone,public geolocation:Geolocation,public loadingController:LoadingController,public backgroundGeolocation:BackgroundGeolocation,public file:File) {
    console.log('Hello LocationTrackerProvider Provider');
  }


  startTracking() {  
     let config = {
      desiredAccuracy: 0,
      stationaryRadius: 0,
      distanceFilter: 0,
//      debug: true,
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
    this.watch.unsubscribe();
 
  }

  empty()
  {
    this.LatLon_arr.length=0;
  }

}



