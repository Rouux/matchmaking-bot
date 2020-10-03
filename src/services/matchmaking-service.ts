import { CategoryChannel, Guild, TextChannel, VoiceChannel } from "discord.js";
import { DiscordClientService } from "../core/discord/services/discord-client-service";
import { LoggerService } from "../core/utils/logger/logger-service";
import { Lobby, LobbyChannels } from "../classes/models/lobby";
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

	public async createLobby(
		locale: string,
		name: string,
		size: number,
		description?: string
	): Promise<Lobby | undefined> {
		const guild = await this.getAvailableGuild();
		if (!guild) return undefined;
		const lobby = await FirebaseService.createLobby(
			new Lobby({ locale, name, size, description: description || `` })
		);
		lobby.channels = await this.createChannels(lobby, guild);
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

	private async createChannels(
		lobby: Lobby,
		guild: Guild
	): Promise<LobbyChannels> {
		const id = Date.now();
		const categoryChannel = await this.createCategoryChannel(guild, id);
		const textChannel = (
			await this.createTextChannel(guild, id, categoryChannel)
		).id;
		const voiceChannel = (
			await this.createVoiceChannel(guild, id, categoryChannel)
		).id;
		return {
			categoryChannel: categoryChannel.id,
			textChannel,
			voiceChannel,
		};
	}

	private async createCategoryChannel(
		guild: Guild,
		id: number
	): Promise<CategoryChannel> {
		return guild.channels.create(`Category-${id}`, {
			type: `category`,
			position: 999,
		});
	}

	private async createTextChannel(
		guild: Guild,
		id: number,
		parent: CategoryChannel
	): Promise<TextChannel> {
		return guild.channels.create(`Text-${id}`, {
			type: `text`,
			parent,
		});
	}

	private async createVoiceChannel(
		guild: Guild,
		id: number,
		parent: CategoryChannel
	): Promise<VoiceChannel> {
		return guild.channels.create(`Voice-${id}`, {
			type: `voice`,
			parent,
		});
	}
}
