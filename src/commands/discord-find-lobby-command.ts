import { Message, VoiceChannel } from "discord.js";
import _ from "lodash";
import { Lobby } from "../classes/models/lobby";
import { LOCALES } from "../utils/constants";
import { MatchmakingCommand } from "../classes/matchmaking-command";

export class DiscordFindLobbyCommand extends MatchmakingCommand {
	constructor() {
		super(`find`, {
			description: `Find a lobby`,
		});
	}

	protected async handleCommand(message: Message, args: string[]): Promise<Message> {
		const splitChar = this.autoDetectSplitCharacter(args);
		if (!splitChar)
			return this.sendUsageError(message, this, `The split character was not found !`);
		const [locale, name] = this.splitArguments(args, splitChar, 2);
		const lobbies = await this._request(message, locale, name);
		if (!lobbies || lobbies.length === 0)
			return message.channel.send(`No lobby was found for "${name}" :(`);
		await this._sendLobbyList(message, lobbies);
		const choice = await this._awaitAnswer(message);
		if (_.isNaN(choice)) return message;
		if (choice < 1 || choice > lobbies.length)
			return message.channel.send(
				`The choice '${choice}' is out of range (1, ${lobbies.length})`,
			);
		const lobby = lobbies[choice - 1];
		return this._sendInviteLink(message, lobby);
	}

	private async _sendInviteLink(message: Message, lobby: Lobby) {
		const voiceChannel = (await message.client.channels.fetch(
			lobby.channels.voiceChannel,
		)) as VoiceChannel;
		const invite = await voiceChannel.createInvite({
			temporary: true,
			maxAge: 60000,
		});
		return message.channel.send(invite.url);
	}

	private async _awaitAnswer(message: Message): Promise<number> {
		const time = 30;
		const authorsMatch = (m: Message) => m.author.id === message.author.id;
		return message.channel
			.awaitMessages(authorsMatch, { max: 1, time: time * 1000 })
			.then((collected) => {
				const { content } = collected.first()!;
				const choice = Number.parseInt(content, 10);
				if (_.isNaN(choice)) message.channel.send(`The choice '${content}' is not valid`);
				return choice;
			})
			.catch(() => {
				message.channel.send(`No answer after ${time} seconds, operation canceled.`);
				return NaN;
			});
	}

	private async _sendLobbyList(message: Message, lobbies: Lobby[]): Promise<Message> {
		const display = lobbies
			.map(
				({ locale, players, size, name, description }, index) =>
					`${index + 1} - [${locale}] - (${players}/${size}) - ${name}` +
					`\n\t${description}`,
			)
			.join(`\n`);
		return message.channel.send(
			`Pick a lobby to be invited to\n\`\`\`\n${display}\`\`\``,
		);
	}

	private async _request(
		message: Message,
		locale: string,
		name: string,
	): Promise<Lobby[]> {
		locale = locale.toUpperCase();
		if (!LOCALES.includes(locale.toUpperCase())) {
			this.sendUsageError(message, this, `The selected locale is WRONG`);
			return [];
		}

		return this.matchmakingService.findLobbies({ locale, name });
	}
}
