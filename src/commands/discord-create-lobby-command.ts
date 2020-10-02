import { Message } from "discord.js";
import _ from "lodash";
import { MatchmakingService } from "../services/matchmaking-service";
import { LOCALES } from "../utils/constants";
import { DiscordCommand } from "../core/discord/classes/discord-command";

const SPLIT_CHARACTERS = [`/`, `,`, `-`];

export class DiscordCreateLobbyCommand extends DiscordCommand {
	private _matchmakingService: MatchmakingService;

	constructor() {
		super(`create`, {
			aliases: [`cl`],
			description: `Create a lobby`,
		});
		this._matchmakingService = new MatchmakingService();
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
		const formatedArgs = this._buildArguments(args, splitChar, 4);
		const result = await this._request(formatedArgs);
		return message.channel.send(result);
	}

	private async _request([locale, name, size, description]: string[]): Promise<
		string
	> {
		locale = locale.toUpperCase();
		if (!LOCALES.includes(locale.toUpperCase()))
			return this.usageError(this, `The given locale is WRONG`);
		const sizeAsNumber = Number.parseInt(size, 10);
		if (_.isNaN(sizeAsNumber))
			return this.usageError(this, `The given size is WRONG`);

		const game = await this._matchmakingService.createGame(
			locale,
			name,
			sizeAsNumber,
			description
		);
		return `The lobby for ${game.name} was made.`;
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
