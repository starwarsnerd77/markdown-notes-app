import { useEffect, useState } from 'react';
import Markdown from 'marked-react';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { collection, query, where, setDoc, doc, onSnapshot } from "firebase/firestore"; 
import '../styles/Editor.css';
import { NewFolderModal } from './NewFolderModal';
import { IconFolder, IconNote, IconPlus } from '@tabler/icons-react';
import { saveDoc } from '../database/docs';

type Doc = {
    docID: string,
    title: string,
    note: string,
    path: string[],
}

interface Folder {
    title: string,
    path: string[]
    folders: Folder[],
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
    const [notes, setNotes] = useState<Doc[]>([]);
    const [edit, setEdit] = useState(false);
    const [docID, setDocID] = useState('');
    const [add, setAdd] = useState(false);
    const [createNewFolder, setCreateNewFolder] = useState(false);
    const [path, setPath] = useState<string[]>([]);
    const root_default: Folder = {
        title: 'root',
        path: [],
        folders: [],
    }
    const [root, setRoot] = useState<Folder>(root_default);
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

    useEffect(() => {
        const q = query(
            collection(db, 'notes - ' + user?.uid),
            where('type' , '==', 'directory'),
        )

        const unsub = onSnapshot(q, (querySnapshot) => {
            querySnapshot.forEach((doc) => {

                const new_root = {
                    title: 'root',
                    path: [],
                    folders: []
                }

                new_root.folders = doc.data().directory;
                setRoot(new_root);

            })
        });

        return unsub;
    }, [])

    useEffect(() => {
        
        const q = query(
            collection(db, 'notes - ' + user?.uid),
            where('type', '==', 'note')
            );

        const unsub = onSnapshot(q, (querySnapshot) => {
            setNotes([]);

            querySnapshot.forEach((doc) => {
                const note: Doc = {
                    docID: doc.id,
                    title: doc.data().title,
                    note: doc.data().note,
                    path: doc.data().path,
                };
    
                setNotes(notes => [...notes, note]);
            });
        });

        return unsub;
    }, []);

    useEffect(() => {
        let queue: Folder[] = [...root.folders];

        const new_folders = [];

        while (queue.length > 0) {
            const current = queue.splice(0, 1)[0];
            
            if (current) {
                new_folders.push(current);
    
                current.folders.forEach((folder) => {
                    queue.splice(0, 0, folder);
                });

            }
        }

        setFolders(new_folders);
    }, [notes, root]);

    const findFolder = (path_i: number, current: Folder): Folder => {
        if (path_i >= path.length) {
            return current;
        }

        let found: Folder | null = null;

        current.folders.forEach((folder) => {

            if (folder.title === path.at(path_i)) {
                found = findFolder(path_i + 1, folder);
            }

        });

        return found ?? current;
    }

    const saveFolder = async (name: string) => {
        const newFolder: Folder = {
            title: name,
            path: path.slice(),
            folders: [],
        }
        
        newFolder.path.push(name);
        
        const found: Folder = findFolder(0, root);

        found.folders.push(newFolder);

        await setDoc(doc(db, 'notes - ' + user?.uid, 'folders'), {
            directory: root.folders,
            type: 'directory',
        });
    }

    return (
        <>
            <NewFolderModal
                hidden={!createNewFolder}
                onSubmit={saveFolder} 
                onClose={() => setCreateNewFolder(false)}
            />
            <div className='flex flex-row'>
                <div hidden={edit} className='w-full h-screen lg:w-1/5 lg:block relative border-r-gray-100 border-r-2'>
                    <h3 className='font-normal mt-3'>Notes</h3>
                    {folders.map((folder, index) => (
                        <div key={index} onClick={() => setPath(folder.path)} className='text-left cursor-pointer'>
                            <div 
                                className={`w-full relative overflow-hidden flex py-3 pr-3`}
                                style={{
                                    paddingLeft: `${((folder.path.length - 1) * .75) + .75}rem`
                                }}>
                                <p className='whitespace-nowrap overflow-x-auto scrollbar-hide'><IconFolder className='inline-block mr-2'/>{folder.title}</p>
                            </div>
                            <hr/>
                        </div>
                    ))}
                    {notes.map((note, index) => (
                        <div key={index} onClick={() => {
                            setTitle(note.title);
                            setNote(note.note);
                            setDocID(note.docID);
                            setEdit(true);
                            setPath(note.path);
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
                    <IconPlus onClick={() => setAdd(!add)} className="w-14 h-14 hover:cursor-pointer bg-gray-300 hover:bg-gray-400 stroke-gray-700 rounded-xl float-right absolute bottom-5 right-5"/>
                </div>
                <div className={'m-0 lg:flex flex-col content-start text-left h-screen w-full justify-center' + (!edit ? ' hidden' : '')}>
                    <div className='flex flex-row flex-wrap lg:justify-end justify-between mb-2 items-center'>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" onClick={() => setEdit(false)} className="w-8 h-8 lg:hidden">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>

                        <div className='inline-flex justify-center'>
                            <button onClick={async () => {saveDoc({docID, title, note, path: path})}} className='bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 w-fit rounded-l'>
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
                        <button onClick={() => setViewMode('split')} className='bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4'>
                            Split
                        </button>
                        <button onClick={() => setViewMode('html')} className='bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r'>
                            HTML
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}