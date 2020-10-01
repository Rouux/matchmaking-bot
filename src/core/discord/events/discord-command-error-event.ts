import { Message, User } from "discord.js";
import { LoggerService } from "../../utils/logger/logger-service";
import { DiscordEvent } from "../classes/discord-event";
import { DiscordClient } from "../classes/discord-client";
import { DiscordClientService } from "../services/discord-client-service";
import { DiscordCommand } from "../classes/discord-command";
import { DiscordEmbed } from "../classes/discord-embed";

export class DiscordCommandErrorEvent extends DiscordEvent {
	protected async assignEventsToClient(client: DiscordClient): Promise<void> {
		client.on(`commandError`, async (command, message, error) => {
			LoggerService.INSTANCE.error({
				context: `Event - CommandError`,
				message: `The command '${
					command.name
				}' within the message : "${message}" returned an error :\n${
					error.stack ? error.stack : error
				}`,
			});
			const owner = await this._fetchOwner(client);
			if (owner) this._sendOwner(owner, command, message, error);
			this._sendChannel(message, command, owner);
		});
	}

	private async _fetchOwner(client: DiscordClient): Promise<User | undefined> {
		const ownerId = DiscordClientService.INSTANCE.client.getOption(`owner`);
		if (!ownerId) return undefined;
		return client.users.cache.get(ownerId) || client.users.fetch(ownerId);
	}

	private _sendChannel(
		message: Message,
		command: DiscordCommand,
		owner?: User
	) {
		message.channel.send(
			this._makeChannelEmbedError(command.command, owner ? owner.id : undefined)
		);
	}

	private _sendOwner(
		owner: User,
		command: DiscordCommand,
		message: Message,
		error: Error
	) {
		if (owner) {
			owner.send(
				this._makeOwnerEmbedError(command.command, message.content, error)
			);
		}
	}

	public _makeChannelEmbedError(
		command: string,
		ownerId?: string
	): DiscordEmbed {
		const embed = new DiscordEmbed();
		embed
			.setColor(`RED`)
			.setTitle(`Command error !`)
			.setDescription(`An error on the command ${command} occured.`);
		if (ownerId) embed.addField(`Seek help ?`, `You can ask <@${ownerId}> !`);

		return embed;
	}

	public _makeOwnerEmbedError(
		command: string,
		message: string,
		error?: Error
	): DiscordEmbed {
		const embed = new DiscordEmbed();
		embed
			.setColor(`RED`)
			.setTitle(`Command Error !`)
			.setDescription(`An error on a command occured, see details below`)
			.addField(`Command`, command)
			.addField(`Message content`, message);

		if (error) {
			embed.addField(`Reason :`, `${error.message}`);
			if (error.stack) {
				embed.addField(`Error stack trace :`, `\`\`\`${error.stack}\`\`\``);
			}
		}

		return embed;
	}
}
