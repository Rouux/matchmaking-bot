import fs from "fs";

export function recursiveReadDir(
	dirPath: string,
	filter = `^((?!spec).)*.ts`
): string[] {
	if (!fs.existsSync(dirPath))
		throw new Error(`The path '${dirPath}' is not valid`);
	const regex = new RegExp(filter, `gm`).compile();
	const resultFiles: string[] = [];
	fs.readdirSync(dirPath).forEach((fname: string) => {
		const filePath = `${dirPath}/${fname}`;
		if (fs.statSync(filePath).isDirectory()) {
			resultFiles.push(...recursiveReadDir(filePath));
		} else if (regex.test(fname)) {
			resultFiles.push(filePath);
		}
	});
	return resultFiles;
}
