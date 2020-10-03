import firebase, { ServiceAccount } from "firebase-admin";
import { Lobby } from "../classes/models/lobby";
import { HostGuild } from "../classes/models/host-guild";
import credentials from "./credential.json";
import { CollectionReference, DocumentReference } from "./firebase-types";
import {
	collectionAdd,
	documentUpdate,
	getDocumentData,
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
		const hostGuilds = await getDocumentsData<HostGuild>(docs);
		return hostGuilds.find(
			(hostGuild) => hostGuild !== undefined && hostGuild.guildId !== undefined,
		);
	}

	public static async createLobby(lobby: Lobby): Promise<Lobby> {
		await collectionAdd(this.getCollectionRef(`lobbies/${lobby.locale}/active`), lobby)
			.then((docRef) => docRef.get())
			.then((snapshot) => snapshot.id)
			.then((id) => {
				lobby.documentId = id;
			});
		return lobby;
	}

	public static async updateLobby(lobby: Lobby): Promise<Lobby> {
		const { locale, documentId } = lobby;
		await documentUpdate(
			this.getDocumentRef(`lobbies/${locale}/active`, documentId), lobby,
		);
		return lobby;
	}

	public static async getLobbiesByLocale(locale = `FR`): Promise<Lobby[]> {
		const collection = await this.getDocumentsRef(`lobbies/${locale}/active`);

		// @ts-ignore
		return getDocumentsData<Lobby>(collection);
	}

	public static async getLobbyByLocaleAndId(
		locale: string,
		id: string,
	): Promise<Lobby | undefined> {
		const docRef = this.getDocumentRef(`lobbies/${locale}/active`, id);
		return getDocumentData<Lobby>(docRef);
	}

	public static async deleteLobby(lobby: Lobby): Promise<Lobby> {
		const { locale, documentId } = lobby;
		const docRef = this.getDocumentRef(`lobbies/${locale}/active`, documentId);
		docRef.delete();
		return lobby;
	}

	private static getCollectionRef(path: string): CollectionReference {
		return this.firestore.collection(path);
	}

	private static getDocumentRef(path: string, documentId: string): DocumentReference {
		return this.firestore.collection(path).doc(documentId);
	}

	private static async getDocumentsRef(path: string): Promise<DocumentReference[]> {
		return this.firestore.collection(path).listDocuments();
	}
}
