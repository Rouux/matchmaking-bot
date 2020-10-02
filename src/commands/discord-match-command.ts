import { Message } from "discord.js";
import { LOCALES } from "../utils/constants";
import { DiscordCommand } from "../core/discord/classes/discord-command";

const SPLIT_CHARACTERS = [`/`, `,`, `-`];

export class DiscordMatchCommand extends DiscordCommand {
	constructor() {
		super(`find`, {
			description: `Find a lobby`,
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
		const formatedArgs = this._buildArguments(args, splitChar, 2);
		const result = this._request(formatedArgs);
		return message.channel.send(result);
	}

	private _request([locale, game]: string[]): string {
		if (!LOCALES.includes(locale.toUpperCase()))
			return this.usageError(this, `The selected locale is WRONG`);

		const matchmaking = {
			locale: locale.toUpperCase(),
			game,
		};

		return `\`\`\` ${JSON.stringify(matchmaking, undefined, 2)} \`\`\``;
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
