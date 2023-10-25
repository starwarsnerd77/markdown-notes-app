import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";

type SaveDocProps = {
    docID: string,
    title: string,
    note: string,
    path: string[],
}

export const saveDoc = async ({docID, title, note, path}: SaveDocProps) => {

    const user = auth.currentUser;
    
    if (docID !== '') {
        await setDoc(doc(db, 'notes - ' + user?.uid, docID), {
            title,
            note,
            type: 'note',
            path,
        });
    } else {
        await addDoc(collection(db, 'notes - ' + user?.uid), {
            title,
            note,
            type: 'note',
            path,
        });
    }
}