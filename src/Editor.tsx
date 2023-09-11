import { useState } from 'react';
import './Editor.css'
import Markdown from 'marked-react';

export const Editor = () => {
    const [text, setText] = useState('');

    // const markdown = '***abc*** abc';
    return (
        <div className='flex flex-row content-start text-left h-screen'>
            <textarea className='editor font-mono border-2 h-5/6 w-1/2' wrap="hard" value={text} onChange={(e) => setText(e.target.value)}/>
            <div className='w-1/2 h-5/6 overflow-y-scroll'>
                <Markdown value={text} gfm/>
            </div>
        </div>
    );
}