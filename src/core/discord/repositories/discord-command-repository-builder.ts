import { oneLine } from "common-tags";
import { Repository } from "../../classes/repository";
import { getInstancesFromFolder } from "../../functions/recursive-get-classes-dir";
import { LoggerService } from "../../utils/logger/logger-service";
import { DiscordCommand } from "../classes/discord-command";
import { DiscordCommandRepository } from "./discord-command-repository";

export class DiscordCommandRepositoryBuilder extends Repository<
	DiscordCommand
> {
	public async build(commandsPath: string): Promise<DiscordCommandRepository> {
		return getInstancesFromFolder<DiscordCommand>(commandsPath)
			.then(discordCommands => {
				this._registerDiscordCommands(discordCommands);
			})
			.then(() => new DiscordCommandRepository(Object.assign([], this.all())));
	}

	private _registerDiscordCommands(discordCommands: DiscordCommand[]) {
		discordCommands.forEach(discordCommand => {
			this._registerDiscordCommand(discordCommand);
		});
	}

	private _registerDiscordCommand(discordCommand: DiscordCommand): void {
		const { callnames } = discordCommand;
		if (this._checkCallnamesAreAvailables(callnames)) {
			this.add(discordCommand);
			LoggerService.INSTANCE.info({
				context: `DiscordCommandRepositoryBuilder`,
				message: oneLine`Registered command '${discordCommand.name}'
						with callnames [${callnames.join(`, `)}]`,
			});
		}
	}

	private _checkCallnamesAreAvailables(callnames: string[]): boolean {
		const commandUsingCallname = this._getCommand(callnames);
		if (!commandUsingCallname) return true;
		const callname = commandUsingCallname.callnames.find(cname =>
			callnames.includes(cname)
		);
		throw new Error(
			oneLine`The registry already contains the command
				[${commandUsingCallname.name}] using the same callname '${callname}'`
		);
	}

	private _getCommand(callnames: string[]): DiscordCommand | undefined {
		return this.all().find(value => {
			return value.callnames.some(callname => callnames.includes(callname));
		});
	}
}
