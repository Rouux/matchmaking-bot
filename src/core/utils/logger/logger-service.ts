/* eslint-disable class-methods-use-this */
import chalk from "chalk";
import _ from "lodash";
import timestamp from "time-stamp";
import { ILogConfig, ILoggerTypes } from "./logger-interface";

export class LoggerService {
	private static _instance: LoggerService;

	public static get INSTANCE(): LoggerService {
		if (_.isNil(LoggerService._instance))
			LoggerService._instance = new LoggerService();

		return LoggerService._instance;
	}

	private _logHistory: string[] = [];

	private _loggerConfig: ILoggerTypes = {
		debug: true,
		info: true,
		success: true,
		warn: true,
		error: true,
	};

	public async init(logger?: ILoggerTypes): Promise<void> {
		if (logger) {
			this._loggerConfig = {
				...this._loggerConfig,
				...logger,
			};
		}
	}

	public debug(options: ILogConfig): void {
		if (this._loggerConfig.debug) {
			this.log(`DEBUG`, options);
		}
	}

	public info(options: ILogConfig): void {
		if (this._loggerConfig.info) {
			this.log(`INFO`, {
				chalkHeader: chalk.blueBright,
				...options,
			});
		}
	}

	public success(options: ILogConfig): void {
		if (this._loggerConfig.success) {
			this.log(`SUCCESS`, {
				chalkHeader: chalk.green,
				...options,
			});
		}
	}

	public warn(options: ILogConfig): void {
		if (this._loggerConfig.warn) {
			this.log(`WARN`, {
				chalkHeader: chalk.bold.yellow,
				...options,
			});
		}
	}

	public error(options: ILogConfig): void {
		if (this._loggerConfig.error) {
			this.log(`ERROR`, {
				chalkHeader: chalk.bold.red,
				...options,
			});
		}
	}

	public log(header: string, options: ILogConfig): void {
		const log = this._createLog(header, {
			chalkMessage: chalk.whiteBright,
			...options,
		});
		if (!log || log.length === 0) return;
		if (options.save !== false) this._logHistory.push(log);

		// eslint-disable-next-line no-console
		console.log(log);
	}

	private _createLog(header: string, options: ILogConfig): string {
		const chalkWholeLine = options.chalkWholeLine || chalk;
		const chalkTimestamp = options.chalkTimestamp || chalk;
		const chalkHeader = options.chalkHeader || chalk;
		const chalkContext = options.chalkContext || chalk;
		const chalkMessage = options.chalkMessage || chalk;

		return chalkWholeLine(
			`${chalkTimestamp(this._getTimestamp())} - [${chalkHeader(
				header
			)}][${chalkContext(options.context)}] - ${chalkMessage(options.message)}`
		);
	}

	public getLogHistory(): Readonly<string[]> {
		return this._logHistory;
	}

	private _getTimestamp(): string {
		return timestamp(`HH:mm:ss.ms`);
	}
}
