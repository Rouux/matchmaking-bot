import { IDiscordClientOptions } from "./discord-client-options-interface";

export interface IDiscordConfig {
	root: string;
	discordToken: string;
	prefix: string;
	eventsPath?: string;
	commandsPath?: string;
	client?: IDiscordClientOptions;
}
