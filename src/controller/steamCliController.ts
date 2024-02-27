import { Login } from "../config/login";
import SteamUser from "steam-user";

export class ClientLoginController {
  public client: SteamUser;
  public logins: Login;

  constructor(logins: any) {
    // Login bot and setUp the trade manager.
    this.logins = logins;
    this.client = new SteamUser();
    this.client.logOn(this.logins.getLogin());
  }

  start() {
    this.client.on("loggedOn", () => {
      console.log("Logged in.");
      // Set status and game to play.
      this.client.setPersona(SteamUser.EPersonaState.LookingToPlay);
      this.client.gamesPlayed(570);
    //   this.loadChatListeners();
    //   this.loadTradeListeners();
    });
  }
}
