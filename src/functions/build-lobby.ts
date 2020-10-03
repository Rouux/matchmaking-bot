import { CategoryChannel, Guild, TextChannel, VoiceChannel } from "discord.js";
import { Lobby, LobbyChannels, LobbyOptions } from "../classes/models/lobby";

export async function buildLobby(
	options: LobbyOptions,
	guild?: Guild,
	addChannels = true
): Promise<Lobby> {
	const lobby = new Lobby(options);
	if (guild && addChannels) lobby.channels = await createChannels(guild);
	return lobby;
}

async function createChannels(guild: Guild): Promise<LobbyChannels> {
	const id = Date.now();
	const categoryChannel = await createCategoryChannel(guild, id);
	const textChannel = await createTextChannel(guild, id, categoryChannel);
	const voiceChannel = await createVoiceChannel(guild, id, categoryChannel);
	return {
		categoryChannel: categoryChannel.id,
		textChannel: textChannel.id,
		voiceChannel: voiceChannel.id,
	};
}

async function createCategoryChannel(
	guild: Guild,
	id: number
): Promise<CategoryChannel> {
	return guild.channels.create(`Category-${id}`, {
		type: `category`,
		position: 999,
	});
}

async function createTextChannel(
	guild: Guild,
	id: number,
	parent: CategoryChannel
): Promise<TextChannel> {
	return guild.channels.create(`Text-${id}`, {
		type: `text`,
		parent,
	});
}

async function createVoiceChannel(
	guild: Guild,
	id: number,
	parent: CategoryChannel
): Promise<VoiceChannel> {
	return guild.channels.create(`Voice-${id}`, {
		type: `voice`,
		parent,
	});
}
