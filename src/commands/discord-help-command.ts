import { EmbedFieldData, Message } from "discord.js";
import { DiscordEmbed } from "../core/discord/classes/discord-embed";
import { DiscordCommand } from "../core/discord/classes/discord-command";

export class DiscordHelpCommand extends DiscordCommand {
	constructor() {
		super(`help`, {
			description: `Sends a pm about all the available commands`,
			aliases: [`h`, `halp`, `aled`],
		});
	}

	protected async handleCommand(message: Message): Promise<void> {
		const embed = new DiscordEmbed()
			.setTitle(`Available commands`)
			.setDescription(`Show all the available commands`);

		const fields: EmbedFieldData[] = this._mapperCommandsToFields();
		if (fields && fields.length > 0) embed.addFields(...fields);

		await message.author.send(embed);
	}

	private _mapperCommandsToFields() {
		return this._commandService.repository.all().map(command => {
			return this._mapperCommandToFieldData(command);
		});
	}

	private _mapperCommandToFieldData(command: DiscordCommand): EmbedFieldData {
		return {
			name: `${command.name}`,
			value: [
				`${command.data.description}`,
				`[${command.callnames.join(`, `)}]`,
			],
		};
	}
}
