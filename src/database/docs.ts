import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";

type SaveDocProps = {
    docID: string,
    title: string,
    note: string,
}

const user = auth.currentUser;

export const saveDoc = async ({docID, title, note}: SaveDocProps) => {
    if (docID !== '') {
        // console.log('here');
        await setDoc(doc(db, 'notes - ' + user?.uid, docID), {
            title,
            note,
            type: 'note'
        });
    } else {
        await addDoc(collection(db, 'notes - ' + user?.uid), {
            title,
            note,
            type: 'note'
        });
    }
}