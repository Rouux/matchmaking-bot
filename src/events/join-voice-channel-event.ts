import { GuildMember, VoiceChannel } from 'discord.js';
import { MatchmakingEvent } from '../classes/matchmaking-event';
import { DiscordClient } from "../core/discord/classes/discord-client";
import { LoggerService } from "../core/utils/logger/logger-service";

export class JoinVoiceChannelEvent extends MatchmakingEvent {
	protected async assignEventsToClient(client: DiscordClient): Promise<void> {
		client.on(`joinVoiceChannel`, async (voiceChannel, member) => {
			this._logDebugUserJoined(member, voiceChannel);
			const [locale, id] = voiceChannel.name.split(`-`);
			await this.matchmakingService.playerJoinLobby(locale, id);
		});
	}

	private _logDebugUserJoined(member: GuildMember, voiceChannel: VoiceChannel) {
		LoggerService.INSTANCE.debug({
			context: `Event - Join Voice Channel`,
			message: `${member.user.tag} joined the channel ${voiceChannel.name} !`,
		});
	}
}
