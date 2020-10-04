import _ from "lodash";
import { Guild, Role } from "discord.js";
import { buildLobby, createChannels } from "../functions/build-lobby";
import { LoggerService } from "../core/utils/logger/logger-service";
import { Lobby, LobbyChannels, LobbyOptions } from "../classes/models/lobby";
import { FirebaseService } from "../firebase/firebase-service";
import { BaseDiscord } from "../core/base-discord";

export class MatchmakingService extends BaseDiscord {
	// eslint-disable-next-line max-len
	public async findLobby(locale: string, documentId: string): Promise<Lobby | undefined> {
		LoggerService.INSTANCE.debug({
			context: `MatchmakingService::findLobby`,
			message: `locale: ${locale}, documentId: ${documentId}`,
		});

		return FirebaseService.getLobbyByLocaleAndId(locale, documentId);
	}

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
				LoggerService.INSTANCE.info({
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
		await this._deleteRole(lobby);
		await this._deleteChannels(lobby.channels);
		LoggerService.INSTANCE.info({
			context: `MatchmakingService::deleteLobby`,
			message: `Lobby succesfully deleted @${id}`,
		});
		return FirebaseService.deleteLobby(lobby);
	}

	private async _deleteRole(lobby: Lobby): Promise<void> {
		const guild = await this.client.guilds.fetch(lobby.guild);
		await (await guild.roles.fetch(lobby.role))?.delete();
	}

	private async _deleteChannels({
		categoryChannel,
		textChannel,
		voiceChannel,
	}: LobbyChannels): Promise<void> {
		// Making sure channels do not move around too much using this order
		await (await this.client.channels.fetch(voiceChannel)).delete();
		await (await this.client.channels.fetch(textChannel)).delete();
		await (await this.client.channels.fetch(categoryChannel)).delete();
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
		return this.client.guilds.fetch(hostGuild.guildId);
	}
}
