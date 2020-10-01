import { DiscordClient } from "./discord-client";

export abstract class DiscordEvent {
	public async buildEventsForClient(client: DiscordClient): Promise<void> {
		return this.assignEventsToClient(client);
	}

	protected abstract async assignEventsToClient(
		client: DiscordClient
	): Promise<void>;
}
