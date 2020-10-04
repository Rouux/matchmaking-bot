import { Client } from "discord.js";

export class BaseDiscord {
	private static _client: Client;

	public static setClient(client: Client): void {
		this._client = client;
	}

	public get client(): Client {
		return BaseDiscord._client;
	}
}
