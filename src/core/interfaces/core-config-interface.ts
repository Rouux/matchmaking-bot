import { IDiscordConfig } from "../discord/interfaces/discord-config-interface";
import { ILoggerTypes } from "../utils/logger/logger-interface";

export interface ICoreConfig extends IDiscordConfig {
	root: string;
	logger?: ILoggerTypes;
}
