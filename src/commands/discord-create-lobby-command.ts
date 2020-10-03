import { Message } from "discord.js";
import _ from "lodash";
import { LOCALES } from "../utils/constants";
import { MatchmakingCommand } from "../classes/matchmaking-command";

export class DiscordCreateLobbyCommand extends MatchmakingCommand {
	constructor() {
		super(`create`, {
			aliases: [`c`],
			description: `Create a lobby`,
			usage: `!create \`<lang>\` - \`<name>\` - \`<size>\` - \`<description?>\``,
			cooldown: 10,
		});
	}

	protected async handleCommand(message: Message, args: string[]): Promise<Message> {
		const splitChar = this.autoDetectSplitCharacter(args);
		if (!splitChar)
			return this.sendUsageError(message, `The split character was not found !`);

		const formatedArgs = this.splitArguments(args, splitChar, 4);
		const result = await this._request(formatedArgs);
		return message.channel.send(result);
	}

	private async _request([locale, name, size, description]: string[]): Promise<string> {
		locale = locale.toUpperCase();
		if (!LOCALES.includes(locale.toUpperCase()))
			return this.usageError(`The given locale is WRONG`);

		const sizeAsNumber = await this._getValidSize(size);
		if (typeof sizeAsNumber === `string`) return sizeAsNumber;

		const options = { locale, name, size: sizeAsNumber, description };
		const lobby = await this.matchmakingService.createLobby(options);
		if (!lobby) return `Sadly no slot is available at the moment :(`;

		return `The lobby for ${lobby.name} was made.`;
	}

	private async _getValidSize(size: string): Promise<number | string> {
		const sizeAsNumber = Number.parseInt(size, 10);
		if (_.isNaN(sizeAsNumber))
			return this.usageError(`The given size is not valid number`);

		const { min, max } = MatchmakingCommand.SIZE_RANGE;
		if (sizeAsNumber < min || sizeAsNumber > max)
			return this.usageError(`The given size is out of range : [${min}, ${max}]`);

		return sizeAsNumber;
	}
}
