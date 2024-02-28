import { gql } from "graphql-tag";

const GET_HERO_BY_ID = `
query GetHeroMatchUps($heroId: Short!, $matchLimit: Int!, $bracketBasicIds: [RankBracketBasicEnum]) {
        heroStats {
                heroVsHeroMatchup(
                    heroId: $heroId

                    matchLimit: $matchLimit
                    bracketBasicIds: $bracketBasicIds
                ) {
                advantage {
                    heroId
                    matchCountWith
                    matchCountVs
                with {
                        heroId2
                        matchCount
                        winCount
                        synergy
                        winsAverage
                    }
                vs {
                    heroId2
                    matchCount
                    winCount
                    synergy
                    winsAverage
                }
            }
        }
    }
}
`;

const GET_ALL_HEROES = `
query {
    constants {
        heroes {
            id
            name
            displayName
            shortName
            stats {
                primaryAttribute
            }
        }
    }
}
`;

export {
    GET_HERO_BY_ID, 
    GET_ALL_HEROES
};
