import { Message, User } from "discord.js";
import _ from "lodash";
import { DiscordEmbed } from "../core/discord/classes/discord-embed";
import { DiscordEmojis } from "../core/utils/constants";
import { DiscordUtils } from "../core/discord/utils/discord-utils";
import { DiscordCommand } from "../core/discord/classes/discord-command";

export class DiscordVoteCommand extends DiscordCommand {
	constructor() {
		super(`vote`, {
			description: `Ask for a vote (yes/no only)`,
			guildOnly: true,
			cooldown: 5,
			arguments: [
				{
					name: `notify`,
				},
			],
		});
	}

	protected async handleCommand(
		message: Message,
		...args: string[]
	): Promise<void> {
		if (this.hasArgument(`notify`)) {
			await this._voteAndNotify(message, args);
		} else {
			await this._vote(message, args);
		}
	}

	private _makeVoteEmbed(message: Message, args: string[]) {
		const authorAvatar = message.author.avatarURL();
		const embed = new DiscordEmbed({ empty: true })
			.setAuthor(message.author.username, authorAvatar || undefined)
			.setTitle(`Requested a vote`)
			.setColor(`BLURPLE`)
			.setDescription(args.join(` `))
			.setTimestamp();
		return embed;
	}

	private async _vote(message: Message, args: string[]) {
		const vote = this._makeVoteEmbed(message, args);
		return message.channel.send(vote).then(voteBotMessage => {
			message.delete().then(() => {
				DiscordUtils.reacts(
					voteBotMessage,
					DiscordEmojis.THUMBS_UP,
					DiscordEmojis.THUMBS_DOWN
				);
			});
			return voteBotMessage;
		});
	}

	private async _voteAndNotify(message: Message, args: string[]) {
		if (!this._notifyArgumentIsValid(message, args)) return;
		const argsWithoutNotifyElements = this.removeArgument(`--notify`, args, 1);
		this._vote(message, argsWithoutNotifyElements).then(voteBotMessage => {
			const timeout = this._getNotifyTimeout(args);
			this._notify(message.author, voteBotMessage, timeout);
			return voteBotMessage;
		});
	}

	private async _notify(
		author: User,
		message: Message,
		timeout: number
	): Promise<void> {
		const link = DiscordUtils.getLinkTo(message);
		return this.notify(author, timeout, link);
	}

	private _notifyArgumentIsValid(message: Message, args: string[]): boolean {
		const index = args.indexOf(`--notify`);
		if (index + 1 >= args.length) {
			this._commandService._emit(
				`commandWrongArgumentUsage`,
				message,
				`The --notify argument should be followed by a number !`
			);
			return false;
		}
		const timeout = this._getNotifyTimeout(args);
		if (_.isNaN(timeout)) {
			this._commandService._emit(
				`commandWrongArgumentUsage`,
				message,
				`The --notify argument should be followed by a number !`
			);
			return false;
		}
		return true;
	}

	private _getNotifyTimeout(args: string[]): number {
		const index = args.indexOf(`--notify`);
		return parseInt(args[index + 1], 10);
	}
}
