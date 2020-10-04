import firebase, { ServiceAccount } from "firebase-admin";
import { LoggerService } from "../core/utils/logger/logger-service";
import { Lobby } from "../classes/models/lobby";
import { HostGuild } from "../classes/models/host-guild";
import credentials from "./private/credential.json";
import ENDPOINTS from "./private/firebase-endpoints";
import { documentCreate, documentUpdate } from "./firebase-utils";

firebase.initializeApp({
	credential: firebase.credential.cert(<ServiceAccount>credentials),
	databaseURL: `https://${credentials.project_id}.firebaseio.com`,
});

export class FirebaseService {
	public static readonly firestore = firebase.firestore();

	public static async getAvailableHostGuild(): Promise<HostGuild | undefined> {
		const collection = await this.firestore
			.collection(ENDPOINTS.HOST_GUILDS)
			.limit(1)
			.get();
		const hostGuilds = collection.docs.map((doc) => doc.data() as HostGuild);
		if (hostGuilds.length === 0) {
			LoggerService.INSTANCE.error({
				context: `FirebaseService::getAvailableHostGuild`,
				message: `No available guild was find !`,
			});
			return undefined;
		}
		return hostGuilds[0];
	}

	public static async getLobbies(): Promise<Lobby[]> {
		const collection = await this.firestore.collection(ENDPOINTS.LOBBIES).get();
		return collection.docs.map((doc) => doc.data() as Lobby);
	}

	public static async getLobbiesByLocale(locale: string, limit = 10): Promise<Lobby[]> {
		const collection = await this.firestore
			.collection(ENDPOINTS.LOBBIES)
			.where(`locale`, `==`, locale)
			.orderBy(`players`, `desc`)
			.limit(limit)
			.get();
		return collection.docs.map((doc) => doc.data() as Lobby);
	}

	public static async getLobby(documentId: string): Promise<Lobby | undefined> {
		const document = await this.firestore
			.collection(ENDPOINTS.LOBBIES)
			.doc(documentId)
			.get();
		return document.data() as Lobby;
	}

	public static async createLobby(lobby: Lobby): Promise<Lobby> {
		const collectionRef = this.firestore.collection(ENDPOINTS.LOBBIES);
		const docRef = await documentCreate(collectionRef, lobby);
		lobby.documentId = docRef.id;
		return this.updateLobby(lobby);
	}

	public static async updateLobby(lobby: Lobby): Promise<Lobby> {
		const documentRef = this.firestore
			.collection(ENDPOINTS.LOBBIES)
			.doc(lobby.documentId);
		await documentUpdate(documentRef, lobby);
		return lobby;
	}

	public static async deleteLobby(lobby: Lobby): Promise<Lobby> {
		await this.firestore.collection(ENDPOINTS.LOBBIES).doc(lobby.documentId).delete();
		return lobby;
	}
}
