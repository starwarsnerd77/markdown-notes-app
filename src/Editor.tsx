import { useState } from 'react';
import Markdown from 'marked-react';

export const Editor = () => {
    const [text, setText] = useState('');
    const [viewMode, setViewMode] = useState('split');

    // const markdown = '***abc*** abc';

    let view;
    if (viewMode === 'split') {
        view = (
            <div className='flex flex-row h-5/6 w-full'>
                <textarea className='editor font-mono border-2 h-full w-1/2 resize-none p-2' wrap="hard" value={text} onChange={(e) => setText(e.target.value)}/>
                <div className='w-1/2 h-full overflow-y-scroll p-2'>
                    <Markdown value={text} gfm/>
                </div>
            </div>
        );
    } else if (viewMode === 'markdown') {
        view = (
            <div className='flex flex-row h-5/6 w-full'>
                <textarea className='editor font-mono border-2 h-full w-full resize-none p-2' wrap="hard" value={text} onChange={(e) => setText(e.target.value)}/>
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
    return (
        <div className='flex flex-col content-start text-left h-screen justify-center'>
            {/* <div className='flex flex-row h-5/6 w-full'>
                <textarea className='editor font-mono border-2 h-full w-1/2 resize-none' wrap="hard" value={text} onChange={(e) => setText(e.target.value)}/>
                <div className='w-1/2 h-full overflow-y-scroll'>
                    <Markdown value={text} gfm/>
                </div>
            </div> */}
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
    );
}