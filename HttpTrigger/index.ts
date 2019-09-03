import "reflect-metadata";
import {AzureFunction, Context, HttpRequest} from "@azure/functions";
import getContainer from "../ioc/inversify.config";
import {COMMON_TYPES} from "../ioc/commonTypes";
import {ILogger, Logger} from "../commonServices";
import {Container} from "inversify";
import {IPokeApiService} from "./services/PokeApiService";
import {object, ObjectSchema, string} from "@hapi/joi";
import Joi from "@hapi/joi";

const schema: ObjectSchema = object({
    id: string().regex(/^([0-9]+)(,[0-9]+)+$/i).disallow(""),
    type: string().regex(/^[a-z]+$/i),
}).unknown(false);

const httpTrigger: AzureFunction = async (ctx: Context, req: HttpRequest): Promise<any> => {

    try {
        Joi.assert(req.query, schema);

        const container: Container = getContainer();
        const logger: Logger = container.get<ILogger>(COMMON_TYPES.ILogger) as Logger;
        logger.init(ctx, "1");

        const pokeApiService: IPokeApiService =
            container.get<IPokeApiService>(COMMON_TYPES.IPOKE_API_SERVICE);

        const ids: string[] = (req.query.id || "").split(",");
        const type: string = req.query.type;

        ctx.res = {
            body: await pokeApiService.getPokemonsAndFilterToMatchType(ids, type),
            status: 200,
            headers: {"Content-Type": "application/json"},
        };
    } catch (e) {
        ctx.res = {
            body: {
                message: e.message,
                ...e,
            },
            status: 500,
            headers: {"Content-Type": "application/json"},
        };
    }

    return ctx.res;
};

export default httpTrigger;
