export type LobbyOptions = {
	name: string;
	size: number;
	locale: string;
	description: string;
};

export type LobbyChannels = {
	categoryChannel: string;
	voiceChannel: string;
	textChannel: string;
};

export class Lobby {
	public readonly name: string;

	public readonly size: number;

	public readonly locale: string;

	public readonly description: string;

	public documentId = ``;

	public players = 0;

	public channels!: LobbyChannels;

	public role: string;

	public guild: string;

	constructor(options: LobbyOptions) {
		this.name = options.name || ``;
		this.locale = options.locale || `EN`;
		this.size = options.size || 2;
		this.description = options.description || ``;
	}
}
