import { ClientOptions } from "discord.js";

export interface IDiscordClientOptions extends ClientOptions {
	owner?: string;
}
