import SteamUser from "steam-user";
import SteamCommunity from "steamcommunity";
import { chatCommandsProcess } from "../processors/chatCommandsProcessor";

enum IFormatTypes {
  DEFAULT = "",
  CODE = "/code",
  ME = "/me",
  PRE = "/pre",
  SPOILER = "/spoiler",
  QUOTE = "/quote"
}

// enum IMedalTypes {
//     UNCALIBRATED    = "UNKNOW",
//     HERALD          = "HERALD",
//     GUARDIAN        = "GUARDIAN",
//     CRUSADER        = "CRUSADER",
//     ARCHON          = "ARCHON",
//     LEGEND          = "LEGEND",
//     ANCIENT         = "ANCIENT",
//     DIVINE          = "DIVINE",
//     IMMORTAL        = "IMMORTAL"
// }
class MessageHandler {
    // commands cooldowns in secounds
  private commandCooldowns: { [command: string]: number } = {
    command: 30, 
    getuserinfo: 60, 
    about: 10, 
    help: 10, 
    counter: 15, 
    best: 20, 
    meta: 30 
  };

  private commandLastUsage: { [command: string]: number } = {};

  public async processMessage(
    message: string,
    nickname: string,
    steamUserID: any,
    client: SteamUser,
    community: SteamCommunity
  ) {
    // Pre-prepare the response.
    let response: string | string[] = null || [];

    // format text types
    // 0 - default
    // 1 - /code ( Formata o texto como um bloco de código )
    // 2 - /me ( Exibe o texto na mesma cor e linha que o seu apelido (comumente usado para indicar uma ação) )
    // 3 - /pre ( Formata um texto em uma fonte monoespaçada, preservando espaços em branco )
    // 4 - /spoiler  ( Oculta o conteúdo da mensagem até passar o cursor por cima )
    // 5 - /quote: Formata o texto como um bloco de citação
    let format: IFormatTypes = IFormatTypes.DEFAULT;

    // Start of command detection.
    if (message.startsWith(">") && message.length >= 2) {
      message = message.replace(/\s+/g, " ");
      let args = message.split(" ");
      const command = args[0].substring(1);
      args.splice(0, 1);

      const inCooldown = await this.hasCommandCooldown(command);
      if (inCooldown) {
        response = `O comando ${command} está em cooldown. Por favor, aguarde um pouco antes de usar novamente.`;
        format = IFormatTypes.PRE;
        this.sendMessage(response, client, steamUserID, format);
        return;
      } else {
        
        switch (command.toLowerCase()) {
          case "command":
            response = await chatCommandsProcess.command1(args);
            format = IFormatTypes.ME;
            break;

          case "getuserinfo":
            response = await chatCommandsProcess.getUserInfo(
              args,
              community,
              steamUserID
            );
            format = IFormatTypes.CODE;
            break;

          case "about":
            response = await chatCommandsProcess.about();
            format = IFormatTypes.PRE;
            break;

          case "help":
            response = await chatCommandsProcess.help();
            format = IFormatTypes.PRE;
            break;

          case "counter":
            response = await chatCommandsProcess.getCounterHeroes(args);
            format = IFormatTypes.PRE;
            break;

          case "best":
            response = await chatCommandsProcess.getBestHeroesVs(args);
            format = IFormatTypes.CODE;
            break;

          case "meta":
            response = await chatCommandsProcess.getCurrentMeta(args);
            format = IFormatTypes.CODE;
            break;

          default:
            response = "Invalid command.\nFor help use command: >help";
            format = IFormatTypes.PRE;
            break;
        }

        // set command cooldown
        this.setCommandCooldown(command);
      }
    }

    // --------------SEND RESPONSE TO USER---------------------
    console.log(
      steamUserID.getSteam3RenderedID() + " <- " + nickname + ": " + message
    );
    if (response) {
      if (!Array.isArray(response)) {
        this.sendMessage(response, client, steamUserID, format);
      } else if (Array.isArray(response)) {
        this.sentArrayMessage(response, client, steamUserID, format);
      }
    }
  }

  private async sendMessage(
    message: string,
    client: SteamUser,
    steamUserID: any,
    format: IFormatTypes
  ) {
    message = `${format} ` + message;

    client.chat.sendFriendTyping(steamUserID).then((value) => {
      setTimeout(() => {
        client.chat.sendFriendMessage(steamUserID, message).then(() => {
          console.log(
            steamUserID.getSteam3RenderedID() + " -> Bot: " + message
          );
          Promise.resolve(message);
        });
      }, 3000); // 3 secounds send msg
    });
  }

  private async sentArrayMessage(
    messages: string[],
    client: SteamUser,
    steamUserID: any,
    format: IFormatTypes
  ) {
    for (const key in messages) {
      await this.delay(1000).then((_) => {
        this.sendMessage(messages[key], client, steamUserID, format);
      });
    }
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public async hasCommandCooldown(command: string): Promise<boolean> {
    const cooldown = this.commandCooldowns[command.toLowerCase()];
    if (!cooldown) {
      return false; // Se o comando não estiver no mapeamento, não há tempo de espera
    }

    const lastUsage = this.commandLastUsage[command.toLowerCase()] || 0;
    const currentTime = Math.floor(Date.now() / 1000); // Obtém o tempo atual em segundos

    if (lastUsage + cooldown > currentTime) {
      return true; // Se ainda estiver dentro do tempo de espera, retorna true
    } else {
      this.commandLastUsage[command.toLowerCase()] = currentTime;
      return false; // Se o tempo de espera acabou, retorna false e atualiza o último uso do comando
    }
  }

  private setCommandCooldown(command: string) {
    this.commandCooldowns[command] = Date.now();
  }
}

export const messageHandler = new MessageHandler();
