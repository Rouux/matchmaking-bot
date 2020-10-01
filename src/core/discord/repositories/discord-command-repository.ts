import { Collection, Message } from "discord.js";
import { Repository } from "../../classes/repository";
import { DiscordCommand } from "../classes/discord-command";
import { IDiscordCommandData } from "../interfaces/discord-command-data-interface";
import { DiscordCommandRepositoryBuilder } from "./discord-command-repository-builder";

export class DiscordCommandRepository extends Repository<DiscordCommand> {
	public static async build(
		commandsPath: string
	): Promise<DiscordCommandRepository> {
		return new DiscordCommandRepositoryBuilder().build(commandsPath);
	}

	private _cooldowns = new Collection<string, Collection<string, number>>();

	public commandCalled(command: DiscordCommand, message: Message): void {
		if (!this._cooldowns.has(command.name)) {
			this._cooldowns.set(command.name, new Collection());
		}
		const timestamps = this._cooldowns.get(command.name);
		if (timestamps) timestamps.set(message.author.id, Date.now());
	}

	public isCommandOnCooldown(
		command: DiscordCommand,
		message: Message
	): boolean {
		const timestamps = this._cooldowns.get(command.name);
		if (!timestamps) return false;

		const timestamp = timestamps.get(message.author.id);
		if (!timestamp) return false;

		const now = Date.now();
		const cooldownAmount = command.data.cooldown * 1000;
		const expirationTime = timestamp + cooldownAmount;
		return now < expirationTime;
	}

	public getCommand(callname: string): DiscordCommand | undefined {
		return this.all().find(value => {
			return value.callnames.includes(callname);
		});
	}

	public getCommandsData(): Readonly<IDiscordCommandData[]> {
		return this.all().map(command => {
			return command.data;
		});
	}
}
