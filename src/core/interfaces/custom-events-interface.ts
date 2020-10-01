import { ClientEvents, Message } from "discord.js";
import { DiscordCommand } from "../discord/classes/discord-command";
import { CommandArgument } from "../discord/interfaces/discord-command-data-interface";

export interface CustomEvents extends ClientEvents {
	unknownCommand: [Message];
	guildOnlyInDm: [Message, DiscordCommand];
	commandInCooldown: [Message, DiscordCommand];
	commandNotAllowed: [Message, DiscordCommand];
	commandMandatoryArgumentMissing: [Message, CommandArgument, DiscordCommand];
	commandWrongArgumentUsage: [Message, string | undefined];
	commandError: [DiscordCommand, Message, Error];
}
