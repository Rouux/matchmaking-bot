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

export async function getDocumentData<T>(
	document: FirebaseFirestore.DocumentReference
): Promise<T | undefined> {
	return document.get().then(snapshot => snapshot.data() as T | undefined);
}

export async function getDocumentsData<T>(
	documents: FirebaseFirestore.DocumentReference[],
	filterUndefined = true
): Promise<(T | undefined)[]> {
	return (
		await Promise.all(documents.map(async doc => getDocumentData<T>(doc)))
	).filter(data => !filterUndefined || data !== undefined);
}
