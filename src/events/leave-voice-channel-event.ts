import { VoiceChannel } from 'discord.js';
import { MatchmakingEvent } from "../classes/matchmaking-event";
import { DiscordClient } from "../core/discord/classes/discord-client";
import { LoggerService } from "../core/utils/logger/logger-service";

export class VoiceStateUpdateEvent extends MatchmakingEvent {
	protected async assignEventsToClient(client: DiscordClient): Promise<void> {
		client.on(`leaveVoiceChannel`, (voiceChannel, member) => {
			LoggerService.INSTANCE.info({
				context: `Event - Leave Voice Channel`,
				message: `${member.user.tag} left the channel ${voiceChannel.name} !`,
			});
			const [locale, id] = voiceChannel.name.split(`-`);
			if (!locale || !id) return;
			if (this._isVoiceChannelEmpty(voiceChannel)) {
				this._logInfoEmptyChannel(voiceChannel);
				this.matchmakingService.deleteLobby(locale, id);
			}
		});
	}

	private _logInfoEmptyChannel(voiceChannel: VoiceChannel) {
		LoggerService.INSTANCE.info({
			context: `Event - Leave Voice Channel`,
			message: `They is no more member in the channel ${voiceChannel.name} !`,
		});
	}

	private _isVoiceChannelEmpty(voiceChannel: VoiceChannel) {
		return voiceChannel.members.size === 0;
	}
}
