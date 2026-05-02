# MERN Social

## 5.2.2026
Claude assisted upgrading. 
● Agent(Save project memory for ch5 upgrade)                                                                                                   
  ⎿  Backgrounded agent (↓ to manage · ctrl+o to expand)                                                                                       
                                           
● Both webpack builds pass with zero errors. Here's a summary of everything that was upgraded:                                                 
                                                                                                                                               
  ---                                                                                                                                          
  Dependencies removed: material-ui, material-ui-icons, react-hot-loader, react-router, body-parser, babel-core, babel-preset-*, old           
  babel-loader, file-loader, webpack-cli v2, webpack-node-externals v1                                                                         
                                                                                                                                               
  Dependencies added: @mui/material, @mui/icons-material, @emotion/react, @emotion/styled, @emotion/cache, @emotion/server, @babel/core,       
  @babel/preset-env, @babel/preset-react, @babel/plugin-transform-class-properties, react@18, react-dom@18, react-router-dom@6, mongoose@8,
  express-jwt@8, formidable@3, webpack@5, webpack-cli@5, webpack-dev-middleware@7, nodemon@3

  Key code changes:
  - Removed "type": "module" from package.json (webpack configs are CommonJS)
  - Babel 7 preset names (@babel/preset-env, @babel/preset-react)
  - Webpack 5: asset/resource instead of file-loader, updated library config
  - Server: Mongoose 8 async/await throughout all controllers, express-jwt v8 named export { expressjwt } + algorithms: ['HS256'], formidable
  v3 file property names (filepath/mimetype), Helmet CSP disabled for dev
  - SSR: Replaced material-ui JSS/SheetsRegistry with @emotion/server extractCriticalToChunks per-request, StaticRouter from
  react-router-dom/server
  - React 18: hydrateRoot in main.js, CacheProvider wrapping in App.js
  - React Router v6: Routes/Route with element prop, new PrivateRoute, new client/withRouter.js HOC for class components
  - MUI v5: All imports updated, createTheme/ThemeProvider, theme.spacing(N), variant="contained" buttons, ImageList/ImageListItem,
  variant="fullWidth" tabs, Typography variant names updated
  - React lifecycle: componentWillReceiveProps → componentDidUpdate with prevProps guards

✻ Cogitated for 17m 13s · 1 local agent still running

● Agent "Save project memory for ch5 upgrade" completed

● Memory saved. The upgrade is complete and both webpack builds pass cleanly.

✻ Baked for 2s

※ recap: Upgraded Chapter 5 mern-social from Node 8/React 16 era to modern stack — both webpack builds pass with zero errors. Next step is     
  installing MongoDB and running the dev server to verify the app works end-to-end. (disable recaps in /config)
                                                                                                                      
                                                                                                                    
### TODO
1. Run dev server
1. Separate servers
1. Refactor client to use functions instead of classes
1. Use vite instead of webpack
1. Ask for best practices

## Chapter 05: 3.25.2025

1. Live demo still available, but I did not try.
1. Some problems with ssl legacy version and other thinks
1. going from 8.11 to 13.14 and back and forth again resolved the issues
1. Today the first commit: added photo and hashed_password to the ouptut of /api/users get route
1. Tested astro forms to do SSR server side rendering for now, but to add build and then add dynamic data. 
1. Two fetch actions, one depending on the other it is not working
1. /api/users get brings all data for unsigned account
1. The only get route for the account pic needs the _id, but it cannot be extracted after the data is sent, so no way to call the second route to fetch photos

### [Live Demo](http://social.mernbook.com/ "MERN Social")

#### What you need to run this code
1. Node (8.11.1)
2. NPM (5.8.0)
3. MongoDB (3.6.3)

####  How to run this code
1. Clone this repository
2. Open command line in the cloned folder,
   - To install dependencies, run ```  npm install  ```
   - To run the application for development, run ```  npm run development  ```
4. Open [localhost:3000](http://localhost:3000/) in the browser
