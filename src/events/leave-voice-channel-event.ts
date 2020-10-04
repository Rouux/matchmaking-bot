import { GuildMember, VoiceChannel } from "discord.js";
import { MatchmakingEvent } from "../classes/matchmaking-event";
import { DiscordClient } from "../core/discord/classes/discord-client";
import { LoggerService } from "../core/utils/logger/logger-service";

export class LeaveVoiceChannelEvent extends MatchmakingEvent {
	protected async assignEventsToClient(client: DiscordClient): Promise<void> {
		client.on(`leaveVoiceChannel`, async (voiceChannel, member) => {
			this._logDebugUserLeft(member, voiceChannel);
			const [locale, id] = voiceChannel.name.split(`-`);
			if (!locale || !id) return;
			if (this._isChannelEmpty(voiceChannel)) {
				this._logInfoEmptyChannel(voiceChannel);
				await this.matchmakingService.deleteLobby(locale, id);
			} else {
				await this.matchmakingService.playerLeftLobby(locale, id);
			}
		});
	}

	private _logDebugUserLeft(member: GuildMember, voiceChannel: VoiceChannel) {
		LoggerService.INSTANCE.debug({
			context: `Event - Leave Voice Channel`,
			message: `${member.user.tag} left the channel ${voiceChannel.name} !`,
		});
	}

	private _logInfoEmptyChannel(voiceChannel: VoiceChannel) {
		LoggerService.INSTANCE.debug({
			context: `Event - Leave Voice Channel`,
			message: `They is no more member in the channel ${voiceChannel.name} !`,
		});
	}

	private _isChannelEmpty(channel: VoiceChannel) {
		return channel.members.size === 0;
	}
}
