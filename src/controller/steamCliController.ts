import SteamUser from "steam-user";
import SteamID from 'steamid';
import { Login } from "../config/login";
import { SteamComInteractor } from "../utils/steamCommunityInteractor";
import SteamCommunity, { EFriendRelationship } from "steamcommunity";
import { messageHandler } from "../handlers/messageHandler";
import { logHandler } from "../utils/logHandler";

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

  onReady() {
    this.client.on("loggedOn", () => {
      logHandler.log('info', 'Bot conectado ID: ' + this.client?.steamID?.getSteam3RenderedID());
      // Set status and game to play.
      this.client.setPersona(SteamUser.EPersonaState.LookingToPlay, process.env.BOT_STEAM_NAME);
      this.client.gamesPlayed(570); // playing dota 2
      this.loadChatListeners();     // event chat message
      this.loadNewFriendRequest();  // event new friendrequest
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

  private async loadNewFriendRequest(){
    
    /*
      Listas de status de amigos

      None = 0,
      Blocked = 1,
      PendingInvitee = 2,
      RequestRecipient = 2, (alias of PendingInvitee)
        Friend = 3,
      RequestInitiator = 4,
      PendingInviter = 4, (alias of RequestInitiator)
      Ignored = 5,
      IgnoredFriend = 6,
      SuggestedFriend = 7
    */
    // check pedding request new friend
     this.community.getFriendsList(()=>{
        for (const steamID64 in this.client.myFriends) {
          if (!Object.prototype.hasOwnProperty.call(this.client.myFriends, steamID64)) {
              continue;
          }
          
          if ((this.client.myFriends[steamID64] as number) === EFriendRelationship.RequestRecipient) {
              this.respondToFriendRequest(steamID64);
          }
      }
    });
    
    // new request add friend
    this.client.on("friendRelationship", async (steamID: SteamID, relationship: number) => {

      if (relationship === EFriendRelationship.RequestRecipient) {
        logHandler.log('info',`NEW USER REQUEST ADD: ${steamID}`);
        const steamID64 = typeof steamID === 'string' ? steamID : steamID.getSteamID64();
        this.respondToFriendRequest(steamID64);
      }
    });
  }

  respondToFriendRequest(steamID: string){
    logHandler.log('info', `USER PEDDING ADD: ${steamID}`);
    logHandler.info(`Accepting friend request from ${steamID}...`);
    this.client.addFriend(steamID, err => {
      if (err) {
        logHandler.warn(`Failed to accept friend request from ${steamID}: `, err);
          return;
      }
      logHandler.debug('Friend request has been accepted');
      setTimeout(() => {
        const message = `/code ✅ Olá, seja bem-vindo(a). Eu sou o bot Dota Helper, Caso não me conheça use o comando >help para saber oque eu posso fazer!`
        this.client.chat.sendFriendMessage(steamID, message)
      }, 2000);
  });
  }
}
