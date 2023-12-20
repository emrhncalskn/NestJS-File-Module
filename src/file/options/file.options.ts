import { HttpException } from "@nestjs/common";
import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";
import { FileDestinationConstant, FileTypeConstant } from "./file.constant";
import { diskStorage } from 'multer';

export const FileUploadOptions = (): MulterOptions => ({
    dest: FileDestinationConstant.DEST,
    limits: {
        fileSize: 2097152, // 2MB
    },
    storage:
        diskStorage({
            destination: FileDestinationConstant.DEST,
            filename(req, file, cb) {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('')
                return cb(null, `${randomName}` + '.' + `${file.mimetype.split('/')[1]}`)
            },
        }),
    fileFilter: (req, file, cb) => {
        if (!file.originalname.match(FileTypeConstant.FILE)) {
            return cb(new HttpException("File Format Error", 400), false);
        }
        cb(null, true);
    }

})

export const FileApiOptions = () => ({  //swaggerda file upload gözükmesini sağlıyor
    schema: {
        type: 'object',
        properties: {
            file: {
                type: 'string',
                format: 'binary',
            },
        },
    },
})