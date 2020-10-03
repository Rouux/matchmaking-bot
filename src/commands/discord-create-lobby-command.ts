import { Message } from "discord.js";
import _ from "lodash";
import { LOCALES } from "../utils/constants";
import { MatchmakingCommand } from "../classes/matchmaking-command";

export class DiscordCreateLobbyCommand extends MatchmakingCommand {
	constructor() {
		super(`create`, {
			aliases: [`cl`],
			description: `Create a lobby`,
		});
	}

	protected async handleCommand(
		message: Message,
		args: string[]
	): Promise<Message> {
		const splitChar = this.autoDetectSplitCharacter(args);
		if (!splitChar)
			return this.sendUsageError(
				message,
				this,
				`The split character was not found !`
			);
		const formatedArgs = this.splitArguments(args, splitChar, 4);
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

		const lobby = await this.matchmakingService.createLobby({
			locale,
			name,
			size: sizeAsNumber,
			description: description || ``,
		});
		if (!lobby) return `Sadly no slot is available at the moment :(`;
		return `The lobby for ${lobby.name} was made.`;
	}
}
