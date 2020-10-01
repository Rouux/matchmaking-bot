export abstract class Repository<T> {
	private _data: Array<T> = [];

	public constructor(data?: Array<T>) {
		if (data) this._data = data;
	}

	protected add(value: T): Repository<T> {
		this._data.push(value);
		return this;
	}

	public all(): ReadonlyArray<T> {
		return this._data;
	}

	public get length(): number {
		return this._data.length;
	}

	public includes(value: T): boolean {
		return this._data.includes(value);
	}

	public byType<U>(clazz: new (...args: unknown[]) => U): ReadonlyArray<T> {
		return this.all().filter(value => {
			return value instanceof clazz;
		});
	}

	public byTypeFirst<U extends T>(
		clazz: new (...args: unknown[]) => U,
		orElse?: U
	): T | undefined {
		const result = this.all().find(value => {
			return value instanceof clazz;
		});
		if (!result && orElse) return orElse;
		return result;
	}
}
