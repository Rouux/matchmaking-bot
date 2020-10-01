import _ from "lodash";
import path from "path";
import { DiscordService } from "./discord/discord-service";
import { ICoreConfig } from "./interfaces/core-config-interface";
import langs from "./utils/langs";
import { LoggerService } from "./utils/logger/logger-service";

export class CoreService {
	private static _instance: CoreService;

	public static get INSTANCE(): CoreService {
		if (_.isNil(CoreService._instance))
			CoreService._instance = new CoreService();

		return CoreService._instance;
	}

	public async start(config: ICoreConfig): Promise<void> {
		const {
			root,
			langsPath = config.langsPath || path.join(root, `langs`),
			locale,
			logger,
		} = config;

		return Promise.resolve() // Just to keep each init lined up
			.then(() => langs.init(langsPath, locale))
			.then(() => LoggerService.INSTANCE.init(logger))
			.then(() => DiscordService.INSTANCE.start(config))
			.then(() => {
				LoggerService.INSTANCE.success({
					context: `CoreService`,
					message: `All the services started properly.`,
				});
			})
			.catch(err => {
				const error = err instanceof Error ? err : new Error(err);
				LoggerService.INSTANCE.error({
					context: `CoreService`,
					message: `At least one service couldn't start, reason : \n${
						error.stack ? error.stack : error.message
					}`,
				});

				return Promise.reject(error);
			});
	}
}
