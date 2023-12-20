import { Injectable } from '@nestjs/common';
import { UploadFileDto } from './dto/file.dto';
import { FileDestinationConstant, FileTypeConstant } from './options/file.constant';
import * as fs from 'fs';
import * as fsPromises from 'fs/promises';

const FILES_PATH = './src/files.json';
const FILES_TYPE_PATH = './src/file_types.json';

@Injectable()
export class FileService {

    private files = [];
    private file_type = [];

    constructor() {
        this.loadFiles();
    }

    async getFileMenus(type: string) {
        let documents = [];

        try {
            let files = [];
            if (type == 'all' || type == 'All' || type == 'ALL') {
                files = await fsPromises.readdir(FileDestinationConstant.DEST, { recursive: true, encoding: 'utf-8' });
                files.forEach(file => {
                    const new_path = file.replace(/\\/g, '/'); // Burada da \\ getiriyordu onları / ile değiştirdik
                    if (new_path.split('/').length < 2) { return; } //  /xx/xx.png şeklinde olanları gostersin diye tek '/' olanları göstermemesını sagladık
                    documents.push({ file: `/${new_path}` });
                });
            } else {
                files = await fsPromises.readdir(FileDestinationConstant.DEST + type);
                files.forEach(file => {
                    documents.push({ file: `/${type}/${file}` });
                });
            }


            return { documents };
        } catch (err) {
            console.error('File reading error:', err);
            return { documents: [] };
        }
    }

    /* async getImageMenus(type: string) {
         let images = [];
 
         try {
             let files = [];
             if (type == 'all' || type == 'All' || type == 'ALL') {
                 files = await fsPromises.readdir(ImageDestinationConstant.DEST, { recursive: true, encoding: 'utf-8' });
                 files.forEach(file => {
                     const new_path = file.replace(/\\/g, '/'); // Burada da \\ getiriyordu onları / ile değiştirdik
                     if (new_path.split('/').length < 2) { return; } //  /xx/xx.png şeklinde olanları gostersin diye tek '/' olanları göstermemesını sagladık
                     images.push({ image: `/${new_path}` });
                 });
             } else {
                 files = await fsPromises.readdir(ImageDestinationConstant.DEST + type);
                 files.forEach(file => {
                     images.push({ image: `/${type}/${file}` });
                 });
             }
             return { images };
         } catch (err) {
             console.error('Dosya okuma hatası:', err);
             return { images: [] };
         }
     }*/

    async uploadFile(fileDto: UploadFileDto, route: string, type: string) {
        const findType = await this.findFileType(type);
        if (!findType) { return 404; }
        fileDto.type_id = findType.id;

        let path = FileTypeConstant.DOCUMENT_PATH;
        const isImage = FileTypeConstant.IMAGE.test(type);
        if (isImage) { path = FileTypeConstant.IMAGE_PATH; }
        const file = await this.createFile(fileDto);

        const pathFix = file.path.replace(/\\/g, '/'), oldPath = pathFix.replace(file.filename, '');
        const newPath = `${oldPath}${route}/${path}`;

        if (!fs.existsSync(newPath)) { fs.mkdirSync(newPath, { recursive: true }); }
        fs.renameSync(file.path, `${newPath}/${file.filename}`);
        return `/${route}/${file.filename}`
    }

    async loadFiles() {
        const files = fs.readFileSync(FILES_PATH, 'utf8');
        this.files = JSON.parse(files);
        const file_types = fs.readFileSync(FILES_TYPE_PATH, 'utf8');
        this.file_type = JSON.parse(file_types);
    }

    async saveFiles() {
        fs.writeFileSync(FILES_PATH, JSON.stringify(this.files));
        return true;
    }

    async saveFileType() {
        fs.writeFileSync(FILES_TYPE_PATH, JSON.stringify(this.file_type));
        return true;
    }

    async autoIncrement() {
        return Math.max(...this.files.map((file) => file.id)) + 1;
    }

    async createFile(file: UploadFileDto) {
        this.files.push(file);
        this.saveFiles();
        return file;
    }

    async createFileType(file_type: UploadFileDto) {
        this.file_type.push(file_type);
        this.saveFileType();
        return file_type;
    }

    async findFileById(id: number) {
        return this.files.find((file) => file.id === id);
    }

    async findFileType(name: string) {
        return this.file_type.find((file_type) => file_type.name === name);
    }

    async getFiles() {
        return this.files;
    }

    async getFileTypes() {
        return this.file_type;
    }

    async getFilesByType(type_id: number) {
        return this.files.filter((file) => file.type_id === type_id);
    }

    async convertTurkishWords(text: string) {
        const turkishChars = 'çğıöşüÇĞİÖŞÜ ';
        const englishChars = 'cgiosuCGIOSU-';

        let result = '';

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const index = turkishChars.indexOf(char);

            if (index !== -1) {
                result += englishChars[index];
            } else {
                result += char === ' ' ? '-' : char;
            }
        }

        return result.toLowerCase();
    }

    async fillEmptyWithUnderline(value: string) {
        const tr = await this.convertTurkishWords(value);
        const slug = tr
            .toLowerCase()
            .replace(/[\s_-]+/g, '_')
            .trim();
        return slug;
    }

}
