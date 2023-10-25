import { useEffect, useState } from "react";

type NewFolderModalProps = {
    hidden: boolean;
    onSubmit: (name: string) => void;
    onClose: () => void;
}


export const NewFolderModal = ({ hidden, onSubmit, onClose }: NewFolderModalProps) => {

    const [folderName, setFolderName] = useState('');

    const handleSubmit = () => {
        onSubmit(folderName);
        onClose();
    }

    const closeOnEnterOrEscapeKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            setFolderName('');
            onClose();
        }
    }

    useEffect(() => {
        document.body.addEventListener('keydown', closeOnEnterOrEscapeKeyDown)
        return function cleanup() {
            document.body.removeEventListener('keydown', closeOnEnterOrEscapeKeyDown);
        }
    }, []);

    return (
        <div className={"h-full w-full absolute flex justify-center items-center align-middle z-50 bg-black bg-opacity-60 text-black " + (hidden ? 'hidden' : '')}>
            <div className="flex flex-col h-fit w-fit bg-white p-4 rounded-lg">
                <label className="w-fit mb-2">New Folder</label>
                <input onKeyDown={(e) => {if (e.key === 'Enter') handleSubmit();}} value={folderName} onChange={(e) => setFolderName(e.target.value)} type="text" placeholder="Enter name here..." className="w-96" />
            </div>
        </div>
    );
}
