# file-explorer-android-nodejs

This app can help open formats supported in browser which can not be open from the file manager app.
For example not all file manager opens "xml" files in browser. Hence can't do xml development in phone.
#### This application lets one open "xml", "xslt", "js", "css", "html", "json", "avi", "mp3", "mp4", "jpg", "png", etc all in browser.

The 'file-explorer.js' file can be placed in any directory from which the directory tree needs to be seen.
Get a nodejs server from Play Store , locate the file and run it . 

By default the code uses 8888 port. Hence after running "node file-explorer.js" it can be accessed from the browser through "http://localhost:8888"

![pic1](https://user-images.githubusercontent.com/20777854/41424001-6b7c50b2-701a-11e8-96e5-9f1869cb2773.png)

The second image shows the function that handles different formats. It can be changed to include more formats.

### For accessing from PC. Connect the phone and PC with same wifi and replace localhost in "http://localhost:8888" with phones IP address.
Which can be found by running "ipconfig" in "termux" application [from play store].

#### New UI after update : [also added search functionality]
![new_ui](https://user-images.githubusercontent.com/20777854/41619821-369f67a8-7425-11e8-9fd0-681feed772a8.png)
