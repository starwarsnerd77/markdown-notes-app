import { useEffect, useState } from 'react';
import Markdown from 'marked-react';
import { signOut } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { collection, addDoc, getDocs, query, where, setDoc, doc } from "firebase/firestore"; 

type SavedDocs = {
    uid: number,
    did: string,
    title: string,
    note: string,
}

export const Editor = () => {
    const [text, setText] = useState('');
    const [viewMode, setViewMode] = useState('split');
    const [title, setTitle] = useState('Untitled');
    const [notes, setNotes] = useState<SavedDocs[]>([])
    const [currentDocId, setCurrentDocId] = useState('');
    const user = auth.currentUser;


    let view;
    if (viewMode === 'split') {
        view = (
            <div className='flex flex-row h-5/6 w-full'>
                <textarea placeholder='Type here...' className='editor font-mono border-none focus:outline-none focus:ring-0 h-full w-1/2 resize-none p-2' wrap="hard" value={text} onChange={(e) => {
                    setText(e.target.value);
                    const newTitle = e.target.value.split('\n', 1)[0]
                    setTitle(newTitle.substring(0, 1) === '#' ? newTitle.substring(1).trim() : newTitle.trim());
                }}/>
                <div className='w-1/2 h-full overflow-y-scroll p-2 border-l-2'>
                    <Markdown value={text} gfm/>
                </div>
            </div>
        );
    } else if (viewMode === 'markdown') {
        view = (
            <div className='flex flex-row h-5/6 w-full'>
                <textarea placeholder='Type here...' className='editor font-mono border-none focus:outline-none focus:ring-0 h-full w-full resize-none p-2' wrap="hard" value={text} onChange={(e) => {
                    setText(e.target.value);
                    const newTitle = e.target.value.split('\n', 1)[0]
                    setTitle(newTitle.substring(0, 1) === '#' ? newTitle.substring(1).trim() : newTitle.trim());
                }} />
            </div>
        );
    } else if (viewMode === 'html') {
        view = (
            <div className='flex flex-row h-5/6 w-full'>
                <div className='w-full h-full overflow-y-scroll'>
                    <Markdown value={text} gfm/>
                </div>
            </div>
        );
    }


    const handleSave = async () => {
        try {

            if (currentDocId !== '') {
                const docRef = await setDoc(doc(db, "notes", currentDocId), {
                    uid: auth.currentUser?.uid,
                    title: title,
                    note: text,
                });
                console.log("Document written with ID: ", currentDocId);
            } else {
                const docRef = await addDoc(collection(db, "notes"), {
                    uid: auth.currentUser?.uid,
                    title: title,
                    note: text,
                });
                console.log("Document written with ID: ", docRef.id);
            }
            getSavedDocs();
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    }

    const getSavedDocs = async () => {
        setNotes([]);
        const q = query(
            collection(db, "notes"),
            where("uid", "==", user?.uid)
        );
            
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
            const note: SavedDocs = {
                uid: doc.data().uid,
                did: doc.id,
                title: doc.data().title,
                note: doc.data().note,
            };

            setNotes(notes => [...notes, note]);
            // console.log(...result);
        });

    }

    useEffect(() => {
        getSavedDocs();
    }, []);


    return (
        <div className='flex flex-row'>
            <div className='w-1/5 hidden md:block border-r-gray-100 border-r-2'>
                <h3 className='font-normal mt-3'>Projects</h3>
                {notes.map((note, index) => (
                    <div key={index} onClick={() => {
                        setTitle(note.title);
                        setText(note.note);
                        setCurrentDocId(note.did);
                    }} className='text-left cursor-pointer'>
                        <p className='p-3'>{note.title}</p>
                        <hr/>
                    </div>
                ))}
            </div>
            <div className='m-0 flex flex-col content-start text-left h-screen w-full justify-center'>
                <div className='flex flex-row flex-wrap justify-between mb-2 items-center'>
                    <button onClick={async () => {setTitle('Untitled'); setText(''); setCurrentDocId('');}} className='bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 w-fit rounded'>
                        New Note
                    </button>
                    <div className='inline-flex justify-center'>
                        <button onClick={async () => {handleSave()}} className='bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 w-fit rounded-l'>
                            Save
                        </button>
                        <button onClick={() => signOut(auth)} className='bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 w-fit rounded-r'>
                            Sign Out
                        </button>
                    </div>
                </div>
                {view}
                <div className='inline-flex justify-center mt-5'>
                    <button onClick={() => setViewMode('markdown')} className='bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l'>
                        Markdown
                    </button>
                    <button onClick={() => setViewMode('html')} className='bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4'>
                        HTML
                    </button>
                    <button onClick={() => setViewMode('split')} className='bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r'>
                        Split
                    </button>
                </div>
            </div>
        </div>
    );
}