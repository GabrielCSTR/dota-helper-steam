
import { SteamComInteractor } from "../utils/steamCommunityInteractor";
import moment from 'moment';
import SteamUser from "steam-user";
import SteamCommunity from "steamcommunity";

class ChatCommandsProcessor {   

  public async command1(args: string[]) {
    console.log(args);
    const response = "You executed the template command. Your arguments are:";
    let messages = [response, ...args];
    
    return  messages;
  }

  public async getUserInfo(args: string[], community: SteamCommunity, userID: SteamUser) {
    let userJson: any;
    let user: any;

    if (args.length == 0) {
      user = await SteamComInteractor.getPlainUser(community, userID).catch((err) => {
        console.log(userID);
        console.log(err);
      });
    } else {
      user = await SteamComInteractor.getPlainUser(community, args[0]).catch((err) => {
        console.log(args[0]);
        console.log(err);
      });
    }

    if (!user) return "Error loading user's data.";

    const group = await SteamComInteractor.getSteamGroup(community, user.primaryGroup);

    userJson = {
      name: user.name,
      onlineStatus: user.onlineState,
      stateMessage: user.stateMessage,
      vacBanned: user.vacBanned,
      tradeBanStatus: user.tradeBanState,
      isLimitedAccout: user.isLimitedAccount,
      memberSince: moment(user.memberSince).format("MMM Do YY"),
      primaryGroup: group.name,
    };

    const response = `${JSON.stringify(userJson, null, 2)}`;
    return response;
  }

  public async getAvatar(args: string[], community: SteamCommunity, userID: SteamUser) {
    let userJson: any;
    let user: any;

    if (args.length == 0) {
      user = await SteamComInteractor.getPlainUser(community, userID).catch((err) => {
        console.log(userID);
        console.log(err);
      });
    } else {
      user = await SteamComInteractor.getPlainUser(community, args[0]).catch((err) => {
        console.log(args[0]);
        console.log(err);
      });
    }

    if (!user) return "Error loading user's data.";

    return user.getAvatarURL(["full"]);

  }

  public help(){
    const message =  "Lista de comandos:\n*1 -> !dota counters + 'nome hero' -> ex: !dota counter viper\n*2 -> !contato\n*3 -> !sobre"
    return message
  }

  public about(){
    const message =  "> Doto Bot\nÉ um bot feito para mostrar os counter picks dos heros. Todos os dados são retirados do STRATZ.\n\n\nVERSAO: 1.0\nULTIMO UPDATE: 02/2024\nDOTOBOT@2024"
    return message
  }
}

export const chatCommandsProcess = new ChatCommandsProcessor();