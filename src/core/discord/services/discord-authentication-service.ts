import _ from "lodash";
import { LoggerService } from "../../utils/logger/logger-service";
import { DiscordClientService } from "./discord-client-service";

export class DiscordAuthenticationService {
	private static _instance: DiscordAuthenticationService;

	private _authenticated = false;

	public static get INSTANCE(): DiscordAuthenticationService {
		if (_.isNil(DiscordAuthenticationService._instance))
			DiscordAuthenticationService._instance = new DiscordAuthenticationService();
		return DiscordAuthenticationService._instance;
	}

	public async init(discordToken: string): Promise<void> {
		return this.login(discordToken);
	}

	public async login(token: string): Promise<void> {
		LoggerService.INSTANCE.info({
			context: `DiscordAuthenticationService`,
			message: `The bot is logging in . . .`,
		});
		return DiscordClientService.INSTANCE.client
			.login(token)
			.then(() => {
				this._authenticated = true;
			})
			.catch(err => {
				LoggerService.INSTANCE.error({
					context: `DiscordAuthenticationService`,
					message: `The bot could not log in, reason : ${err}`,
				});
				return Promise.reject(new Error(err));
			});
	}

	public isAuthenticated(): boolean {
		return this._authenticated;
	}
}
