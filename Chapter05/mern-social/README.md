# MERN Social

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
