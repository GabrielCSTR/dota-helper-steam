import SteamUser from "steam-user";
import SteamCommunity from "steamcommunity";

class MessageHandler {

    public async processMessage(message: string, nickname: string, steamUserID: any, client: SteamUser, community: SteamCommunity) {
        // Pre-prepare the response.
        let response: string | string[];
        
        // format text types
        // 0 - default
        // 1 - /code ( Formata o texto como um bloco de código )
        // 2 - /me ( Exibe o texto na mesma cor e linha que o seu apelido (comumente usado para indicar uma ação) )
        // 3 - /pre ( Formata um texto em uma fonte monoespaçada, preservando espaços em branco )
        // 4 - /spoiler  ( Oculta o conteúdo da mensagem até passar o cursor por cima )
        // 5 - /quote: Formata o texto como um bloco de citação
        let format: number = 0;

        // Start of command detection.
        if (message.startsWith(">") && message.length >= 2) {
            message = message.replace(/\s+/g,' ');
            let args = message.split(" ");
            const command = args[0].substring(1);
            args.splice(0, 1);

            switch(command.toLowerCase()){
                case "help":
                    break;
            }
        }
    }

    private async sendMessage(message: string, client: SteamUser, steamUserID: any, format = 0) {
        if (format == 1) message = '/code ' + message;

        client.chat.sendFriendMessage(steamUserID, message).then(() => {
            console.log(steamUserID.getSteam3RenderedID() + " -> Bot: " + message);
            Promise.resolve(message);
        });
    }

    private async sentArrayMessage(messages: string[], client: SteamUser, steamUserID: any, format = 0) {
        for(const key in messages) {
            await this.delay(1000).then(_ => {
                this.sendMessage(messages[key], client, steamUserID, format);
            });
        }
    }

    private delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export const messageHandler = new MessageHandler();