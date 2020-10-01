import { Message } from "discord.js";
import _ from "lodash";
import { DiscordCommand } from "../core/discord/classes/discord-command";

export class DiscordNotifyCommand extends DiscordCommand {
	constructor() {
		super(`notify`, {
			description: `Be notified about a specific message after x seconds`,
			usage:
				`\`\`\`!notify example message to be reminded of 10\`\`\`` +
				`\nThis command should send a pm with the 'example message to be reminded of' content, 10 seconds after being called` +
				`\nBe aware that the time until notification MUST be at the end`,
			cooldown: 5,
		});
	}

	protected async handleCommand(
		message: Message,
		...args: string[]
	): Promise<unknown> {
		const timeout = this._getTimeout(args);
		if (_.isNaN(timeout)) {
			return this.sendUsageError(
				message,
				this,
				`The time to wait should always be at the end !`
			);
		}
		const content = args.slice(0, args.length - 1).join(` `);
		return this.notify(message.author, timeout, content, {
			noticeChannel: message.channel,
			noticeTimeout: 3,
		}).then(() => message.delete({ timeout: 3 * 1000 }));
	}

	private _getTimeout(args: string[]): number {
		return parseInt(args[args.length - 1], 10);
	}
}
