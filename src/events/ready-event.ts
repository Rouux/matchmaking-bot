import { DiscordClient } from "../core/discord/classes/discord-client";
import { DiscordEvent } from "../core/discord/classes/discord-event";
import { LoggerService } from "../core/utils/logger/logger-service";

export class ReadyEvent extends DiscordEvent {
	protected async assignEventsToClient(client: DiscordClient): Promise<void> {
		client.on(`ready`, () => {
			LoggerService.INSTANCE.info({
				context: `Event - Ready`,
				message: `Bot is ready to go !`,
			});
		});
		// Load all invites for all guilds and save them to the cache.
		client.guilds.cache.array().forEach((guild) => {
			guild.fetchInvites().then((guildInvites) => {
				this.invites[guild.id] = guildInvites;
			});
		});
	}
}
