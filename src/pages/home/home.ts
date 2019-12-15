import { Component, ViewChild, ElementRef } from '@angular/core';
 
import { Geolocation } from '@ionic-native/geolocation';
import { NativeGeocoder, NativeGeocoderReverseResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder';
import { AuthServiceProvider as AuthService } from '../../providers/auth-service/auth-service'
import { AngularFireDatabase } from 'angularfire2/database';
import Firebase from 'firebase';

declare var google;
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  private locations = this.db.list<any>('locations');

  @ViewChild('map') mapElement: ElementRef;
  map: any;
  address:string;
  isWatching:boolean=false;
  watchLocationUpdates:any;
  user_id:any=null;
  user_key:any=null;
  hasLocation:any=false;
  access_code:any='';
  locations_new: any;
  locationIndex: any;
  locationsRef: any;
  user: any;
 
  constructor(
    private geolocation: Geolocation,
    private nativeGeocoder: NativeGeocoder,
    private auth: AuthService,
    private db: AngularFireDatabase) {
    //Firebase.initializeApp(firebaseConfig.fire);
    this.getUsersLocationData();
  }
  ngOnInit() {
    this.loadMap();
  }
  ionViewDidEnter(){
    this.user_id = this.auth.getCurrentUserId();
    //this.getUsersLocationData();
  }
  loadMap() {
    this.geolocation.getCurrentPosition().then((resp) => {
      let latLng = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
      let mapOptions = {
        center: latLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }
 
      this.getAddressFromCoords(resp.coords.latitude, resp.coords.longitude);
 
      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
      this.watchLocation();
 
      this.map.addListener('tilesloaded', () => {
        this.getAddressFromCoords(this.map.center.lat(), this.map.center.lng())
      });
 
    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }
  getAddressFromCoords(lattitude, longitude) {
    console.log("getAddressFromCoords "+lattitude+" "+longitude);
    let options: NativeGeocoderOptions = {
      useLocale: true,
      maxResults: 5
    };
 
    this.nativeGeocoder.reverseGeocode(lattitude, longitude, options)
      .then((result: NativeGeocoderReverseResult[]) => {
        this.address = "";
        let responseAddress = [];
        for (let [key, value] of Object['entries'](result[0])) {
          if(value.length>0)
          responseAddress.push(value);
 
        }
        responseAddress.reverse();
        for (let value of responseAddress) {
          this.address += value+", ";
        }
        this.address = this.address.slice(0, -2);
      })
      .catch((error: any) =>{ 
        this.address = "Address Not Available!";
      });
 
  }
  logout() {
    this.auth.signOut();
    this.locationIndex = null;
    //this.nav.setRoot(HomePage);
  }
  addLocationRecord(data){
		return this.locations.push(data);	
  }
  //Start location update watch
  watchLocation(){
    this.isWatching = true;
    this.watchLocationUpdates = this.geolocation.watchPosition();
    this.watchLocationUpdates.subscribe((resp) => {
      //set the map location to the new location
      //update location
      //old implimentation
      //this.locations.update(this.user_key, { lat: resp.coords.latitude, lng: resp.coords.longitude});
      //new implimantation
      this.updateUserLocation(resp.coords.latitude, resp.coords.longitude);
      //update dislayed address
      this.getAddressFromCoords(resp.coords.latitude, resp.coords.longitude)
    });
  }
  updateAccessCode(){
    const ref = Firebase.database().ref(`/locations_v2/${this.locationIndex}/accessCode`);
    ref.set(this.access_code)
  }
  getUsersLocationData(){
    this.locationsRef = Firebase.database().ref('/locations_v2');
    this.locationsRef.on('value', snapshot => {
      this.locations_new = snapshot.val();
      this.user = this.auth.getCurrentUser()
      if(this.user){
        let userLocationIndex = this.userLocationIndex()
        if(userLocationIndex){
          //set a refrence to the location index
          this.locationIndex = userLocationIndex;
          this.access_code = this.locations_new[this.locationIndex].accessCode;
        }
        else{
          //create a new location/ note that this will make this process fire again
          this.createNewlocationRecord();
        }
      }
    });
  }

  userLocationIndex(){
    const devIndex = this.findLocationIndexByEmail(this.user.email)
    return devIndex;
  }

  findLocationIndexByEmail(email){
    let index = null;
    try{
      Object.keys(this.locations_new).forEach((key)=>{
        if(this.locations_new[key].email === email){
          index = key;
          throw {}
        }
      })
    }
    catch(e){}
    return index;
  }
  createNewlocationRecord(){
    this.locationsRef.push({
      'user_id':this.user.uid,
      'email' : this.user.email,
      'lat':0,
      'lng':0,
      'accessCode':''
    });
  }

  updateUserLocation(lat, lng){
    const ref = Firebase.database().ref(`/locations_v2/${this.locationIndex}`);
    const currentLocation = this.locations_new[this.locationIndex];
    currentLocation.lat = lat;
    currentLocation.lng = lng;
    ref.set(currentLocation);
  }
}
