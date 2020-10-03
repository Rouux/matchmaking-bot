import { Guild } from "discord.js";
import { buildLobby, createChannels } from "../functions/build-lobby";
import { DiscordClientService } from "../core/discord/services/discord-client-service";
import { LoggerService } from "../core/utils/logger/logger-service";
import { Lobby, LobbyOptions } from "../classes/models/lobby";
import { FirebaseService } from "../firebase/firebase-service";

export class MatchmakingService {
	public async findLobbies({ locale, name }: Partial<Lobby>): Promise<Lobby[]> {
		LoggerService.INSTANCE.debug({
			context: `MatchmakingService::findLobbiesByLocalAndName`,
			message: `locale: ${locale}, name: ${name}`,
		});
		const lobbies = await FirebaseService.getLobbiesByLocale(locale);

		return lobbies.filter(lobby => lobby.name === name);
	}

	public async createLobby(options: LobbyOptions): Promise<Lobby | undefined> {
		const guild = await this.getAvailableGuild();
		if (!guild) return undefined;
		const lobby = await FirebaseService.createLobby(buildLobby(options));
		const { locale, documentId, size } = lobby;
		lobby.channels = await createChannels(guild, locale, documentId, size);
		FirebaseService.updateLobby(lobby);
		LoggerService.INSTANCE.debug({
			context: `MatchmakingService::createLobby`,
			message: `Lobby succesfully created @${documentId}`,
		});
		return lobby;
	}

	public async deleteLobby(
		locale: string,
		id: string,
	): Promise<Lobby | undefined> {
		const lobby = await FirebaseService.getLobbyByLocaleAndId(locale, id);
		if (!lobby) return undefined;
		const { client } = DiscordClientService.INSTANCE;
		const { categoryChannel, textChannel, voiceChannel } = lobby.channels;
		// Making sure channels do not move around too much using this order
		await (await client.channels.fetch(voiceChannel)).delete();
		await (await client.channels.fetch(textChannel)).delete();
		await (await client.channels.fetch(categoryChannel)).delete();
		return FirebaseService.deleteLobby(lobby);
	}

	private async getAvailableGuild(): Promise<Guild | undefined> {
		const hostGuild = await FirebaseService.getAvailableHostGuild();
		if (!hostGuild || !hostGuild.guildId) return undefined;
		return DiscordClientService.INSTANCE.client.guilds.fetch(hostGuild.guildId);
	}
}
