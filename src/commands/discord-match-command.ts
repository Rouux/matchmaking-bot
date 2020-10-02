import { Message } from "discord.js";
import { Game } from "src/classes/game";
import { MatchmakingService } from "../services/matchmaking-service";
import { LOCALES } from "../utils/constants";
import { DiscordCommand } from "../core/discord/classes/discord-command";

const SPLIT_CHARACTERS = [`/`, `,`, `-`];

export class DiscordMatchCommand extends DiscordCommand {
	private matchmakingService: MatchmakingService;

	constructor() {
		super(`find`, {
			description: `Find a lobby`,
		});
		this.matchmakingService = new MatchmakingService();
	}

	protected async handleCommand(
		message: Message,
		args: string[]
	): Promise<Message> {
		const splitChar = this._autoDetectSplitCharacter(args);
		if (!splitChar)
			return this.sendUsageError(
				message,
				this,
				`The split character was not found !`
			);
		const formatedArgs = this._buildArguments(args, splitChar, 2);
		const result = await this._request(formatedArgs);
		return message.channel.send(result);
	}

	private async _request([locale, game]: string[]): Promise<string> {
		locale = locale.toUpperCase();
		if (!LOCALES.includes(locale.toUpperCase()))
			return this.usageError(this, `The selected locale is WRONG`);

		const games = await this.matchmakingService.findGames(locale, game);
		console.log(JSON.stringify(games, undefined, 2));

		return `\`\`\`${this._gamesAsList(games)}\`\`\``;
	}

	private _gamesAsList(games: Game[]) {
		return games
			.map(g => `[${g.locale}] - (${g.size}) - ${g.name}\n\t\t${g.description}`)
			.join(`, `);
	}

	private _buildArguments(
		source: string[],
		splitChar: string,
		max = 0
	): string[] {
		const result: string[] = [``];
		source.forEach(value => {
			if ((max === 0 || result.length < max) && value === splitChar)
				result.push(``);
			else result[result.length - 1] += ` ${value}`;
		});

		return result.map(val => val.trim());
	}

	private _autoDetectSplitCharacter(source: string[]): string | undefined {
		return SPLIT_CHARACTERS.find(char => source[1] === char);
	}
}
