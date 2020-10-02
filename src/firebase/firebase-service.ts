import firebase, { ServiceAccount } from "firebase-admin";
import { toJson } from "../utils/utils";
import { Lobby } from "../classes/lobby";
import credentials from "./credential.json";

firebase.initializeApp({
	credential: firebase.credential.cert(<ServiceAccount>credentials),
	databaseURL: `https://${credentials.project_id}.firebaseio.com`,
});

export class FirebaseService {
	public static readonly firestore = firebase.firestore();

	public static async createLobby(lobby: Lobby): Promise<Lobby> {
		await this.firestore
			.collection(`lobbies/${lobby.locale}/active`)
			.add(toJson(lobby))
			.then(docRef => docRef.get())
			.then(snapshot => snapshot.id)
			.then(id => {
				lobby.documentId = id;
				return id;
			})
			.then(id =>
				this.firestore
					.collection(`lobbies/${lobby.locale}/active`)
					.doc(id)
					.update({
						id,
					})
			);
		return lobby;
	}

	public static async getLobbies(): Promise<Lobby[]> {
		const collection = this.firestore.collection(`lobbies`);

		const result: FirebaseFirestore.DocumentData[] = [];
		await this._recursive(collection, result);
		console.log(result);
		return result.map(lobby => lobby as Lobby);
	}

	private static async _recursive(
		collection: FirebaseFirestore.CollectionReference<
			FirebaseFirestore.DocumentData
		>,
		result: FirebaseFirestore.DocumentData[]
	) {
		return Promise.all(
			(await collection.listDocuments()).map(async docRef => {
				result.push((await docRef.get()).data()!);
				const list = await docRef.listCollections();
				list.forEach(async c => {
					await this._recursive(c, result);
				});
			})
		);
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
