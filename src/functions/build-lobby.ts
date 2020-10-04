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
	const name = `${locale}-${id}`;
	const parent = await createCategoryChannel(guild, name, role);
	const textChannel = await createTextChannel(guild, name, parent);
	const voiceChannel = await createVoiceChannel(guild, name, parent, voiceSlots);
	return {
		categoryChannel: parent.id,
		textChannel: textChannel.id,
		voiceChannel: voiceChannel.id,
	};
}

async function createCategoryChannel(
	guild: Guild,
	name: string,
	role: Role,
): Promise<CategoryChannel> {
	return guild.channels.create(name, {
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
	name: string,
	parent: CategoryChannel,
): Promise<TextChannel> {
	return guild.channels.create(name, {
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

async function createVoiceChannel(
	guild: Guild,
	name: string,
	parent: CategoryChannel,
	maxVoiceChannelSlots = -1,
): Promise<VoiceChannel> {
	return guild.channels.create(name, {
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
