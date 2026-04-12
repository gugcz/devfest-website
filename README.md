# DevFest.cz 2021
Standard Web App for Tech Communties. <br>
[Based on Project Aura](https://github.com/gdg-x/aura) <br>


## Features
| Feature | Description |
|---|---|
| **Fast and optimized** | PWA on Lighthouse |
| **Works offline** | Can work offline |
| **Mobile first** | Mobo Friendly Web app can be installed as a native app on your phone |
| **SEO optimized** | index all content and get to the top in search results |
| **Easy in management** | Easy in Management by using Aura Admin |
| **Trigger Push Notification** | Trigger Push Notification to Aura Main |

## Technology Stack

* [VueJS](https://vuejs.org/)
* [Vuetify](https://vuetifyjs.com/en/)
* [Firebase](https://firebase.google.com/)
* [Service Worker & PWA](https://www.npmjs.com/package/vue-pwa)
* [Workbox](https://developers.google.com/web/tools/workbox)
* [Google Cloud Platform](https://cloud.google.com/)
* [Google Data Studio](https://datastudio.google.com/u/0/)

### Project setup
1. Clone the repo and `npm install`
1. Compiles and hot-reloads for development use `npm run serve`
1. Compiles and minifies for production use `npm run build`
1. Lints and fixes files use `npm run lint`
1. Cloud Firestore rules:
    ```js
    rules_version = '2';
    service cloud.firestore {
    match /databases/{database}/documents {
            
        // Register User Data
        match /edata/{data} {
            allow read, update: if request.auth.uid == data || get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.uid == request.auth.uid;
        allow create, write: if request.auth != null;
        allow delete: if false;
        }
        
        // Register User to participants into Contest
        match /contestData/{data} {
            allow read: if request.auth.uid == data || get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.uid == request.auth.uid;
        allow create, write,update: if request.auth != null;
        allow delete: if false;
        } 
        
        // Register User Data to add Project
        match /edata/{data}/projects/{projectid} {
            allow read: if request.auth.uid == data || get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.uid == request.auth.uid;
        allow create, write, delete, update: if request.auth.uid == data;
        }
        
        // Register User Data to add Badges
        match /edata/{data}/badges/{badgeid} {
            allow read: if request.auth.uid == data || get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.uid == request.auth.uid;
        allow create, write, delete, update: if request.auth.uid == data;
        }
        
        // Public User
        match /publicProfile/{data} {
            allow read: if true;
        allow create, write, delete, update: if request.auth.uid == data;
        }
        
        //badges
        match /badges/{data} {
            allow read: if true;
        allow create, write,delete, update: if get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.uid == request.auth.uid;
        }
        
        match /admins/{data} {
            allow read: if request.auth != null;
        }
        
        // Notification
        match /pushNotificationTokens/{data} {
            allow read, create, write : if true;
        allow delete :  if true;
        allow update : if true;
        allow list: if true;
        }
        
        // Store Push Notification    
        match /pushNotifications/{data} {
            allow read,create, write, delete, update : if request.auth.uid == data || get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.uid == request.auth.uid;
        }
        
        // Store Feedback    
        match /feedback/{data} {
            allow create, write: if true;
        allow read: if get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.uid == request.auth.uid;
        }
    
    }
    }
    ```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## LICENSE
Check out the developer [LICENSE](https://github.com/gdg-x/aura/blob/master/LICENSE)
