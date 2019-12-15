import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Geolocation } from '@ionic-native/geolocation';
import { NativeGeocoder } from '@ionic-native/native-geocoder';
import { NgxErrorsModule } from '@ultimate/ngxerrors';
//import { HttpClient } from '@angular/common/http';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import { SignupPage } from '../pages/signup/signup';

import { AngularFireModule } from 'angularfire2';
import { AngularFireAuth } from 'angularfire2/auth';
import { firebaseConfig } from '../config';
import { AuthServiceProvider } from '../providers/auth-service/auth-service';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { IonicStorageModule } from '@ionic/storage';
import { AngularFireDatabase } from 'angularfire2/database';
import { BackgroundMode } from '@ionic-native/background-mode';
//import { Storage } from '@ionic/storage';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    LoginPage,
    SignupPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(firebaseConfig.fire),
    IonicStorageModule.forRoot(),
    AngularFireDatabaseModule,
    NgxErrorsModule,
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    LoginPage,
    SignupPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    Geolocation,
    NativeGeocoder,
    //Storage,
    //HttpClient,
    AngularFireAuth,
    AngularFireDatabase,
    AuthServiceProvider,
    BackgroundMode
  ]
})
export class AppModule {}
