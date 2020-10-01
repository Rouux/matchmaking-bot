import { getInstancesFromFolder } from "../../functions/recursive-get-classes-dir";
import { DiscordEvent } from "../classes/discord-event";
import { Repository } from "../../classes/repository";
import { LoggerService } from "../../utils/logger/logger-service";
import { DiscordClientService } from "../services/discord-client-service";
import { DiscordClient } from "../classes/discord-client";
import { DiscordEventRepository } from "./discord-event-repository";

export class DiscordEventRepositoryBuilder extends Repository<DiscordEvent> {
	private _client!: DiscordClient;

	public async build(eventsPath: string): Promise<DiscordEventRepository> {
		this._client = DiscordClientService.INSTANCE.client;
		return getInstancesFromFolder<DiscordEvent>(eventsPath)
			.then(discordEvents => this._registerEachDiscordEvent(discordEvents))
			.then(() => new DiscordEventRepository(Object.assign([], this.all())));
	}

	public async _registerEachDiscordEvent(
		discordEvents: DiscordEvent[]
	): Promise<void> {
		return new Promise((resolve, reject) => {
			discordEvents.forEach(discordEvent => {
				this._registerDiscordEvent(discordEvent).catch(reject);
			});
			resolve();
		});
	}

	public async _registerDiscordEvent(
		discordEvent: DiscordEvent
	): Promise<void> {
		if (!this._client)
			throw new Error(`The Client in the respository is undefined !`);
		discordEvent.buildEventsForClient(this._client).then(() => {
			this.add(discordEvent);
			LoggerService.INSTANCE.info({
				context: `DiscordEventRepositoryBuilder`,
				message: `${discordEvent.constructor.name} successfully assigned to the Discord client`,
			});
		});
	}
}
