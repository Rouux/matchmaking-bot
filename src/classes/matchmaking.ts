import { TextChannel, VoiceChannel } from "discord.js";

export type MatchmakingOptions = {
	game: string;
	size: number;
	locale: string;
};

export class Matchmaking {
	public options: MatchmakingOptions;

	public id: string;

	public voiceChannel: VoiceChannel;

	public textChannel: TextChannel;

	constructor(options: MatchmakingOptions) {
		this.options = options;
	}
}
