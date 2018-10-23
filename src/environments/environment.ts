// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: 'AIzaSyDtuF9K1k7-crG8_xqmM6Fi49ZFTbPxmgU',
    authDomain: 'devfest-2018-cz.firebaseapp.com',
    databaseURL: 'https://devfest-2018-cz.firebaseio.com',
    projectId: 'devfest-2018-cz',
    storageBucket: 'devfest-2018-cz.appspot.com',
    messagingSenderId: '615143123799'
  }
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
