import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";

export type Doc = {
    title: string;
    note: string;
    path: string[];
}

export type Folder = {
    title: string;
    path: string[];
    docs: Doc[];
    folders: Folder[];
}

export const isFolder = (obj: Folder | Doc): obj is Folder => {
    return 'folders' in obj;
}

export const getListOfChildren = (root: Folder): Array<Doc | Folder> => {
    const children: Array<Doc | Folder> = [];

    const queue: Array<Doc | Folder> = [...root.folders, ...root.docs];

    while (queue.length > 0) {
        const current: Doc | Folder = queue.splice(0, 1)[0];

        children.push(current);
        
        if (isFolder(current)) {

            (current as Folder).docs.map((doc, index) => {
                queue.splice(index, 0, doc);
            });
    
            (current as Folder).folders.map((folder, index) => {
                queue.splice(index, 0, folder);
            });
        }

    }

    return children;
}

const findFolder = (path: string[], path_i: number, current: Folder): Folder => {
    if (path_i >= path.length) {
        return current;
    }

    let found: Folder | null = current;

    current.folders.forEach((folder) => {

        if (folder.title === path.at(path_i)) {
            found = findFolder(path, path_i + 1, folder);
        }

    });

    return found;
}

const save = async ( obj: Doc | Folder, root: Folder, type: 'docs' | 'folders') => {
    const user = auth.currentUser;

    const new_root: Folder = {
        title: 'root',
        path: [],
        docs: root.docs.slice(),
        folders: root.folders.slice(),
    }

    const folder_to_insert = findFolder(obj.path, 0, new_root);

    let exists: boolean = false;
    let exists_i: number = 0;

    const itemArray: Doc[] | Folder[] = (folder_to_insert[type as keyof Folder] as Doc[] | Folder[]);


    itemArray.map((item, index) => {
        if (item.title === obj.title) {
            exists = true;
            exists_i = index;
        }
    });

    if (!exists) {
        itemArray.push(obj as Doc & Folder);
    } else {
        itemArray[exists_i] = obj;
    }
    
    await setDoc(doc(db, 'notes', user?.uid ?? ''), {
        title: new_root.title,
        path: new_root.path,
        docs: new_root.docs,
        folders: new_root.folders
    });
    
}

export const saveDoc = async (new_doc: Doc, root: Folder) => {
    save(new_doc, root, 'docs');
}

export const saveFolder = async (new_folder: Folder, root: Folder) => {
    console.log('here')
    save(new_folder, root, 'folders');
}