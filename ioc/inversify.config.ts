import {Container} from "inversify";
import {COMMON_TYPES} from "./commonTypes";
import {AxiosInstance} from "axios";
import axios from "axios";
import {ILogger, Logger} from "../commonServices";
import {IPokeApiService, PokeApiService} from "../HttpTrigger/services/PokeApiService";

const getContainer: (() => Container) = (): Container => {
    const container: Container = new Container();

    container
        .bind<ILogger>(COMMON_TYPES.ILogger)
        .to(Logger)
        .inSingletonScope();

    container
        .bind<IPokeApiService>(COMMON_TYPES.IPOKE_API_SERVICE)
        .to(PokeApiService);

    container
        .bind<AxiosInstance>(COMMON_TYPES.POKE_AXIOS)
        .toConstantValue(axios.create({
            baseURL: `https://pokeapi.co/api/v2/`,
        }));

    return container;
};

export default getContainer;
