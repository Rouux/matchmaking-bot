import _ from "lodash";
import { DiscordService } from "./discord/discord-service";
import { ICoreConfig } from "./interfaces/core-config-interface";
import { LoggerService } from "./utils/logger/logger-service";

export class CoreService {
	private static _instance: CoreService;

	public static get INSTANCE(): CoreService {
		if (_.isNil(CoreService._instance)) CoreService._instance = new CoreService();

		return CoreService._instance;
	}

	public async start(config: ICoreConfig): Promise<void> {
		const { logger } = config;

		return Promise.resolve() // Just to keep each init lined up
			.then(() => LoggerService.INSTANCE.init(logger))
			.then(() => DiscordService.INSTANCE.start(config))
			.then(() => this._logSuccess())
			.catch((err) => Promise.reject(this._logError(err)));
	}

	private _logError(err: string | Error) {
		const error = err instanceof Error ? err : new Error(err);
		LoggerService.INSTANCE.error({
			context: `CoreService`,
			message: `At least one service couldn't start, reason : \n${
				error.stack ? error.stack : error.message
			}`,
		});
		return error;
	}

	private _logSuccess() {
		LoggerService.INSTANCE.success({
			context: `CoreService`,
			message: `All the services started properly.`,
		});
	}
}
