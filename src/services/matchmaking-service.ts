import { LoggerService } from "../core/utils/logger/logger-service";
import { Game } from "../classes/game";
import { FirebaseService } from "../firebase/firebase-service";

export class MatchmakingService {
	public async findGames(locale: string, name: string): Promise<Game[]> {
		LoggerService.INSTANCE.debug({
			context: `MatchmakingService::findGames`,
			message: `locale: ${locale}, name: ${name}`,
		});
		const games = await FirebaseService.getActiveGamesByLocale(locale);

		return games.filter(game => game.name === name);
	}
}
