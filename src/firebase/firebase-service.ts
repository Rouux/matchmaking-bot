import firebase, { ServiceAccount } from "firebase-admin";
import { HostGuild } from "../classes/models/host-guild";
import { Lobby } from "../classes/models/lobby";
import credentials from "./credential.json";
import {
	collectionAdd,
	documentUpdate,
	getDocumentsData,
} from "./firebase-utils";

firebase.initializeApp({
	credential: firebase.credential.cert(<ServiceAccount>credentials),
	databaseURL: `https://${credentials.project_id}.firebaseio.com`,
});

export class FirebaseService {
	public static readonly firestore = firebase.firestore();

	public static async getAvailableHostGuild(): Promise<HostGuild | undefined> {
		const docs = await this.getDocumentsRef(`host-guilds`);
		const datas = await getDocumentsData<HostGuild>(docs);
		return datas.find(data => data !== undefined && data.guildId !== undefined);
	}

	public static async createLobby(lobby: Lobby): Promise<Lobby> {
		collectionAdd(
			this.getCollectionRef(`lobbies/${lobby.locale}/active`),
			lobby
		)
			.then(docRef => docRef.get())
			.then(snapshot => snapshot.id)
			.then(id => {
				lobby.documentId = id;
			});
		return lobby;
	}

	public static async updateLobby(lobby: Lobby): Promise<Lobby> {
		documentUpdate(
			this.getDocumentRef(`lobbies/${lobby.locale}/active`, lobby.documentId),
			lobby
		);
		return lobby;
	}

	public static async getLobbiesByLocale(locale = `FR`): Promise<Lobby[]> {
		const collection = await this.getDocumentsRef(`lobbies/${locale}/active`);

		return getDocumentsData<Lobby>(collection);
	}

	private static getCollectionRef(
		path: string
	): FirebaseFirestore.CollectionReference {
		return this.firestore.collection(path);
	}

	private static getDocumentRef(
		path: string,
		documentId: string
	): FirebaseFirestore.DocumentReference {
		return this.firestore.collection(path).doc(documentId);
	}

	private static async getDocumentsRef(
		path: string
	): Promise<FirebaseFirestore.DocumentReference[]> {
		return this.firestore.collection(path).listDocuments();
	}
}
