# Chrome Extension React Seed
Seed for work on chrome extensions.  
It is based on create-react-app with typescript for the popup.  
The background is a regular ts. It can use modules etc...



## scripts
### yarn run build
builds the extension, including the background

### yarn run pack
builds the extension and creates a package.zip file

### yarn run build-no-popup
builds the extension without the popup

### yarn run pack-no-popup
builds the extension without the popup and creates a package.zip file


## instructions
Add web-accessible-resources in:
* TS files: src/web-accessible-resources
* other files in public/web-accessible-resources

Similarly add content scripts TS files in: src/content-scripts