import { Guild } from "discord.js";
import { buildLobby } from "../functions/build-lobby";
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
		const lobby = await FirebaseService.createLobby(
			await buildLobby(options, guild)
		);
		FirebaseService.updateLobby(lobby);
		LoggerService.INSTANCE.debug({
			context: `MatchmakingService::createLobby`,
			message: `Lobby succesfully created @${lobby.documentId}`,
		});
		return lobby;
	}

	private async getAvailableGuild(): Promise<Guild | undefined> {
		const hostGuild = await FirebaseService.getAvailableHostGuild();
		if (!hostGuild) return undefined;
		const guild = await DiscordClientService.INSTANCE.client.guilds.fetch(
			hostGuild.guildId
		);
		return guild;
	}
}
