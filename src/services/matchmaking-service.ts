import _ from "lodash";
import { Guild, Role } from "discord.js";
import { DiscordClient } from "src/core/discord/classes/discord-client";
import { buildLobby, createChannels } from "../functions/build-lobby";
import { DiscordClientService } from "../core/discord/services/discord-client-service";
import { LoggerService } from "../core/utils/logger/logger-service";
import { Lobby, LobbyChannels, LobbyOptions } from "../classes/models/lobby";
import { FirebaseService } from "../firebase/firebase-service";

export class MatchmakingService {
	public async findLobbies({ locale, name }: Partial<Lobby>): Promise<Lobby[]> {
		LoggerService.INSTANCE.debug({
			context: `MatchmakingService::findLobbies`,
			message: `locale: ${locale}, name: ${name}`,
		});
		const lobbies = await FirebaseService.getLobbiesByLocale(locale);

		return lobbies.filter((lobby) => lobby.name === name);
	}

	public async createLobby(options: LobbyOptions): Promise<Lobby | undefined> {
		const guild = await this._getAvailableGuild();
		if (!guild) return undefined;
		return FirebaseService.createLobby(buildLobby(options))
			.then((lobby) => this._setServerContentOnLobby(lobby, guild))
			.then((lobby) => FirebaseService.updateLobby(lobby))
			.then((lobby) => {
				LoggerService.INSTANCE.debug({
					context: `MatchmakingService::createLobby`,
					message: `Lobby succesfully created @${lobby.documentId}`,
				});
				return lobby;
			});
	}

	private async _setServerContentOnLobby(lobby: Lobby, guild: Guild): Promise<Lobby> {
		const { locale, documentId, size } = lobby;
		const role = await this._createRole(guild, locale, documentId);
		lobby.channels = await createChannels(guild, role, locale, documentId, size);
		lobby.role = role.id;
		lobby.guild = guild.id;
		return lobby;
	}

	private async _createRole(
		guild: Guild,
		locale: string,
		documentId: string,
	): Promise<Role> {
		return guild.roles.create({
			data: {
				name: `${locale}-${documentId}`,
				color: [_.random(255, false), _.random(255, false), _.random(255, false)],
				mentionable: false,
			},
		});
	}

	public async deleteLobby(locale: string, id: string): Promise<Lobby | undefined> {
		const lobby = await FirebaseService.getLobbyByLocaleAndId(locale, id);
		if (!lobby) return undefined;
		const { client } = DiscordClientService.INSTANCE;
		await this._deleteRole(client, lobby);
		await this._deleteChannels(client, lobby.channels);
		LoggerService.INSTANCE.debug({
			context: `MatchmakingService::createLobby`,
			message: `Lobby succesfully deleted @${id}`,
		});
		return FirebaseService.deleteLobby(lobby);
	}

	private async _deleteRole(client: DiscordClient, lobby: Lobby): Promise<void> {
		const guild = await client.guilds.fetch(lobby.guild);
		await (await guild.roles.fetch(lobby.role))?.delete();
	}

	private async _deleteChannels(
		client: DiscordClient,
		{ categoryChannel, textChannel, voiceChannel }: LobbyChannels,
	): Promise<void> {
		// Making sure channels do not move around too much using this order
		await (await client.channels.fetch(voiceChannel)).delete();
		await (await client.channels.fetch(textChannel)).delete();
		await (await client.channels.fetch(categoryChannel)).delete();
	}

	public async playerJoinLobby(locale: string, id: string): Promise<Lobby | undefined> {
		const lobby = await FirebaseService.getLobbyByLocaleAndId(locale, id);
		if (!lobby) return undefined;
		lobby.players += 1;
		return FirebaseService.updateLobby(lobby);
	}

	public async playerLeftLobby(locale: string, id: string): Promise<Lobby | undefined> {
		const lobby = await FirebaseService.getLobbyByLocaleAndId(locale, id);
		if (!lobby) return undefined;
		lobby.players -= 1;
		return FirebaseService.updateLobby(lobby);
	}

	private async _getAvailableGuild(): Promise<Guild | undefined> {
		const hostGuild = await FirebaseService.getAvailableHostGuild();
		if (!hostGuild || !hostGuild.guildId) return undefined;
		return DiscordClientService.INSTANCE.client.guilds.fetch(hostGuild.guildId);
	}
}
