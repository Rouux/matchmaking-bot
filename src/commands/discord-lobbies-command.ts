import { Message } from "discord.js";
import { Lobby } from "../classes/lobby";
import { MatchmakingCommand } from "../classes/matchmaking-command";

export class DiscordFindCommand extends MatchmakingCommand {
	constructor() {
		super(`all`, {
			description: `Find all`,
		});
	}

	protected async handleCommand(message: Message): Promise<Message> {
		const result = await this._request();
		return message.channel.send(result);
	}

	private async _request(): Promise<string> {
		const lobbies = await this.matchmakingService.all();
		const lobbiesDisplayList = this._lobbiesDisplay(lobbies);

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
