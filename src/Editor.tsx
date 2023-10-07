import { useEffect, useState } from 'react';
import Markdown from 'marked-react';
import { signOut } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { collection, addDoc, getDocs, query, where, setDoc, doc } from "firebase/firestore"; 
import './Editor.css';
import { NewFolderModal } from './NewFolderModal';

type SavedDocs = {
    did: string,
    title: string,
    note: string,
}

type Folders = {
    directory: string[]
}

export const Editor = () => {
    const [text, setText] = useState('');
    const [viewMode, setViewMode] = useState('split');
    const [title, setTitle] = useState('Untitled');
    const [notes, setNotes] = useState<SavedDocs[]>([])
    const [edit, setEdit] = useState(false);
    const [currentDocId, setCurrentDocId] = useState('');
    const [add, setAdd] = useState(false);
    const [createNewFolder, setCreateNewFolder] = useState(false);
    // const [newFolderName, setNewFolderName] = useState('');
    const [folders, setFolders] = useState<string[]>([]);

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
                if (user) {
                    await setDoc(doc(db, 'notes - ' + user.uid, currentDocId), {
                        title: title,
                        note: text,
                        type: 'note'
                    });
                    console.log("Document written with ID: ", currentDocId);
                } else {
                    console.error('Document not updated.')
                }
            } else {
                if (user) {
                    const docRef = await addDoc(collection(db, 'notes - ' + user.uid), {
                        title: title,
                        note: text,
                        type: 'note'
                    });
                    console.log("Document written with ID: ", docRef.id);
                } else {
                    console.error('Document not added.')
                }
            }
            getSavedDocs();
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    }

    const addFolder = async (newFolderName: string) => {
        try {
            if (user) {
                await addDoc(collection(db, 'notes - ' + user.uid + '/folders/' + newFolderName), {
                    title: newFolderName,
                    note: '# placeholder',
                    type: 'placeholder'
                });

                await setDoc(doc(db, 'notes - ' + user.uid, 'folders'), {
                    directory: [...folders, newFolderName],
                    note: '# directory',
                    title: 'You shouldn\'t be able to see this :(',
                    type: 'directory'
                });
                // console.log("Document written with ID: ", currentDocId);
            } else {
                console.error("Folder not added.");
            }
            getSavedFolders();
        } catch (e) {
            console.error("Error adding folder: ", e);
        }
    }

    const getSavedDocs = async () => {
        setNotes([]);

        const q = query(
            collection(db, 'notes - ' + user?.uid),
            where('type', '==', 'note')
        );
            
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
            const note: SavedDocs = {
                did: doc.id,
                title: doc.data().title,
                note: doc.data().note,
            };

            setNotes(notes => [...notes, note]);
        });

    }

    const getSavedFolders = async () => {
        setFolders([]);

        const q = query(
            collection(db, 'notes - ' + user?.uid),
            where('type', '==', 'directory')
        );

        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
            const newDirectory: Folders = {
                directory: doc.data().directory
            }
            setFolders(newDirectory.directory);
        })
    }

    useEffect(() => {
        getSavedFolders();
        getSavedDocs();
    }, []);


    return (
        <>
            <NewFolderModal
                hidden={!createNewFolder}
                onSubmit={(name: string) => {addFolder(name)}} 
                onClose={() => setCreateNewFolder(false)}
            />
            <div className='flex flex-row'>
                <div hidden={edit} className='w-full h-screen lg:w-1/5 lg:block relative border-r-gray-100 border-r-2'>
                    <h3 className='font-normal mt-3'>Notes</h3>
                    {folders.map((folder, index) => (
                        <div key={index} className='text-left cursor-pointer '>
                            <div className='w-full p-3 relative overflow-hidden'>
                                <p className='whitespace-nowrap overflow-x-auto scrollbar-hide'>{folder}</p>
                            </div>
                            <hr/>
                        </div>
                    ))}
                    {notes.map((note, index) => (
                        <div key={index} onClick={() => {
                            setTitle(note.title);
                            setText(note.note);
                            setCurrentDocId(note.did);
                            setEdit(true);
                        }} className='text-left cursor-pointer '>
                            <div className='w-full p-3 relative overflow-hidden'>
                                <p className='whitespace-nowrap overflow-x-auto scrollbar-hide'>{note.title}</p>
                            </div>
                            <hr/>
                        </div>
                    ))}

                    <div hidden={!add} className='flex flex-col text-left w-8/12 absolute bottom-20 right-5 bg-gray-300 rounded-md text-gray-700 font-bold'>
                        <div hidden={!add} onClick={() => {setCreateNewFolder(true); setAdd(false);}} className='flex-grow hover:bg-gray-400 rounded-t-md p-2 hover:cursor-pointer'>Folder</div>
                        <hr hidden={!add} />
                        <div hidden={!add} onClick={async () => {setTitle('Untitled'); setText(''); setCurrentDocId(''); setEdit(true); setAdd(false);}} className='flex-grow hover:bg-gray-400 rounded-b-md p-2 hover:cursor-pointer'>Document</div>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" onClick={() => setAdd(!add)} className="w-14 h-14 hover:cursor-pointer bg-gray-300 hover:bg-gray-400 stroke-gray-700 rounded-xl float-right absolute bottom-5 right-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                </div>
                <div className={'m-0 lg:flex flex-col content-start text-left h-screen w-full justify-center' + (!edit ? ' hidden' : '')}>
                    <div className='flex flex-row flex-wrap lg:justify-end justify-between mb-2 items-center'>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" onClick={() => setEdit(false)} className="w-8 h-8 lg:hidden">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>

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
                    <div className='inline-flex w-full justify-center mt-5'>
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
        </>
    );
}