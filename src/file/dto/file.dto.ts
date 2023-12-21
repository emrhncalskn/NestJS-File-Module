import { ApiProperty } from "@nestjs/swagger";

export class FileDto {
    id?: number;
    filename: string;
    path: string;
    mimetype: string;
    originalname: string;
    alt?: string;
    type_id?: number;
}

export class FileTypeDto {
    id: number;
    @ApiProperty()
    name: string;
    @ApiProperty()
    type: string;
}

