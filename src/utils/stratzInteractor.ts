import axios from "axios";
import {GET_ALL_HEROES, GET_HERO_BY_ID, GET_META_HEROES} from "./stratzQuery";
const API_URL = process.env.STRATZ_API   || "";
const TOKEN   = process.env.STRATZ_TOKEN || "";

export const IMedalTypes = [
    'UNCALIBRATED',
    'HERALD',
    'GUARDIAN',
    'CRUSADER',
    'ARCHON',
    'LEGEND',
    'ANCIENT',
    'DIVINE',
    'IMMORTAL',
  ];

export class StratzInteractor {

  public static async getAllHeroes() {
    try {
      const headers = {
        Authorization: `Bearer ${TOKEN}`
      };
      const response = await axios.post(
        API_URL,
        {
          query: GET_ALL_HEROES
        },
        { headers }
      );
      return response.data.data.constants.heroes;
    } catch (error) {
      console.error("Error fetching heroes:", error);
      return [];
    }
  }
  
  public static async getHeroIdByName(heroName: string) {
    const heroes = await StratzInteractor.getAllHeroes();
    const hero = heroes.find((h: any) => h.shortName === heroName.toLowerCase());
    return hero ? hero : null;
  }

  public static async getHeroById(heroId: number): Promise<string> {
    try {
      const headers = {
        Authorization: `Bearer ${TOKEN}`
      };
      const response = await axios.post(
        API_URL,
        {
          query: GET_HERO_BY_ID,
          variables: { heroId, matchLimit: 0 }
        },
        { headers }
      );
      return response.data.data?.heroStats?.heroVsHeroMatchup?.advantage[0];
    } catch (error) {
      console.error("Error fetching heroes:", error);
      return "";
    }
  }

  public static async getMetaWeek(medal: string){
    try {
      const headers = {
        Authorization: `Bearer ${TOKEN}`
      };
      const response = await axios.post(
        API_URL,
        {
          query: GET_META_HEROES,
          variables: { positionIds: null, bracketIds: medal  }
        },
        { headers }
      );
      return response.data.data?.heroStats?.winWeek;
    } catch (error) {
      console.error("Error fetching heroes:", error);
      return "";
    }
  }

   // Função de comparação para a classificação
   public static comparPorcentWin(a: any, b: any) {
    const porcentWinA = (a.winCount / a.matchCount) * 100;
    const porcentWinB = (b.winCount / b.matchCount) * 100;
  
    return porcentWinB - porcentWinA || a.heroId - b.heroId;
  }
}
