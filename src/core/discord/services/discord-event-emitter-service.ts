import _ from "lodash";
import { CustomEvents } from "../../interfaces/custom-events-interface";
import { LoggerService } from "../../utils/logger/logger-service";
import { DiscordClientService } from "./discord-client-service";

export class DiscordEventEmitterService {
	private static _instance: DiscordEventEmitterService;

	public static get INSTANCE(): DiscordEventEmitterService {
		if (_.isNil(DiscordEventEmitterService._instance))
			DiscordEventEmitterService._instance = new DiscordEventEmitterService();

		return DiscordEventEmitterService._instance;
	}

	public async emit<K extends keyof CustomEvents>(
		event: K,
		...args: CustomEvents[K]
	): Promise<void>;

	public async emit<S extends string | symbol>(
		event: Exclude<S, keyof CustomEvents>,
		...args: unknown[]
	): Promise<void>;

	public async emit(event: string, ...args: unknown[]): Promise<void> {
		const { client } = DiscordClientService.INSTANCE;
		if (!client) {
			LoggerService.INSTANCE.error({
				context: `DiscordEventEmitterService`,
				message: `Got an undefined client while trying to emit '${event}'`,
			});
			return;
		}
		// Returns true if the event had listeners, false otherwise.
		if (client.emit(event, ...args)) {
			LoggerService.INSTANCE.debug({
				context: `DiscordEventEmitterService`,
				message: `The event '${event}' was emitted`,
			});
		} else {
			LoggerService.INSTANCE.warn({
				context: `DiscordEventEmitterService`,
				message: `The event '${event}' was emitted but has no listener`,
			});
		}
	}
}
