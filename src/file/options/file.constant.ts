import { FileService } from "../file.service";

export class FileTypeConstant {

    static FILE = /(docx|pdf|xlsx|jpg|png|jpeg)$/;
    static DOCUMENT = /(docx|pdf|xlsx)$/;
    static IMAGE = /(jpg|png|jpeg)$/;
    static IMAGE_PATH = 'images';
    static DOCUMENT_PATH = 'documents';
}


export class FileDestinationConstant {
    static readonly DEST = './assets/files/uploads/';
}
