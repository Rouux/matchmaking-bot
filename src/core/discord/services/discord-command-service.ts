import _ from "lodash";
import { Message } from "discord.js";
import { DiscordEventService } from "./discord-event-service";
import { DiscordCommandRepository } from "../repositories/discord-command-repository";
import { DiscordMessageEvent } from "../events/discord-message-event";
import { DiscordEventEmitterService } from "./discord-event-emitter-service";
import { DiscordCommand } from "../classes/discord-command";
import { CustomEvents } from "../../interfaces/custom-events-interface";

export class DiscordCommandService {
	private static _instance: DiscordCommandService;

	public static get INSTANCE(): DiscordCommandService {
		if (_.isNil(DiscordCommandService._instance))
			DiscordCommandService._instance = new DiscordCommandService();

		return DiscordCommandService._instance;
	}

	public async call(
		message: Message,
		callname: string,
		...args: string[]
	): Promise<void> {
		const command = this._repository.getCommand(callname);
		this._canBeExecuted(message, command).then(async condition => {
			if (condition && command) await command.executeCommand(message, ...args);
		});
	}

	private async _canBeExecuted(
		message: Message,
		command?: DiscordCommand
	): Promise<boolean> {
		if (!command) {
			await this._emit(`unknownCommand`, message);
			return false;
		}
		if (this._isGuildOnlyCommandNotCalledInGuild(command, message)) {
			await this._emit(`guildOnlyInDm`, message, command);
			return false;
		}
		if (this._repository.isCommandOnCooldown(command, message)) {
			await this._emit(`commandInCooldown`, message, command);
			return false;
		}
		const { member } = message;
		if (member && !member.hasPermission(command.data.permissions)) {
			await this._emit(`commandNotAllowed`, message, command);
			return false;
		}

		return true;
	}

	public async _emit<K extends keyof CustomEvents>(
		event: K,
		...args: CustomEvents[K]
	): Promise<void> {
		return DiscordEventEmitterService.INSTANCE.emit(event, ...args);
	}

	private _isGuildOnlyCommandNotCalledInGuild(
		command: DiscordCommand,
		message: Message
	) {
		return command.isGuildOnly() && message.guild === null;
	}

	private _repository = new DiscordCommandRepository();

	public async init(commands: string): Promise<void> {
		return DiscordCommandRepository.build(commands)
			.then(repository => {
				this._repository = repository;
			})
			.then(() =>
				DiscordEventService.INSTANCE.repository.registerDiscordEvent(
					new DiscordMessageEvent()
				)
			);
	}

	public get repository(): DiscordCommandRepository {
		return this._repository;
	}
}
