import { Message } from "discord.js";
import _ from "lodash";
import { MatchmakingOptions } from "../classes/matchmaking";
import { DiscordCommand } from "../core/discord/classes/discord-command";

const SPLIT_CHARACTERS = [`/`, `,`];
const SIZE_RANGE = { min: 2, max: 99 };

export class DiscordMatchCommand extends DiscordCommand {
	constructor() {
		super(`match`, {
			description: `Find or make a lobby`,
		});
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
		const formatedArgs = this._buildArguments(args, splitChar);
		if (formatedArgs.length < 2)
			return this.sendUsageError(
				message,
				this,
				`You are forgetting an option !`
			);
		const size = Number.parseInt(formatedArgs[1], 10);
		if (_.isNaN(size) || size < SIZE_RANGE.min || size > SIZE_RANGE.max)
			return this.sendUsageError(
				message,
				this,
				`The size is not a valid number !`
			);
		const matchmaking: MatchmakingOptions = {
			game: formatedArgs[0],
			size,
			locale: formatedArgs[2],
		};

		return message.channel.send(
			`\`\`\` ${JSON.stringify(matchmaking, undefined, 2)} \`\`\``
		);
	}

	private _buildArguments(source: string[], splitChar: string): string[] {
		const result: string[] = [];
		result.push(``);
		let count = 0;
		let str;
		do {
			str = source.shift();
			if (str === splitChar) {
				count += 1;
				result.push(``);
			} else if (str !== undefined) {
				result[count] += ` ${str}`;
			}
		} while (str);

		return result.map(val => val.trim());
	}

	private _autoDetectSplitCharacter(source: string[]): string | undefined {
		return SPLIT_CHARACTERS.find(char => this._countEvery(char, source) === 2);
	}

	private _countEvery(element: string, target: string[]): number {
		return target.filter(val => val === element).length;
	}
}
