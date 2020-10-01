import { Message } from "discord.js";
import { DiscordCommand } from "../core/discord/classes/discord-command";

export class DiscordCooldownTestCommand extends DiscordCommand {
	constructor() {
		super(`cooldown`, {
			aliases: [`cd`],
			description: `An easy way to test the anti-spam cooldown (10)`,
			cooldown: 10,
		});
	}

	protected async handleCommand(message: Message): Promise<void> {
		await message.channel.send(`You cannot use this command for another 10s !`);
	}
}
