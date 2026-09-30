# MERN - Simple Setup Check

### [Live Demo](http://simplesetup.mernbook.com/ "MERN Simple Setup")

The code is split into two independent projects:
- `server/` - Express 5 + MongoDB driver (API; serves the built client in production)
- `client/` - React 19 built with Vite (`client/index.html` is the HTML shell)

#### What you need to run this code
1. Node (22.9 or newer)
2. MongoDB

####  How to run this code
1. Clone this repository
2. In `server/`, copy `.env.example` to `.env` and adjust `MONGODB_URI` if needed
3. Install dependencies in both projects: run ```  npm install  ``` in `server/` and in `client/`
4. For development, run ```  npm run dev  ``` in `server/` (Express on port 3000) and in `client/` (Vite on port 5173)
5. Open [localhost:5173](http://localhost:5173/) for the React app; Vite forwards `/hello` to Express. The API is also reachable directly at [localhost:3000/hello](http://localhost:3000/hello)

#### Production
1. In `client/`, run ```  npm run build  ``` (outputs `client/dist/index.html` and `client/dist/assets/`)
2. In `server/`, run ```  npm start  ``` and open [localhost:3000](http://localhost:3000/): Express serves both the app and the API
