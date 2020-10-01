import { DiscordEvent } from "../classes/discord-event";
import { Repository } from "../../classes/repository";
import { DiscordEventRepositoryBuilder } from "./discord-event-repository-builder";

export class DiscordEventRepository extends Repository<DiscordEvent> {
	private _builder = new DiscordEventRepositoryBuilder();

	public static async build(
		eventsPath: string
	): Promise<DiscordEventRepository> {
		const builder = new DiscordEventRepositoryBuilder();
		return builder.build(eventsPath).then(repository => {
			// eslint-disable-next-line no-param-reassign
			repository._builder = builder;
			return repository;
		});
	}

	public async registerDiscordEvent(discordEvent: DiscordEvent): Promise<void> {
		return this._builder._registerDiscordEvent(discordEvent);
	}
}
