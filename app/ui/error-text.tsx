import React from 'react';

export default function ErrorText({ errorMessage }: { errorMessage: string }) {
    return (
        <p className="mt-2 text-sm text-red-500">
            {errorMessage}
        </p>
    );
}

export function ErrorTextDisplay({ elemid, error_list }: { elemid: string, error_list: Array<string> | undefined }) {
    return (
        <div id={elemid} aria-live="polite" aria-atomic="true">
        {error_list &&
            error_list.map((error: string) => (
                <ErrorText errorMessage={error} key={error}/>
            ))}
        </div>)
}

