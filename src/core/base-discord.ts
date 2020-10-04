import { Client, Collection, Invite } from "discord.js";

type BotInvites = { [key: string]: Collection<string, Invite> };

export class BaseDiscord {
	private static _client: Client;

	public static setClient(client: Client): void {
		this._client = client;
	}

	public get client(): Client {
		return BaseDiscord._client;
	}

	private static _invites: BotInvites = {};

	public get invites(): BotInvites {
		return BaseDiscord._invites;
	}

	public set invites(invites: BotInvites) {
		BaseDiscord._invites = invites;
	}

	public getThenUpdateInvites(
		key: string,
		invites: Collection<string, Invite>,
	): Collection<string, Invite> {
		const cachedInvites = this.invites[key];
		this.invites[key] = invites;
		return cachedInvites;
	}
}
