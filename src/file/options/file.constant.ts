import { FileTypeDto } from "../dto/file.dto";

export class FileTypeConstant {
    static FILE: RegExp;

    static setFileTypes(fileTypes: FileTypeDto[]) {
        let types = fileTypes.map(fileType => fileType.name);
        const regexFormat = new RegExp(`(${types.join('|')})$`);
        this.FILE = regexFormat;
    }


    static IMAGE = 'image';
    static IMAGE_PATH = 'images';

    static DOCUMENT = 'document';
    static DOCUMENT_PATH = 'documents';
}


export class FileDestinationConstant {
    static readonly DEST = './assets/files/uploads/';
}
