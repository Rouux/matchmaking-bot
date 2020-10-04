import _ from "lodash";
import {
	Collection,
	GuildChannel,
	GuildMember,
	Invite,
	PartialGroupDMChannel,
	PartialGuildMember,
} from "discord.js";
import { MatchmakingEvent } from "../classes/matchmaking-event";
import { DiscordClient } from "../core/discord/classes/discord-client";
import { LoggerService } from "../core/utils/logger/logger-service";
import { Lobby } from "../classes/models/lobby";

export class GuildMemberAddEvent extends MatchmakingEvent {
	protected async assignEventsToClient(client: DiscordClient): Promise<void> {
		client.on(`guildMemberAdd`, async (member) => {
			this._logDebugMemberjoined(member);
			const lobby = await this._getInvitedToLobby(member);
			if (_.isNil(lobby)) return;
			const role = await member.guild.roles.fetch(lobby.role);
			if (_.isNil(role)) return;
			member.roles.add(role);
		});
	}

	private async _getInvitedToLobby(
		member: GuildMember | PartialGuildMember,
	): Promise<Lobby | undefined> {
		const channel = await this._getInvitedToChannel(member);
		if (!channel) return undefined;
		const [locale, id] = channel.name.split(`-`);
		if (!locale || !id) return undefined;

		return this.matchmakingService.findLobby(locale, id);
	}

	private async _getInvitedToChannel(
		member: GuildMember | PartialGuildMember,
	): Promise<GuildChannel | PartialGroupDMChannel | undefined> {
		return member.guild
			.fetchInvites()
			.then((invites) => {
				const cachedInvites = this.getThenUpdateInvites(member.guild.id, invites);
				if (!cachedInvites) return this._getTheOnlyUsedInvite(invites);
				return invites.find(
					(invite) => cachedInvites.get(invite.code).uses < invite.uses,
				);
			})
			.then((invite) => {
				return invite ? invite.channel : undefined;
			})
			.catch(() => undefined);
	}

	private _getTheOnlyUsedInvite(
		invites: Collection<string, Invite>,
	): Invite | PromiseLike<Invite | undefined> | undefined {
		if (invites.size === 0) return undefined;
		return invites.reduce((result: Invite | undefined, value) => {
			if (_.isNil(result)) return value;
			if (_.isNil(result.uses)) return value;
			if (_.isNil(value.uses)) return result;
			return result.uses > value.uses ? result : value;
		}, undefined);
	}

	private _logDebugMemberjoined({ user, guild }: GuildMember | PartialGuildMember) {
		LoggerService.INSTANCE.debug({
			context: `Event - Guild Member Add`,
			message: `${user ? user.tag : `UnKn0wN`} joined the server ${guild.name} !`,
		});
	}
}
