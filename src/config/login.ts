export class Login {
  private login: any;

  async processLogin() {
    this.login = {
      password: process.env.BOT_STEAM_PASS,
      accountName: process.env.BOT_STEAM_USER
    };

    return login;
  }

  getLogin() {
    return this.login;
  }
}

export const login = new Login();
