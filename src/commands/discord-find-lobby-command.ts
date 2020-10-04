import _ from "lodash";
import { Message, VoiceChannel } from "discord.js";
import { Lobby } from "../classes/models/lobby";
import { LOCALES } from "../utils/constants";
import { MatchmakingCommand } from "../classes/matchmaking-command";

export class DiscordFindLobbyCommand extends MatchmakingCommand {
	constructor() {
		super(`find`, {
			description: `Find a lobby`,
			aliases: [`f`],
			cooldown: 3,
			usage: `!find \`<lang>\` - \`<name>\``,
		});
	}

	protected async handleCommand(message: Message, args: string[]): Promise<Message> {
		const splitChar = this.autoDetectSplitCharacter(args);
		if (!splitChar) {
			return this.sendUsageError(message, `The split character was not found !`);
		}
		const [locale, name] = this.splitArguments(args, splitChar, 2);
		const lobbies = await this._getLobbies(message, locale, name);
		if (!lobbies || lobbies.length === 0) {
			return message.channel.send(`No lobby was found for "${name}" :(`);
		}
		const lobby = await this._getLobbyUserChosen(message, lobbies);
		if (lobby) return this._sendInviteLink(message, lobby);
		return message;
	}

	private async _getLobbyUserChosen(
		message: Message,
		lobbies: Lobby[],
	): Promise<Lobby | undefined> {
		await this._sendLobbyList(message, lobbies);
		const choice = await this._awaitAnswer(message);
		if (_.isNaN(choice)) return undefined;
		if (choice < 1 || choice > lobbies.length) {
			message.channel.send(
				`The choice '${choice}' is out of range (1, ${lobbies.length})`,
			);
			return undefined;
		}
		return lobbies[choice - 1];
	}

	private async _sendInviteLink(message: Message, lobby: Lobby) {
		const voiceChannel = (await this.client.channels.fetch(
			lobby.channels.voiceChannel,
		)) as VoiceChannel;
		const invite = await voiceChannel.createInvite({
			temporary: true,
			maxAge: 60000,
			maxUses: 2,
		});
		const { guild } = voiceChannel;
		const member = await guild.members
			.fetch(message.author.id)
			.then((guildMember) => guildMember)
			.catch(() => undefined);
		if (member) member.roles.add(lobby.role);
		return message.author.send(invite.url);
	}

	private async _awaitAnswer(message: Message): Promise<number> {
		const time = 30;
		const authorsMatch = (m: Message) => m.author.id === message.author.id;
		return message.channel
			.awaitMessages(authorsMatch, { max: 1, time: time * 1000 })
			.then((collected) => {
				const msg = collected.first();
				if (!msg) return NaN;
				const choice = Number.parseInt(msg.content, 10);
				if (_.isNaN(choice))
					message.channel.send(`The choice '${msg.content}' is not valid`);
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

	private async _getLobbies(
		message: Message,
		locale: string,
		name: string,
	): Promise<Lobby[]> {
		locale = locale.toUpperCase();
		if (!LOCALES.includes(locale.toUpperCase())) {
			this.sendUsageError(message, `The selected locale is WRONG`);
			return [];
		}

		return this.matchmakingService.findLobbies(locale, name);
	}
}
