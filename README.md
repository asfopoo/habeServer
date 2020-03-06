<img src = https://github.com/asfopoo/habe/blob/master/src/Assets/Images/Håbe.svg alt="Habe" width="200" height="100"/>  

### A better way for hobbiysts and enthusiasts to find interesting, valuable, and relevant content.
---  

#### The purpose of this application is a social media sharing website to connect people with ideas, to how-to videos they may be interested in  This is the front end of the project written in react and making use of the material-ui library for a cleaner look

### Installation Instructions
- If you don't already have it, download node.  
- clone this project via git.  
- cd into the project.  
- run $ npm install.    

### Running the front end
- run $ node index.js  

### Contributing
- Create a branch named `<your_name>/<feature>`    
- Create a pull request to be merged to master  
- Once reviewed and tested your code may be merged to master  

### Testing
- run $npm run test  
  
### Troubleshooting  
- If you recieve "ER_NOT_SUPPORTED_AUTH_MODE: Client does not support authentication protocol requested by server; consider upgrading MariaDB client" connect to the database via sql workbench or datagrip and execute ```$ ALTER USER '<Database user>' IDENTIFIED WITH mysql_native_password BY '<Database password>'``` then execute ```$ flush privileges```

### Swagger
- Api documentation can be found at http://localhost:3333/api-docs/#/ Whent the server is running.
