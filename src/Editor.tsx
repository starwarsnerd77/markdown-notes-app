import { useState } from 'react';
import './Editor.css'
import Markdown from 'marked-react';

export const Editor = () => {
    const [text, setText] = useState('');

    // const markdown = '***abc*** abc';
    return (
        <div className='flex flex-col content-start text-left'>
            <textarea className='editor w-full h-100vh font-mono' wrap="hard" value={text} onChange={(e) => setText(e.target.value)}/>
            <Markdown value={text} gfm/>
        </div>
    );
}