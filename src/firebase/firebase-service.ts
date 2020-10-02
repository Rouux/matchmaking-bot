import firebase, { ServiceAccount } from "firebase-admin";
import { Game } from "../classes/game";
import credentials from "./credential.json";

firebase.initializeApp({
	credential: firebase.credential.cert(<ServiceAccount>credentials),
	databaseURL: `https://${credentials.project_id}.firebaseio.com`,
});

export class FirebaseService {
	public static readonly firestore: FirebaseFirestore.Firestore = firebase.firestore();

	public static async getActiveGamesByLocale(locale = `FR`): Promise<Game[]> {
		const collection = await this.firestore
			.collection(`lobbies/${locale}/active-games`)
			.listDocuments();

		return (this.getDocuments(collection) as unknown) as Game[];
	}

	private static async getDocuments(
		collection: FirebaseFirestore.DocumentReference[]
	): Promise<FirebaseFirestore.DocumentData[]> {
		return Promise.all(
			collection
				.map(docRef => docRef.get())
				.filter(async snapshot => (await snapshot).exists)
				.map(async snapshot => (await snapshot).data())
		);
	}
}
