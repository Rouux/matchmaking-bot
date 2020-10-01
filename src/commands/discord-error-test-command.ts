import { Message } from "discord.js";
import { DiscordEventEmitterService } from "../core/discord/services/discord-event-emitter-service";
import { DiscordCommand } from "../core/discord/classes/discord-command";

export class DiscordErrorTestCommand extends DiscordCommand {
	constructor() {
		super(`error`, {
			description: `An easy way to test the commandError event`,
		});
	}

	protected async handleCommand(message: Message): Promise<void> {
		DiscordEventEmitterService.INSTANCE.emit(
			`commandError`,
			this,
			message,
			new Error(`Totally planned error !`)
		);
	}
}
