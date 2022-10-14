import { FileData } from "./file-data";

declare global {
    interface Window {
        showOpenFilePicker(options?: any): Promise<[any]>;
        showSaveFilePicker(options?: any): Promise<any>;
    }
}

export module TodoTxtUtils {
    export function formatDate(dateObj: Date): string {
        var yyyy = dateObj.getFullYear();
        var mm = (dateObj.getMonth()+1).toString(); // getMonth() is zero-based
        mm = mm.length < 2 ? "0" + mm : mm;
        var dd  = (dateObj.getDate()).toString();
        dd = dd.length < 2 ? "0" + dd : dd;
        return String(yyyy + "-" + mm + "-" + dd); // Leading zeros for mm and dd
    }

    export function htmlEncode(str: string): string {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/\s{2}/g, ' &nbsp;');
    }

    export async function readFile(): Promise<FileData> {
        let [handle] = await window.showOpenFilePicker();
        const file = await handle.getFile();
        const text = await file.text();
        return {text: text, name: file.name, path: file.webkitRelativePath, size: file.size};
    }

    export async function saveToFile(data: FileData): Promise<void> {
        const options = {
            suggestedName: data.name || 'todo.txt',
            types: [
              {
                description: "ToDo.txt file",
                accept: {
                  "text/plain": [".txt"],
                },
              },
            ],
          };
        const handle = await window.showSaveFilePicker(options);
        const file = await handle.createWritable();
        await file.write(data.text || '');
        await file.close();
    }
}
