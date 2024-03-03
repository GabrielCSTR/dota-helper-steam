
import { SteamComInteractor } from "../utils/steamCommunityInteractor";
import moment from 'moment';
import SteamUser from "steam-user";
import SteamCommunity from "steamcommunity";
import { IMedalTypes, StratzInteractor } from "../utils/stratzInteractor";
import { getNameHero } from "../utils";

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
    const message = `
    Lista de comandos:
1. >counter + 'nome hero' - Exemplo: >counter viper
    Retorna os heróis que são counters do herói especificado.

2. >best + 'nome hero' - Exemplo: >best axe
    Retorna os heróis que o herói especificado é bom contra.

3. >meta + 'medalha' - Exemplo: >meta immortal
    Retorna meta atual da meldalha informada.

4. >getuserinfo + 'user SteamID64
    Retorna informações do user informado.

5. >contact
    Retorna informçãoes do desenvolvedor do bot

6. >about
    Dota 2 Helper, é um bot steam que ajuda a saber sobre informações de heroes ou players de dota2!
`;
    return message
  }

  public about(){
    const message =  "> Doto Bot\nÉ um bot feito para mostrar os counter picks dos heros. Todos os dados são retirados do STRATZ.\n\n\nVERSAO: 1.0\nULTIMO UPDATE: 02/2024\nDOTOBOT@2024"
    return message
  }

  public async getCounterHeroes(args: string[]): Promise<any>{
    try {
        if(!args[0]){
          return "Please informe hero name!\nFor help use command: >help"
        }

        const heroName = await getNameHero(args[0]);
        if(!heroName){
          return "Hero name invalid!\nex: >counter axe\nFor help use command: >help"
        }

        const hero = await StratzInteractor.getHeroIdByName(heroName.name).catch((err) => {
            console.log(args[0]);
            console.log(err);
        });

        const heroData: any = await StratzInteractor.getHeroById(parseInt(hero.id)).catch((err) => {
            console.log(args[0]);
            console.log(err);
        });

        const badVsHeroes = heroData.vs.sort((a: any, b: any) => {
            const anticipatedWinRateA = a.synergy; // synergy bad hero
            const anticipatedWinRateB = b.synergy;
        
            const winRateA = a.winCount / a.matchCount; // match count vs bad hero
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

        const worstHeroes = Object.entries(heroData.vs).reduce((acc: string, [key, value]: [string, any], index: number) => {
          if (index >= 5) {
            return acc;
          }
          const formattedValue = `${value.synergy.toFixed(2)}%`;
          return acc !== "" ? `${acc}\n${formattedValue}` : formattedValue;
        }, "");

        let outputCounterHeroes = `TOP 10 HERO COUNTERS ${hero.displayName.toUpperCase()}:\n`;
        outputCounterHeroes += badVsHeroes.slice(0, 10).map((heroData: any, index: any) => {
            const synergyPercentage = heroData.synergy;
            const winRate = (heroData.winCount / heroData.matchCount) * 100;
            const paddedName = heroData.displayName.padEnd(20); // Adiciona espaços para completar até 20 caracteres
            return `\n#${index + 1}: ${paddedName} | winrate: ${winRate.toFixed(1)}% | advantage: ${synergyPercentage.toFixed(1)}%`;
        }).join('\n');
        outputCounterHeroes += `\n\nsource: Stratz • ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
        return outputCounterHeroes
    } catch (error) {
        console.error("Error get counter heroes:", error);
        return ""
    }
    
  }

  public async getBestHeroesVs(args: string[]) : Promise<any>{
    try {
      if(!args[0]){
        return "Please informe hero name!\nFor help use command: >help"
      }

      const heroName = await getNameHero(args[0]);
      if(!heroName){
        return "Hero name invalid!\nex: >counter axe\nFor help use command: >help"
      }

      const hero = await StratzInteractor.getHeroIdByName(heroName.name).catch((err) => {
          console.log(args[0]);
          console.log(err);
      });

      const heroData: any = await StratzInteractor.getHeroById(parseInt(hero.id)).catch((err) => {
          console.log(args[0]);
          console.log(err);
      });

      const bestVsHeroes = heroData.vs.sort((a: any, b: any) => {
          const anticipatedWinRateA = a.synergy; 
          const anticipatedWinRateB = b.synergy;
      
          const winRateA = a.winCount / a.matchCount;
          const winRateB = b.winCount / b.matchCount;
      
          const diffA = anticipatedWinRateA - winRateA;
          const diffB = anticipatedWinRateB - winRateB;
      
          return diffB - diffA;
      });

      const allHeroes = await StratzInteractor.getAllHeroes().catch((err) => {
          console.log(args[0]);
          console.log(err);
      });

      bestVsHeroes.find((hero: any) => {
          const bestHero = allHeroes.find((item: any) => item.id === hero.heroId2);
          hero.displayName = bestHero.displayName;
          hero.shortName = bestHero.shortName;
      });

      let outputBestHeroesVs = `TOP 10 HERO COUNTERS ${hero.displayName.toUpperCase()}:\n`;
      outputBestHeroesVs += bestVsHeroes.slice(0, 10).map((heroData: any, index: any) => {
          const synergyPercentage = heroData.synergy;
          const winRate = (heroData.winCount / heroData.matchCount) * 100;
          const paddedName = heroData.displayName.padEnd(20); // Adiciona espaços para completar até 20 caracteres
          return `\n#${index + 1}: ${paddedName} | winrate: ${winRate.toFixed(1)}% | advantage: ${synergyPercentage.toFixed(1)}%`;
      }).join('\n');

      outputBestHeroesVs += `\n\nsource: Stratz • ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
      return outputBestHeroesVs

    } catch (error) {
      console.error("Error get counter heroes:", error);
      return ""
    }
  }

  public async getCurrentMeta(args: string[]): Promise<any>{

    if(!args[0]){
      return "Please informe medal!"
    }

    if(!IMedalTypes.includes(args[0]?.toUpperCase())){
      return `Invalid rank medal '${args[0]}'.\nPlease enter a valid medal name\nFor help use command: >help`
    }

    // get meta heroes week
    const metaWeekHeroes = await StratzInteractor.getMetaWeek(args[0].toUpperCase()).catch((err) => {
      console.log(args[0]);
      console.log(err);
    });

    // get all heroes
    const allHeroes = await StratzInteractor.getAllHeroes().catch((err) => {
        console.log(args[0]);
        console.log(err);
    });

    metaWeekHeroes.find((hero: any) => {
      const weekHero = allHeroes.find((item: any) => item.id === hero.heroId);
      hero.displayName = weekHero.displayName;
      hero.shortName = weekHero.shortName;
    })

    const metaHerosWeek = Array.from(new Set(metaWeekHeroes.map((objeto: any) => objeto.heroId)))
    .map(heroId => metaWeekHeroes.find((objeto:any) => objeto.heroId === heroId));
    
    metaHerosWeek.sort((a: any, b: any) => {
       const porcentWinA =  (a.winCount / a.matchCount) * 100;
      const porcentWinB =  (b.winCount / b.matchCount) * 100;

        // Compara pela porcentagem de vitórias
        if (porcentWinA < porcentWinB) {
          return 1;
        } else if (porcentWinA > porcentWinB) {
          return -1;
        }

        // Se a porcentagem de vitórias for igual, compara pelo heroId
        if (a.heroId < b.heroId) {
          return -1;
        } else if (a.heroId > b.heroId) {
          return 1;
        }

        return 0; // Se a porcentagem de vitórias e o heroId forem iguais, mantém a ordem original
  });


    let outputMetaWeek = `TOP 10 META HEROES MEDAL ${args[0]}:\n`;
    outputMetaWeek += metaHerosWeek.slice(0, 10).map((heroData: any, index: any) => {
        const matches = heroData.matchCount / 100;
        const winRate = (heroData.winCount / heroData.matchCount) * 100;
        const paddedName = heroData.displayName.padEnd(20); // Adiciona espaços para completar até 20 caracteres
        return `\n#${index + 1}: ${paddedName} | winrate: ${winRate.toFixed(1)}% | matches: ${matches.toFixed(2)}%`;
    }).join('\n');

    outputMetaWeek += `\n\nsource: Stratz • ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
    return outputMetaWeek
  }
}

export const chatCommandsProcess = new ChatCommandsProcessor();