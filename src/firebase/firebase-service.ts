import firebase, { ServiceAccount } from "firebase-admin";
import { HostGuild } from "../classes/models/host-guild";
import { toJson } from "../utils/utils";
import { Lobby } from "../classes/models/lobby";
import credentials from "./credential.json";

firebase.initializeApp({
	credential: firebase.credential.cert(<ServiceAccount>credentials),
	databaseURL: `https://${credentials.project_id}.firebaseio.com`,
});

export class FirebaseService {
	public static readonly firestore = firebase.firestore();

	public static async getAvailableHostGuild(): Promise<HostGuild | undefined> {
		const docs = await this.firestore.collection(`host-guilds`).listDocuments();
		return (await Promise.all(docs.map(async doc => (await doc.get()).data())))
			.map(data => data as HostGuild)
			.find(data => data !== undefined && data.guildId !== undefined);
	}

	public static async createLobby(lobby: Lobby): Promise<Lobby> {
		await this.firestore
			.collection(`lobbies/${lobby.locale}/active`)
			.add(toJson(lobby))
			.then(docRef => docRef.get())
			.then(snapshot => snapshot.id)
			.then(id => {
				lobby.documentId = id;
			});
		return lobby;
	}

	public static async updateLobby(lobby: Lobby): Promise<Lobby> {
		await this.firestore
			.collection(`lobbies/${lobby.locale}/active`)
			.doc(lobby.documentId)
			.update({
				...lobby,
			});
		return lobby;
	}

	public static async getLobbiesByLocale(locale = `FR`): Promise<Lobby[]> {
		const collection = await this.firestore
			.collection(`lobbies/${locale}/active`)
			.listDocuments();

		return (await this._getDocuments(collection)).map(lobby => lobby as Lobby);
	}

	private static async _getDocuments(
		collection: FirebaseFirestore.DocumentReference[]
	): Promise<FirebaseFirestore.DocumentData[]> {
		return Promise.all(
			collection
				.map(docRef => docRef.get())
				.filter(async snapshot => (await snapshot).exists)
				.map(
					async snapshot =>
						<FirebaseFirestore.DocumentData>(await snapshot).data()
				)
		);
	}
}
