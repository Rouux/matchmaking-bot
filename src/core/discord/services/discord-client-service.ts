import { ClientOptions } from "discord.js";
import _ from "lodash";
import { DiscordClient } from "../classes/discord-client";

export class DiscordClientService {
	private static _instance: DiscordClientService;

	private _client: DiscordClient | undefined = undefined;

	public static get INSTANCE(): DiscordClientService {
		if (_.isNil(DiscordClientService._instance))
			DiscordClientService._instance = new DiscordClientService();

		return DiscordClientService._instance;
	}

	private _clientOptions: ClientOptions = {};

	public async init(clientOptions?: ClientOptions): Promise<void> {
		if (clientOptions) this._clientOptions = clientOptions;
	}

	private _createClient(): DiscordClient {
		this._client = new DiscordClient(this._clientOptions);

		return this._client;
	}

	public get client(): DiscordClient {
		if (_.isNil(this._client)) return this._createClient();
		return this._client;
	}
}
