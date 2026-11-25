# Product Inventory - Frontend

React app of the Product Inventory API, built with [Vite](https://vite.dev/) and [React Router](https://reactrouter.com/). Its design follows the Figma mock-up of the project.

## Start it

The API must be running first: in the root folder of the project, run `npm run dev`.

Then, in this `frontend` folder:

```bash
npm install
npm run dev
```

The app is available at `http://localhost:5173`.

## How it talks to the API

The app calls `/api/...`, for example `/api/stats`. Vite sends these requests to the API at `http://localhost:3000`, without `/api` (see `vite.config.js`). So the API needs no change and no CORS.

## Structure

```
frontend/
├── index.html        # The HTML page, with the Inter font
├── vite.config.js    # Vite settings and the /api proxy
└── src/
    ├── main.jsx      # Starts React with the router
    ├── App.jsx       # Layout (sidebar + page) and the routes
    ├── api.js        # Requests to the API
    ├── utils.js      # Formatting and stock status
    ├── index.css     # Colors and styles of the mock-up
    ├── components/   # Sidebar, buttons, badges, cards...
    └── pages/        # One file per page
```
