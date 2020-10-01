import _ from "lodash";
import { IDiscordConfig } from "../interfaces/discord-config-interface";

export class DiscordConfigService {
	private static _instance: DiscordConfigService;

	private _config!: IDiscordConfig;

	public static get INSTANCE(): DiscordConfigService {
		if (_.isNil(DiscordConfigService._instance))
			DiscordConfigService._instance = new DiscordConfigService();
		return DiscordConfigService._instance;
	}

	public async init(config: IDiscordConfig): Promise<void> {
		if (!config.discordToken)
			throw new Error(`The discord token is missing from the config !`);
		this._config = config;
	}

	public get<K extends keyof IDiscordConfig>(key: K): IDiscordConfig[K] {
		return this._config[key];
	}

	public get config(): Readonly<IDiscordConfig> {
		return this._config;
	}
}
