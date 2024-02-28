import axios from "axios";
import {GET_ALL_HEROES, GET_HERO_BY_ID} from "./stratzQuery";
const API_URL = "https://api.stratz.com/graphql";
const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJTdWJqZWN0IjoiZDkzOTNmNWUtZWY0Yy00ZmQ4LWJiNWUtMjBjZGJlNWI0M2Q5IiwiU3RlYW1JZCI6IjcyMTgxNzQ5IiwibmJmIjoxNzAyNTE4MjkzLCJleHAiOjE3MzQwNTQyOTMsImlhdCI6MTcwMjUxODI5MywiaXNzIjoiaHR0cHM6Ly9hcGkuc3RyYXR6LmNvbSJ9.-o3j1zlt8Kiu4xbjGLDymqC_3I1wb9SMqwL_aiTupdA";

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
}
