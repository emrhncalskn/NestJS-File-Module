import { Injectable } from '@nestjs/common';
import { FileTypeDto, FileDto } from './dto/file.dto';
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
        this.loadFileTypes();
    }

    async listFilePaths(path: string) {
        let documents = [];

        try {
            let files = [];
            if (path == 'all' || path == 'All' || path == 'ALL') {
                files = await fsPromises.readdir(FileDestinationConstant.DEST, { recursive: true, encoding: 'utf-8' });
                files.forEach(file => {
                    const new_path = file.replace(/\\/g, '/');
                    if (new_path.split('/').length < 2) { return; }
                    documents.push({ file: `/${new_path}` });
                });
            } else {
                files = await fsPromises.readdir(FileDestinationConstant.DEST + path);
                files.forEach(file => {
                    documents.push({ file: `/${path}/${file}` });
                });
            }


            return { documents };
        } catch (err) {
            console.error('File reading error:', err);
            return { documents: [] };
        }
    }

    async uploadFile(fileDto: FileDto, route: string, type: string) {
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
        return `/${route}/${path}/${file.filename}`
    }

    async loadFiles() {
        const files = fs.readFileSync(FILES_PATH, 'utf8');
        this.files = JSON.parse(files);
    }

    async loadFileTypes() {
        const file_type = fs.readFileSync(FILES_TYPE_PATH, 'utf8');
        this.file_type = JSON.parse(file_type);
    }

    async saveFiles() {
        fs.writeFileSync(FILES_PATH, JSON.stringify(this.files));
        return true;
    }

    async saveFileType() {
        fs.writeFileSync(FILES_TYPE_PATH, JSON.stringify(this.file_type));
        return true;
    }

    async autoIncrementFile() {
        const id = Math.max(...this.files.map((file) => file.id)) + 1;
        if (id < 1) return 1;
        return id;
    }

    async autoIncrementFileType() {
        const id = Math.max(...this.file_type.map((file_type) => file_type.id)) + 1;
        if (id < 1) return 1;
        return id;
    }

    async createFile(file: FileDto) {
        file.id = await this.autoIncrementFile();
        this.files.push(file);
        this.saveFiles();
        return file;
    }

    async createFileType(file_type: FileTypeDto) {
        file_type.id = await this.autoIncrementFileType();
        this.file_type.push(file_type);
        this.saveFileType();
        return file_type;
    }

    async findFileById(id: number) {
        const file = this.files.find((file) => file.id === id);
        if (!file) return { errorMessage: 'File not found' }
        return file;
    }

    async findFileType(name: string) {
        const file_type = this.file_type.find((file_type) => file_type.name === name);
        if (!file_type) return { errorMessage: 'File type not found' }
        return file_type;
    }

    async getFiles() {
        const files = this.files;
        if (files.length < 1) return { errorMessage: 'Files not found' }
        return files;
    }

    async getFileTypes() {
        const file_types = this.file_type;
        return file_types;
    }

    async getFilesByType(type_id: number) {
        const files = this.files.filter((file) => file.type_id === type_id);
        if (!files) return { errorMessage: 'Files not found' }
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

    async fillEmpty(value: string) {
        const tr = await this.convertTurkishWords(value);
        const text = tr
            .toLowerCase()
            .replace(/[\s_-]+/g, '_')
            .trim();
        return text;
    }

    async getTypesRegexFormat() {
        const file_types = await this.getFileTypes();
        console.log(file_types)
        const formats = []

        for (let i = 0; i < file_types.length; i++) {
            formats.push(file_types[i].name)
        }
        console.log(formats)
        const regexFormat = new RegExp(`(${formats.join('|')})$`);
        console.log(regexFormat)
        return regexFormat;
    }

}
