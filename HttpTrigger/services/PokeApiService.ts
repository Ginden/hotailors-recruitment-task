import {AxiosInstance} from "axios";
import {inject, injectable} from "inversify";
import {COMMON_TYPES} from "../../ioc/commonTypes";
import {ILogger} from "../../commonServices";
import _ = require("lodash");

export interface IPokeApiService {
    getPokemonsAndFilterToMatchType(ids: any[], searchForType: string): Promise<string[]>;
    getPokemon(id: any): Promise<IPokemonData>;
}

export interface IPokemonData {
    name: string;
    types: Array<{
        slot: number,
        type: {
            name: string;
        },
    }>;
}

@injectable()
export class PokeApiService implements IPokeApiService {

    @inject(COMMON_TYPES.ILogger)
    private readonly _logger: ILogger;

    @inject(COMMON_TYPES.POKE_AXIOS)
    private readonly _pokeAxios: AxiosInstance;

    public async getPokemon(id: any): Promise<IPokemonData> {
        this._logger.info(`Fetching pokemon data for id/name=${id}`);
        return (await this._pokeAxios.get<IPokemonData>(`/pokemon/${id}/`)).data;
    }

    public async getPokemonsAndFilterToMatchType(ids: any[], searchForType: string): Promise<string[]> {
        const pokemonData: IPokemonData[] = await Promise.all(ids.map((id) => this.getPokemon(id)));
        this._logger.info(`Retrieved data for ${pokemonData.length} pokemons`);
        return _.chain(pokemonData)
            .filter((pd: IPokemonData) => {
                return pd.types.some(({type}) => type.name === searchForType);
            })
            .map("name")
            .value();
    }
}
