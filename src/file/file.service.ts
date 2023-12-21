import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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
    }

    async listFilePaths(path: string) {
        let documents = [];

        try {
            let files = [];
            if (path == 'all' || path == 'All' || path == 'ALL') {
                files = await fsPromises.readdir(FileDestinationConstant.DEST, { recursive: true, encoding: 'utf-8' });
                files.forEach(file => {
                    const new_path = file.replace(/\\/g, '/');
                    if (new_path.split('/').length < 2) { return; } // Exclude files when listing all items ('all', 'All', or 'ALL'), only include directories.
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

    async uploadFile(file: FileDto, route: string) {

        const type = file.originalname.split('.')[1];
        file.alt = await this.fillEmpty(file.originalname);

        const findType = await this.findFileType(type);
        if (!findType) { throw new HttpException('File not found', HttpStatus.NOT_FOUND); }

        let path = findType.type;

        const pathFix = file.path.replace(/\\/g, '/'), oldPath = pathFix.replace(file.filename, '');
        const newPath = `${oldPath}${route}/${path}`;
        file.mimetype = type;
        file.type_id = findType.id;
        file.path = `/${route}/${path}/${file.filename}`;
        await this.createFile(file);


        if (!fs.existsSync(newPath)) { fs.mkdirSync(newPath, { recursive: true }); }
        fs.renameSync(`${oldPath}${file.filename}`, `${newPath}/${file.filename}`);
        return file;
    }

    async loadFiles() {
        const files = fs.readFileSync(FILES_PATH, 'utf8');
        this.files = JSON.parse(files);
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
        const file = this.files.find((file) => file.id === Number(id));
        if (!file) { throw new HttpException('File not found', HttpStatus.NOT_FOUND); }
        return file;
    }

    async findFileType(name: string) {
        const file_type = this.file_type.find((file_type) => file_type.name === name);
        if (!file_type) { throw new HttpException('File type not found', HttpStatus.NOT_FOUND); }
        return file_type;
    }

    async getFiles() {
        const files = this.files;
        if (files.length < 1) { throw new HttpException('File not found', HttpStatus.NOT_FOUND); }
        return files;
    }

    async getFileTypes() {
        const file_types = this.file_type;
        if (file_types.length < 1) { throw new HttpException('File type not found', HttpStatus.NOT_FOUND); }
        return file_types;
    }

    async getFilesByType(type: string) {
        const file_type = await this.findFileType(type);
        if (!file_type) { throw new HttpException('File type not found', HttpStatus.NOT_FOUND); }
        const files = this.files.filter((file) => file.type_id === file_type.id);
        if (files.length < 1) { throw new HttpException('File not found', HttpStatus.NOT_FOUND); }
        return files;
    }

    async deleteFolderIfEmpty(folderPath: string) {
        try {
            const folderContents = await fsPromises.readdir(folderPath);

            if (folderContents.length === 0) {
                // If the folder is empty, check the previous folder
                const parentFolderPath = folderPath.substring(0, folderPath.lastIndexOf('/')); // Path to the previous folder
                await fsPromises.rm(folderPath, { recursive: true }); // Check the previous folder and delete it if it is empty
                if (parentFolderPath !== FileDestinationConstant.DEST) { // If the path to the previous folder is not the path to the main folder
                    await this.deleteFolderIfEmpty(parentFolderPath);
                }
            }
        } catch (error) {
            console.error('Error while checking and deleting folder:', error);
        }
    }

    async deleteFile(id: number) {
        let msg = null;
        const file: FileDto = await this.findFileById(id);
        if (!file) { throw new HttpException('File not found', HttpStatus.NOT_FOUND); }

        const path = file.path.replace(/\\/g, '/');

        const index = this.files.indexOf(file);
        this.files.splice(index, 1);
        this.saveFiles();

        const isFileExists = await this.isFileExists(FileDestinationConstant.DEST + path);
        if (!isFileExists) msg = 'File not found on folder path but succesfully deleted anyway.';

        try { // if someone delete file by manually
            await fsPromises.unlink(FileDestinationConstant.DEST + path);
        } catch (error) {
            msg = 'File not found on folder path but successfully deleted anyway.';
        }

        // Delete folder and previous folder
        const folderPath = path.substring(0, path.lastIndexOf('/')); // Get folder path from file path
        await this.deleteFolderIfEmpty(FileDestinationConstant.DEST + folderPath);
        if (msg) throw new HttpException(msg, HttpStatus.OK)
        throw new HttpException('File deleted successfully', HttpStatus.OK);
    }

    async isFileExists(path: string) {
        return new Promise((resolve, reject) => {
            fs.access(path, fs.constants.F_OK, (error) => {
                if (error) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });
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

}
