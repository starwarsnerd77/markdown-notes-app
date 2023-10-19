import { useEffect, useState } from 'react';
import Markdown from 'marked-react';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { collection, addDoc, query, where, setDoc, doc, onSnapshot } from "firebase/firestore"; 
import '../styles/Editor.css';
import { NewFolderModal } from './NewFolderModal';
import { IconFolder, IconNote } from '@tabler/icons-react';
import { saveDoc } from '../database/docs';

type Doc = {
    did: string,
    title: string,
    note: string,
}

interface Folder {
    name: string,
    folders: Folder[],
    docs: Doc[],
}

interface ViewItemType {
    textarea: string,
    markdown: string,
}

interface ViewType {
    split: ViewItemType,
    markdown: ViewItemType,
    html: ViewItemType,
}

export const Editor = () => {
    const [note, setNote] = useState('');
    const [viewMode, setViewMode] = useState<string>('split');
    const [viewModeClassesTextarea, setViewModeClassesTextarea] = useState('w-1/2');
    const [viewModeClassesMarkdown, setViewModeClassesMarkdown] = useState('w-1/2 p-2 border-l-2');
    const [title, setTitle] = useState('Untitled');
    const [notes, setNotes] = useState<Doc[]>([])
    const [edit, setEdit] = useState(false);
    const [docID, setDocID] = useState('');
    const [add, setAdd] = useState(false);
    const [createNewFolder, setCreateNewFolder] = useState(false);
    const [folders, setFolders] = useState<Folder[]>([]);

    const user = auth.currentUser;

    const view: ViewType = {
        split: {
            'textarea': 'w-1/2',
            'markdown': 'w-1/2 p-2 border-l-2',
        },
        markdown: {
            'textarea': 'w-full',
            'markdown': 'invisible absolute',
        },
        html: {
            'textarea': 'invisible absolute',
            'markdown': 'w-full p-2',
        },
    }

    useEffect(() => {
        setViewModeClassesTextarea(view[viewMode as keyof ViewType]['textarea'])
        setViewModeClassesMarkdown(view[viewMode as keyof ViewType]['markdown'])
    }, [viewMode])

    const addFolder = async (newFolderName: string) => {

        const newFolder: Folder = {
            name: newFolderName,
            folders: [],
            docs: [],
        }
        try {
            if (user) {
                await addDoc(collection(db, 'notes - ' + user.uid + '/folders/' + newFolderName), {
                    title: newFolderName,
                    note: '# placeholder',
                    type: 'placeholder'
                });
                if (folders) {
                    await setDoc(doc(db, 'notes - ' + user.uid, 'folders'), {
                        directory: [...folders, newFolder],
                        note: '# directory',
                        title: 'You shouldn\'t be able to see this :(',
                        type: 'directory'
                    });
                } else {
                    await setDoc(doc(db, 'notes - ' + user.uid, 'folders'), {
                        directory: [newFolder],
                        note: '# directory',
                        title: 'You shouldn\'t be able to see this :(',
                        type: 'directory'
                    });
                }
            } else {
                console.error("Folder not added.");
            }
        } catch (e) {
            console.error("Error adding folder: ", e);
        }
    }

    useEffect(() => {
        
        const q = query(
            collection(db, 'notes - ' + user?.uid),
            where('type', '==', 'note')
            );

        const unsub = onSnapshot(q, (querySnapshot) => {
            setNotes([]);

            querySnapshot.forEach((doc) => {
                const note: Doc = {
                    did: doc.id,
                    title: doc.data().title,
                    note: doc.data().note,
                };
    
                setNotes(notes => [...notes, note]);
            });
        });

        return unsub;
    }, []);

    useEffect(() => {
        const q = query(
            collection(db, 'notes - ' + user?.uid),
            where('type', '==', 'directory')
        );

        const unsub = onSnapshot(q, (querySnapshot) => {
            setFolders([]);

            querySnapshot.forEach((doc) => {
                const directory: Folder[] = doc.data().directory;

                setFolders(directory);
            })
        })

        return unsub;
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
                            <div className='w-full p-3 relative overflow-hidden flex'>
                                <p className='whitespace-nowrap overflow-x-auto scrollbar-hide'><IconFolder className='inline-block mr-2'/>{folder.name}</p>
                            </div>
                            <hr/>
                        </div>
                    ))}
                    {notes.map((note, index) => (
                        <div key={index} onClick={() => {
                            setTitle(note.title);
                            setNote(note.note);
                            setDocID(note.did);
                            setEdit(true);
                        }} className='text-left cursor-pointer'>
                            <div className='w-full p-3 relative flex'>
                                <p className='whitespace-nowrap overflow-x-auto scrollbar-hide'><IconNote className='inline-block mr-2'/>{note.title}</p>
                            </div>
                            <hr/>
                        </div>
                    ))}

                    <div hidden={!add} className='flex flex-col text-left w-8/12 absolute bottom-20 right-5 bg-gray-300 rounded-md text-gray-700 font-bold'>
                        <div hidden={!add} onClick={() => {setCreateNewFolder(true); setAdd(false);}} className='flex-grow hover:bg-gray-400 rounded-t-md p-2 hover:cursor-pointer'>Folder</div>
                        <hr hidden={!add} />
                        <div hidden={!add} onClick={async () => {setTitle('Untitled'); setNote(''); setDocID(''); setEdit(true); setAdd(false);}} className='flex-grow hover:bg-gray-400 rounded-b-md p-2 hover:cursor-pointer'>Document</div>
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
                            <button onClick={async () => {saveDoc({docID, title, note})}} className='bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 w-fit rounded-l'>
                                Save
                            </button>
                            <button onClick={() => signOut(auth)} className='bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 w-fit rounded-r'>
                                Sign Out
                            </button>
                        </div>
                    </div>
                    <div className='flex flex-row h-5/6 w-full'>
                        <textarea placeholder='Type here...' className={'editor font-mono border-none focus:outline-none focus:ring-0 h-full resize-none p-2 ' + viewModeClassesTextarea} wrap="hard" value={note} onChange={(e) => {
                            setNote(e.target.value);
                            const newTitle = e.target.value.split('\n', 1)[0]
                            setTitle(newTitle.substring(0, 1) === '#' ? newTitle.substring(1).trim() : newTitle.trim());
                        }}/>
                        <div className={'h-full overflow-y-scroll ' + viewModeClassesMarkdown}>
                            <Markdown value={note} gfm/>
                        </div>
                    </div>
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