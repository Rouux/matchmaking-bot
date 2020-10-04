/* eslint-disable no-use-before-define */
/* eslint-disable no-console */
import dotenv, { DotenvParseOutput } from "dotenv";
import path from "path";
import { Lobby } from "./classes/models/lobby";
import { CoreService } from "./core/core-service";
import { DiscordCommandService } from "./core/discord/services/discord-command-service";
import { DiscordEventService } from "./core/discord/services/discord-event-service";
import { FirebaseService } from "./firebase/firebase-service";

async function main(config: DotenvParseOutput): Promise<void> {
	await CoreService.INSTANCE.start({
		root: path.join(__dirname),
		prefix: `!`,
		discordToken: config.DISCORD_TOKEN,
		client: {
			owner: `230336648942977024`,
		},
	});
	printEventsAndCommands();
}

function printEventsAndCommands() {
	const events = DiscordEventService.INSTANCE.repository
		.all()
		.map((value) => value.constructor.name);
	console.log(`events : [${events.join(`, `)}]`);

	const commands = DiscordCommandService.INSTANCE.repository
		.all()
		.map((value) => value.constructor.name);
	console.log(`commands : [${commands.join(`, `)}]`);
}

const dotenvConfig = dotenv.config();

if (dotenvConfig.error) {
	throw dotenvConfig.error;
}

if (!dotenvConfig.parsed || Object.keys(dotenvConfig.parsed).length === 0) {
	throw new Error(`FATAL error, cannot load the .env`);
}

main(dotenvConfig.parsed);

// test();

// async function test() {
// 	const lobby = await FirebaseService.createLobby(
// 		new Lobby({
// 			name: `Monster`,
// 			description: `description`,
// 			locale: `FR`,
// 			size: 5,
// 		}),
// 	);
// 	await FirebaseService.updateLobby(lobby);
// 	const lobbies = await FirebaseService.getLobbies();
// 	console.log(lobbies);
// 	const result = await FirebaseService.getLobbiesByLocale(`FR`);
// 	console.log(result);
// }
