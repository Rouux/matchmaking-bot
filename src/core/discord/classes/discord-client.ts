import { IDiscordClientOptions } from "../interfaces/discord-client-options-interface";
import { DiscordBaseClient } from "./discord-base-client";

export class DiscordClient extends DiscordBaseClient {
	private _options: IDiscordClientOptions = {};

	constructor(options?: IDiscordClientOptions) {
		super(options);
		if (options) this._options = options;
	}

	public getOption<K extends keyof IDiscordClientOptions>(
		key: K
	): IDiscordClientOptions[K] {
		return this._options[key];
	}
}
