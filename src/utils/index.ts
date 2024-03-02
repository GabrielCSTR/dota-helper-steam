import fs from 'fs';
const filePathHeroesAltName = "src/data/heroes_names.json";

interface IHeroesAltNames {
    name: string;
    alt_names: []
}

export async function getNameHero(hero_name: string): Promise<IHeroesAltNames>{
    // get heroes alt names
    const heroesAltNames = readFileJson(filePathHeroesAltName);
    const heroName = heroesAltNames.find((altName: IHeroesAltNames) => {
        if(altName.name.toLocaleLowerCase() === hero_name.toLocaleLowerCase()){
            return altName.name
        }
        return altName.alt_names.find((altName: string) => altName.toLocaleLowerCase() === hero_name.toLocaleLowerCase())
    })
    console.log("altName", heroName);
    return heroName
}

export function readFileJson(filePatch: string){
    try {
        const data = fs.readFileSync(filePatch, 'utf-8');
        const JsonData = JSON.parse(data);
        return JsonData
    } catch (err) {
        console.error('Erro ao ler o arquivo JSON:', err);
    }
}