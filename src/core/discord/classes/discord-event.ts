import { BaseDiscord } from '../../base-discord';
import { DiscordClient } from "./discord-client";

export abstract class DiscordEvent extends BaseDiscord {
	public async buildEventsForClient(client: DiscordClient): Promise<void> {
		return this.assignEventsToClient(client);
	}

	protected abstract async assignEventsToClient(
		client: DiscordClient
	): Promise<void>;
}
