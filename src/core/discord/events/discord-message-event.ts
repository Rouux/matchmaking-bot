import { Message } from "discord.js";
import { DiscordCommandService } from "../services/discord-command-service";
import { DiscordConfigService } from "../services/discord-config-service";
import { DiscordClient } from "../classes/discord-client";
import { DiscordEvent } from "../classes/discord-event";

export class DiscordMessageEvent extends DiscordEvent {
	protected async assignEventsToClient(client: DiscordClient): Promise<void> {
		client.on(`message`, async message => {
			await this._onMessage(message);
		});
	}

	private async _onMessage(message: Message): Promise<void> {
		const prefix = DiscordConfigService.INSTANCE.get(`prefix`);
		if (!message.content.startsWith(prefix) || message.author.bot) return;
		const args = message.content.slice(prefix.length).trim().split(/ +/g);
		const callname = args.shift()?.toLowerCase();
		if (!callname) return;
		// eslint-disable-next-line no-use-before-define
		await DiscordCommandService.INSTANCE.call(message, callname, ...args);
	}
}
