import { DiscordClient } from "../core/discord/classes/discord-client";
import { DiscordEvent } from "../core/discord/classes/discord-event";
import { LoggerService } from "../core/utils/logger/logger-service";

export class DiscordReadyEvent extends DiscordEvent {
	protected async assignEventsToClient(client: DiscordClient): Promise<void> {
		client.on(`ready`, () => {
			LoggerService.INSTANCE.info({
				context: `Event - Ready`,
				message: `Bot is ready to go !`,
			});
		});
	}
}
