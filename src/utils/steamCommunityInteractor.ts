import SteamCommunity from "steamcommunity";

export class SteamComInteractor { 

  public static getNicknameFromUserID(community: SteamCommunity, steamID: any): Promise<string> {
    return new Promise((resolve, reject) => {
      community.getSteamUser(steamID, (err: any, user: any) => {
        if (err) reject(err);
        
        const nickname = user.name;
        resolve(nickname)
      });
    })
  };

  public static getPlainUser(community: SteamCommunity, steamID: any): Promise<any> {
    return new Promise((resolve, reject) => {
      community.getSteamUser(steamID, (err: any, user: any) => {
        if (err) reject(err);
        
        resolve(user)
      });
    })
  };

  public static getSteamGroup(community: SteamCommunity, groupID: any): Promise<any> {
    return new Promise((resolve, reject) => {
      community.getSteamGroup(groupID, (err, group) => {
        if (err) reject(err);
        
        resolve(group)
      });
    })
  };
}