import App from "./app";
import { Config } from "./config";
import Controllers from './modules';


( async () => {
  /* Process Enviroment */  
  const isStarted: boolean = await Config();
  if (isStarted) {
    /* Initializing Application */
    const app = new App(Controllers);
    app.startServer();
  }
  
})();


