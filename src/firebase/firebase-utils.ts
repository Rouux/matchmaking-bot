import { CollectionReference, DocumentReference, WriteResult } from "./firebase-types";

export function documentCreate(
	collectionRef: CollectionReference,
	data = {},
): Promise<DocumentReference> {
	return collectionRef.add({
		createdAt: Date.now(),
		lastUpdatedAt: Date.now(),
		...data,
	});
}

export function documentUpdate(
	documentRef: DocumentReference,
	data = {},
): Promise<WriteResult> {
	return documentRef.update({
		...data,
		lastUpdatedAt: Date.now(),
	});
}
