import { Message } from "discord.js";
import { DiscordCommand } from "../core/discord/classes/discord-command";

export class DiscordGuildOnlyTestCommand extends DiscordCommand {
	constructor() {
		super(`guild`, {
			aliases: [`go`, `guildOnly`],
			description: `An easy way to test the 'guildOnly' option`,
			guildOnly: true,
		});
	}

	protected async handleCommand(message: Message): Promise<void> {
		message.channel.send(`You can't do this command in DMs right !?`);
	}
}
