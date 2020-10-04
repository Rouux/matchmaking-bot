import { CategoryChannel, Guild, Role, TextChannel, VoiceChannel } from "discord.js";
import { Lobby, LobbyChannels, LobbyOptions } from "../classes/models/lobby";

export function buildLobby(options: LobbyOptions): Lobby {
	return new Lobby(options);
}

export async function createChannels(
	guild: Guild,
	role: Role,
	locale: string,
	id: string,
	voiceSlots = -1,
): Promise<LobbyChannels> {
	const parent = await createCategoryChannel(guild, locale, id, role);
	const textChannel = await createTextChannel(guild, locale, id, parent);
	const voiceChannel = await createVoiceChannel(guild, locale, id, parent, voiceSlots);
	return {
		categoryChannel: parent.id,
		textChannel: textChannel.id,
		voiceChannel: voiceChannel.id,
	};
}

// eslint-disable-next-line max-lines-per-function
async function createCategoryChannel(
	guild: Guild,
	locale: string,
	id: string,
	role: Role,
): Promise<CategoryChannel> {
	return guild.channels.create(`${locale}-${id}`, {
		type: `category`,
		position: 999,
		permissionOverwrites: [
			{
				type: `role`,
				id: role.id,
				allow: [`VIEW_CHANNEL`, `CONNECT`, `READ_MESSAGE_HISTORY`],
			},
		],
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
		permissionOverwrites: [
			...parent.permissionOverwrites.array(),
			{
				type: `role`,
				id: guild.roles.everyone,
				deny: [`VIEW_CHANNEL`],
			},
		],
	});
}

// eslint-disable-next-line max-lines-per-function
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
		permissionOverwrites: [
			...parent.permissionOverwrites.array(),
			{
				type: `role`,
				id: guild.roles.everyone,
				deny: [`CONNECT`],
			},
		],
	});
}
