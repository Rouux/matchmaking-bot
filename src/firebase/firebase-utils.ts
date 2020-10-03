import {
	CollectionReference,
	DocumentReference,
	WriteResult,
} from "./firebase-types";

export function collectionAdd(
	collectionRef: CollectionReference,
	data = {}
): Promise<DocumentReference> {
	return collectionRef.add({
		createdAt: Date.now(),
		lastUpdatedAt: Date.now(),
		...data,
	});
}

export function documentSet(
	documentRef: DocumentReference,
	data = {}
): Promise<WriteResult> {
	return documentRef.set({
		createdAt: Date.now(),
		lastUpdatedAt: Date.now(),
		...data,
	});
}

export function documentUpdate(
	documentRef: DocumentReference,
	data = {}
): Promise<WriteResult> {
	return documentRef.update({
		lastUpdatedAt: Date.now(),
		...data,
	});
}

export async function getDocumentData<T>(
	document: DocumentReference
): Promise<T | undefined> {
	return document.get().then(snapshot => snapshot.data() as T | undefined);
}

export async function getDocumentsData<T>(
	documents: DocumentReference[],
	filterUndefined = true
): Promise<(T | undefined)[]> {
	return (
		await Promise.all(documents.map(async doc => getDocumentData<T>(doc)))
	).filter(data => !filterUndefined || data !== undefined);
}
