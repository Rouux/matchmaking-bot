/* eslint-disable no-use-before-define */
import { recursiveReadDir } from "./recursive-read-dir";

export async function getInstancesFromFolder<T>(
	folderPath: string
): Promise<T[]> {
	const files = recursiveReadDir(folderPath);
	if (files.length === 0) return [];
	return files
		.map(async filePath => {
			return _importClassesFromPath<T>(filePath);
		})
		.reduce(async (promiseAccumulator, promiseCurrent) => {
			const accumulator = await promiseAccumulator;
			const current = await promiseCurrent;
			accumulator.push(...current);
			return promiseAccumulator;
		});
}

async function _importClassesFromPath<T>(filePath: string): Promise<T[]> {
	return import(filePath)
		.then(file => {
			return _instantiateGivenClasses<T>(file);
		})
		.catch(err => {
			return Promise.reject(new Error(err));
		});
}

function _instantiateGivenClasses<T>(classes: {
	[key: string]: new (...args: unknown[]) => T;
}): T[] {
	return Object.keys(classes).map(cname => {
		return new classes[cname]();
	});
}
