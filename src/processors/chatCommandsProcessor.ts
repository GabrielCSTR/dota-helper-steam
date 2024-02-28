
import { SteamComInteractor } from "../utils/steamCommunityInteractor";
import moment from 'moment';
import SteamUser from "steam-user";
import SteamCommunity from "steamcommunity";
import { StratzInteractor } from "../utils/stratzInteractor";

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

  public async getCounterHeroes(args: string[]): Promise<any>{
    try {
        const hero = await StratzInteractor.getHeroIdByName(args[0]).catch((err) => {
            console.log(args[0]);
            console.log(err);
        });
        const heroData: any = await StratzInteractor.getHeroById(parseInt(hero.id)).catch((err) => {
            console.log(args[0]);
            console.log(err);
        });
    
        // const bestVsHeroes = heroData.vs.sort((a: any, b: any) => {
        //     const anticipatedWinRateA = a.synergy; 
        //     const anticipatedWinRateB = b.synergy;
        
        //     const winRateA = a.winCount / a.matchCount;
        //     const winRateB = b.winCount / b.matchCount;
        
        //     const diffA = anticipatedWinRateA - winRateA;
        //     const diffB = anticipatedWinRateB - winRateB;
        
        //     return diffB - diffA;
        // });

        const badVsHeroes = heroData.vs.sort((a: any, b: any) => {
            const anticipatedWinRateA = a.synergy; 
            const anticipatedWinRateB = b.synergy;
        
            const winRateA = a.winCount / a.matchCount;
            const winRateB = b.winCount / b.matchCount;
        
            const diffA = anticipatedWinRateA - winRateA;
            const diffB = anticipatedWinRateB - winRateB;
        
            return diffA - diffB;
        });

        const allHeroes = await StratzInteractor.getAllHeroes().catch((err) => {
            console.log(args[0]);
            console.log(err);
        });

        badVsHeroes.find((hero: any) => {
            const bestHero = allHeroes.find((item: any) => item.id === hero.heroId2);
            hero.displayName = bestHero.displayName;
            hero.shortName = bestHero.shortName;
        });

        let outputCounterHeroes = `TOP 10 HERO COUNTERS ${hero.displayName.toUpperCase()}:\n`;
        outputCounterHeroes += badVsHeroes.slice(0, 10).map((heroData: any, index: any) => {
            const synergyPercentage = heroData.synergy;
            const winRate = (heroData.winCount / heroData.matchCount) * 100;
            const paddedName = heroData.displayName.padEnd(20); // Adiciona espaços para completar até 20 caracteres
            return `\n#${index + 1}: ${paddedName} | winrate: ${winRate.toFixed(1)}% | advantage: ${synergyPercentage.toFixed(1)}%`;
        }).join('\n');
        outputCounterHeroes += `\n\nsource -> STRATZ - ${new Date().toLocaleDateString()}`;
        return outputCounterHeroes
    } catch (error) {
        console.error("Error get counter heroes:", error);
        return ""
    }
    
  }

}

export const chatCommandsProcess = new ChatCommandsProcessor();