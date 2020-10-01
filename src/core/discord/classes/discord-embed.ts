import { MessageEmbed, MessageEmbedOptions } from "discord.js";
import { resolveColor, Colors, ColorResolvable } from "../../utils/colors";

export class DiscordEmbed extends MessageEmbed {
	constructor(data?: MessageEmbedOptions & { empty?: boolean }) {
		super(data);
		if (data?.empty !== true) {
			this.setColor(`LIGHT_BLUE`)
				.setAuthor(`Roux`, `https://i.imgur.com/NNKJUkI.png`)
				.setFooter(`Example footer`)
				.setTimestamp();
		}
	}

	public setColor(color: Colors): this;

	public setColor<T extends ColorResolvable>(color: Exclude<T, Colors>): this;

	public setColor(color: ColorResolvable): this {
		super.setColor(resolveColor(color));
		return this;
	}
}
