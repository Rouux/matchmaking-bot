import { TextChannel, VoiceChannel } from "discord.js";
import { UnknownObject } from "src/core/utils/types";

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

	public documentId: string;

	public voiceChannel: VoiceChannel;

	public textChannel: TextChannel;

	constructor(options: GameOptions) {
		this.name = options.name || ``;
		this.locale = options.locale || `EN`;
		this.size = options.size || 2;
		this.description = options.description || ``;
	}
}
