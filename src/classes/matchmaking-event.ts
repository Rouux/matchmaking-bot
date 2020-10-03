import { DiscordEvent } from "../core/discord/classes/discord-event";
import { MatchmakingService } from "../services/matchmaking-service";

export abstract class MatchmakingEvent extends DiscordEvent {
	private static _matchmakingService = new MatchmakingService();

	protected get matchmakingService(): MatchmakingService {
		return MatchmakingEvent._matchmakingService;
	}
}
