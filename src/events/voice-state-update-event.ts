import { DiscordEventEmitterService } from "../core/discord/services/discord-event-emitter-service";
import { DiscordClient } from "../core/discord/classes/discord-client";
import { DiscordEvent } from "../core/discord/classes/discord-event";

export class VoiceStateUpdateEvent extends DiscordEvent {
	protected async assignEventsToClient(client: DiscordClient): Promise<void> {
		client.on(`voiceStateUpdate`, (oldvoiceChannel, newVoiceState) => {
			if (oldvoiceChannel.channel && oldvoiceChannel.member) {
				DiscordEventEmitterService.INSTANCE.emit(
					`leaveVoiceChannel`, oldvoiceChannel.channel, oldvoiceChannel.member,
				);
			}

			if (newVoiceState.channel && newVoiceState.member)
				DiscordEventEmitterService.INSTANCE.emit(
					`joinVoiceChannel`, newVoiceState.channel, newVoiceState.member,
				);
		});
	}
}
