import chalk from "chalk";

export interface ILogConfig {
	context: string;
	message: string;
	/**
	 * @default true
	 */
	save?: boolean;
	chalkWholeLine?: chalk.Chalk;
	chalkTimestamp?: chalk.Chalk;
	chalkHeader?: chalk.Chalk;
	chalkContext?: chalk.Chalk;
	chalkMessage?: chalk.Chalk;
}

export interface ILoggerTypes {
	/**
	 * @default true
	 */
	debug?: boolean;

	/**
	 * @default true
	 */
	info?: boolean;

	/**
	 * @default true
	 */
	success?: boolean;

	/**
	 * @default true
	 */
	warn?: boolean;

	/**
	 * @default true
	 */
	error?: boolean;
}
