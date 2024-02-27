import * as dotenv from "dotenv";
dotenv.config();
import { login } from "./config/login";
import { ClientLoginController } from "./controller/steamCliController";

// Start Bot.
(async () => {
    try {
        await login.processLogin();
        const scc = new ClientLoginController(login);
        scc.start();
    } catch (err) {
        console.error(err);
    }
})();