import { TextChannel, VoiceChannel } from "discord.js";

export type GameOptions = {
	name: string;
	size: number;
	locale: string;
	description: string;
};

export class Game {
	public readonly name: string;

	public readonly size: number;

	public readonly locale: string;

	public readonly description: string;

	private id: string;

	private voiceChannel: VoiceChannel;

	private textChannel: TextChannel;

	constructor(options: GameOptions) {
		this.name = options.name || ``;
		this.locale = options.locale || `EN`;
		this.size = options.size || 2;
		this.description = options.description || ``;
	}
}
