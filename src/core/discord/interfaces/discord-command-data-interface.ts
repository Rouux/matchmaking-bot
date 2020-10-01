import { PermissionString } from "discord.js";

export type CommandArgument = {
	name: string;
	mandatory?: boolean;
};

export interface IDiscordCommandData {
	name: string;
	description: string;
	usage: string;
	aliases: string[];
	guildOnly: boolean;
	cooldown: number;
	permissions: Array<PermissionString>;
	arguments: Array<CommandArgument>;
}
