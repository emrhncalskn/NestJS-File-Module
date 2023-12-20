export class FileTypeConstant {
    static readonly FILE = /(jpg|png|jpeg|docx|pdf|xlsx)$/;
    static readonly DOCUMENT = /(docx|pdf|xlsx)$/;
    static readonly IMAGE = /(jpg|png|jpeg)$/;
    static IMAGE_PATH = 'images';
    static DOCUMENT_PATH = 'documents';
}

export class FileDestinationConstant {
    static readonly DEST = './assets/files/uploads/';
}