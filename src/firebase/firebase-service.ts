import firebase, { ServiceAccount } from "firebase-admin";
import { toJson } from "../utils/utils";
import { Game } from "../classes/game";
import credentials from "./credential.json";

firebase.initializeApp({
	credential: firebase.credential.cert(<ServiceAccount>credentials),
	databaseURL: `https://${credentials.project_id}.firebaseio.com`,
});

export class FirebaseService {
	public static readonly firestore: FirebaseFirestore.Firestore = firebase.firestore();

	public static async createGame(game: Game): Promise<Game> {
		await this.firestore
			.collection(`lobbies/${game.locale}/active-games`)
			.add(toJson(game))
			.then(docRef => docRef.get())
			.then(snapshot => snapshot.id)
			.then(id => {
				game.documentId = id;
				return id;
			})
			.then(id =>
				this.firestore
					.collection(`lobbies/${game.locale}/active-games`)
					.doc(id)
					.update({
						id,
					})
			);
		return game;
	}

	public static async getActiveGamesByLocale(locale = `FR`): Promise<Game[]> {
		const collection = await this.firestore
			.collection(`lobbies/${locale}/active-games`)
			.listDocuments();

		return (this._getDocuments(collection) as unknown) as Game[];
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
