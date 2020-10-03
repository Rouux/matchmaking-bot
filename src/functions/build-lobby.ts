import { CategoryChannel, Guild, TextChannel, VoiceChannel } from "discord.js";
import { Lobby, LobbyChannels, LobbyOptions } from "../classes/models/lobby";

export function buildLobby(options: LobbyOptions): Lobby {
	return new Lobby(options);
}

export async function createChannels(
	guild: Guild,
	locale: string,
	id: string,
	voiceSlots = -1,
): Promise<LobbyChannels> {
	const parent = await createCategoryChannel(guild, locale, id);
	const textChannel = await createTextChannel(guild, locale, id, parent);
	const voiceChannel = await createVoiceChannel(
		guild, locale, id, parent, voiceSlots,
	);
	return {
		categoryChannel: parent.id,
		textChannel: textChannel.id,
		voiceChannel: voiceChannel.id,
	};
}

async function createCategoryChannel(
	guild: Guild,
	locale: string,
	id: string,
): Promise<CategoryChannel> {
	return guild.channels.create(`${locale}-${id}`, {
		type: `category`,
		position: 999,
	});
}

async function createTextChannel(
	guild: Guild,
	locale: string,
	id: string,
	parent: CategoryChannel,
): Promise<TextChannel> {
	return guild.channels.create(`${locale}-${id}`, {
		type: `text`,
		parent,
	});
}

async function createVoiceChannel(
	guild: Guild,
	locale: string,
	id: string,
	parent: CategoryChannel,
	maxVoiceChannelSlots = -1,
): Promise<VoiceChannel> {
	return guild.channels.create(`${locale}-${id}`, {
		type: `voice`,
		userLimit: maxVoiceChannelSlots !== -1 ? maxVoiceChannelSlots : undefined,
		parent,
	});
}
