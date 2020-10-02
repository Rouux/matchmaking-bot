import { Message } from "discord.js";
import { Lobby } from "../classes/lobby";
import { LOCALES } from "../utils/constants";
import { MatchmakingCommand } from "../classes/matchmaking-command";

export class DiscordFindCommand extends MatchmakingCommand {
	constructor() {
		super(`find`, {
			description: `Find a lobby`,
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
		const formatedArgs = this.splitArguments(args, splitChar, 2);
		const result = await this._request(formatedArgs);
		return message.channel.send(result);
	}

	private async _request([locale, name]: string[]): Promise<string> {
		locale = locale.toUpperCase();
		if (!LOCALES.includes(locale.toUpperCase()))
			return this.usageError(this, `The selected locale is WRONG`);

		const lobbies = await this.matchmakingService.findLobbies({
			locale,
			name,
		});
		const lobbiesDisplayList = this._lobbiesDisplay(lobbies);
		if (!lobbiesDisplayList || lobbiesDisplayList.length === 0)
			return `No lobby were found with the name "${name}" :(`;
		return `\`\`\`${lobbiesDisplayList}\`\`\``;
	}

	private _lobbiesDisplay(lobbies: Lobby[]) {
		return lobbies
			.map(
				lobby =>
					`[${lobby.locale}] - (${lobby.size}) - ${lobby.name}\n\t\t${lobby.description}`
			)
			.join(`\n`);
	}
}
