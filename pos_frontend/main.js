import { app, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch"; // npm install node-fetch@2

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  let startUrl = "http://localhost:3000/auth";

  // Check auth from Node backend
  // try {
  //   const res = await fetch("http://localhost:5000/api/check-auth", {
  //     credentials: "include",
  //   });
  //   const data = await res.json();
  //   if (1 == 2) {
  //     startUrl = process.env.VITE_DEV_SERVER_URL
  //       ? `${process.env.VITE_DEV_SERVER_URL}`
  //       : `file://${path.join(__dirname, "dist", "index.html")}`;
  //   } else {
  //     // Not logged in → redirect to /auth
  //     startUrl = process.env.VITE_DEV_SERVER_URL
  //       ? `${process.env.VITE_DEV_SERVER_URL}/auth`
  //       : `file://${path.join(__dirname, "dist", "index.html#/auth")}`;
  //     // Note: in production, use hash routing for subpages unless you configure Electron to handle deep linking
  //   }
  // } catch (err) {
  //   console.error("Auth check failed:", err);
  //   startUrl = process.env.VITE_DEV_SERVER_URL
  //     ? `${process.env.VITE_DEV_SERVER_URL}/auth`
  //     : `file://${path.join(__dirname, "dist", "index.html#/auth")}`;
  // }

  // startUrl = process.env.VITE_DEV_SERVER_URL
  //   ? `${process.env.VITE_DEV_SERVER_URL}/auth`
  //   : `file://${path.join(__dirname, "dist", "index.html#/auth")}`;

  console.log(startUrl);

  win.loadURL(startUrl);
}

app.whenReady().then(createWindow);
