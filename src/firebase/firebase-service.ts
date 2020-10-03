import firebase, { ServiceAccount } from "firebase-admin";
import { HostGuild } from "../classes/models/host-guild";
import { Lobby } from "../classes/models/lobby";
import credentials from "./credential.json";
import { collectionAdd, documentUpdate, getDocuments } from "./firebase-utils";

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
		const collectionRef = this.firestore.collection(
			`lobbies/${lobby.locale}/active`
		);
		collectionAdd(collectionRef, lobby)
			.then(docRef => docRef.get())
			.then(snapshot => snapshot.id)
			.then(id => {
				lobby.documentId = id;
			});
		return lobby;
	}

	public static async updateLobby(lobby: Lobby): Promise<Lobby> {
		const docRef = this.firestore
			.collection(`lobbies/${lobby.locale}/active`)
			.doc(lobby.documentId);
		documentUpdate(docRef, lobby);
		return lobby;
	}

	public static async getLobbiesByLocale(locale = `FR`): Promise<Lobby[]> {
		const collection = await this.firestore
			.collection(`lobbies/${locale}/active`)
			.listDocuments();

		return (await getDocuments(collection)).map(lobby => lobby as Lobby);
	}
}
