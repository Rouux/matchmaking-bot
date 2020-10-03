import { DiscordClient } from "../core/discord/classes/discord-client";
import { DiscordEvent } from "../core/discord/classes/discord-event";
import { LoggerService } from "../core/utils/logger/logger-service";

export class VoiceStateUpdateEvent extends DiscordEvent {
	protected async assignEventsToClient(client: DiscordClient): Promise<void> {
		client.on(`joinVoiceChannel`, (voiceChannel, member) => {
			LoggerService.INSTANCE.info({
				context: `Event - Join Voice Channel`,
				message: `${member.user.tag} joined the channel ${voiceChannel.name} !`,
			});
			// @todo : Later on, use firebase to count the numbers of players who joined
		});
	}
}
