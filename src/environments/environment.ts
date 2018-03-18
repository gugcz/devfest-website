// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: 'AIzaSyBZb3XkBPfmP9Chgsyd-t_ojwDv0wOaE3Q',
    authDomain: 'devfest2018-test.firebaseapp.com',
    databaseURL: 'https://devfest2018-test.firebaseio.com',
    projectId: 'devfest2018-test',
    storageBucket: 'devfest2018-test.appspot.com',
    messagingSenderId: '674588630934'
  }
};
