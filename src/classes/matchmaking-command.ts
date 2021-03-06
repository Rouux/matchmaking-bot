import { DiscordCommand } from "../core/discord/classes/discord-command";
import { MatchmakingService } from "../services/matchmaking-service";

export abstract class MatchmakingCommand extends DiscordCommand {
	public static readonly SIZE_RANGE = { min: 2, max: 99 };

	public static readonly SPLIT_CHARACTERS = [`/`, `,`, `-`];

	private static _matchmakingService = new MatchmakingService();

	protected get matchmakingService(): MatchmakingService {
		return MatchmakingCommand._matchmakingService;
	}

	protected splitArguments(source: string[], splitChar: string, max = 0): string[] {
		const result: string[] = [``];
		source.forEach((value) => {
			if ((max === 0 || result.length < max) && value === splitChar) result.push(``);
			else result[result.length - 1] += ` ${value}`;
		});

		return result.map((val) => val.trim());
	}

	protected autoDetectSplitCharacter(
		source: string[],
		index = 1,
	): string | undefined {
		return MatchmakingCommand.SPLIT_CHARACTERS.find(
			(char) => source[index] === char,
		);
	}
}
