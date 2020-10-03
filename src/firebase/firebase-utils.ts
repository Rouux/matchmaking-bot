export function collectionAdd(
	collectionRef: FirebaseFirestore.CollectionReference,
	data = {}
): Promise<FirebaseFirestore.DocumentReference> {
	return collectionRef.add({
		createdAt: Date.now(),
		lastUpdatedAt: Date.now(),
		...data,
	});
}
export function documentSet(
	documentRef: FirebaseFirestore.DocumentReference,
	data = {}
): Promise<FirebaseFirestore.WriteResult> {
	return documentRef.set({
		createdAt: Date.now(),
		lastUpdatedAt: Date.now(),
		...data,
	});
}

export function documentUpdate(
	documentRef: FirebaseFirestore.DocumentReference,
	data = {}
): Promise<FirebaseFirestore.WriteResult> {
	return documentRef.update({
		lastUpdatedAt: Date.now(),
		...data,
	});
}

export async function getDocuments(
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
