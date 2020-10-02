import { LoggerService } from "../core/utils/logger/logger-service";
import { Lobby } from "../classes/lobby";
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
	): Promise<Lobby> {
		LoggerService.INSTANCE.debug({
			context: `MatchmakingService::createLobby`,
			message: `locale: ${locale}, name: ${name}, size: ${size}, description: ${description}`,
		});
		description = description || ``;
		const lobby = await FirebaseService.createLobby(
			new Lobby({ locale, name, size, description })
		);
		LoggerService.INSTANCE.debug({
			context: `MatchmakingService::createLobby`,
			message: `id: ${lobby.documentId}`,
		});
		return lobby;
	}
}
