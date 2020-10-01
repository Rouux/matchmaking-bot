import { LoggerService } from "../../utils/logger/logger-service";
import { DiscordClient } from "../classes/discord-client";
import { DiscordEvent } from "../classes/discord-event";

export class DiscordLogEvent extends DiscordEvent {
	protected async assignEventsToClient(client: DiscordClient): Promise<void> {
		client
			.on(`debug`, message => {
				LoggerService.INSTANCE.debug({
					context: `Discord`,
					message,
				});
			})
			.on(`warn`, message => {
				LoggerService.INSTANCE.warn({
					context: `Discord`,
					message,
				});
			})
			.on(`error`, ({ message }) => {
				LoggerService.INSTANCE.error({
					context: `Discord`,
					message,
				});
			});
	}
}
