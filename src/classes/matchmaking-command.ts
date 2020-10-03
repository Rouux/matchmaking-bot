import { DiscordCommand } from "../core/discord/classes/discord-command";
import { MatchmakingService } from "../services/matchmaking-service";

const SPLIT_CHARACTERS = [`/`, `,`, `-`];

export abstract class MatchmakingCommand extends DiscordCommand {
	private static _matchmakingService = new MatchmakingService();

	protected get matchmakingService(): MatchmakingService {
		return MatchmakingCommand._matchmakingService;
	}

	protected splitArguments(
		source: string[],
		splitChar: string,
		max = 0,
	): string[] {
		const result: string[] = [``];
		source.forEach(value => {
			if ((max === 0 || result.length < max) && value === splitChar)
				result.push(``);
			else result[result.length - 1] += ` ${value}`;
		});

		return result.map(val => val.trim());
	}

	protected autoDetectSplitCharacter(
		source: string[],
		indexToCheckFor = 1,
	): string | undefined {
		return SPLIT_CHARACTERS.find(char => source[indexToCheckFor] === char);
	}
}
