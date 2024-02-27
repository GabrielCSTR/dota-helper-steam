import { Login } from "../config/login";
import SteamUser from "steam-user";
import { SteamComInteractor } from "../utils/steamCommunityInteractor";
import SteamCommunity from "steamcommunity";
import { messageHandler } from "../handlers/messageHandler";

export class ClientLoginController {
  public client: SteamUser;
  public logins: Login;
  public community: SteamCommunity;

  constructor(logins: any) {
    // Login bot and setUp the trade manager.
    this.logins = logins;
    this.client = new SteamUser();
    this.client.logOn(this.logins.getLogin());
    this.community = new SteamCommunity();
  }

  start() {
    this.client.on("loggedOn", () => {
      console.log('Bot conectado ID: ' + this.client?.steamID?.getSteam3RenderedID(),);
      // Set status and game to play.
      this.client.setPersona(SteamUser.EPersonaState.LookingToPlay, process.env.BOT_STEAM_NAME);
      this.client.gamesPlayed(570); // playing dota 2
      this.loadChatListeners();
    });
  }

  private async loadChatListeners() {
    // process messages
    this.client.chat.on("friendMessage", async (msg) => {
      let message = msg.message_no_bbcode;
      let steamID = msg.steamid_friend;
      const nickname = await SteamComInteractor.getNicknameFromUserID(this.community, steamID);
      messageHandler.processMessage(message, nickname, steamID, this.client, this.community);
    });
  }
}
