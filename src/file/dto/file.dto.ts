import { ApiProperty } from "@nestjs/swagger";

export class FileDto {
    id: number;
    filename: string;
    path: string;
    alt: string;
    type_id: number;
}

export class FileTypeDto {
    id: number;
    @ApiProperty()
    name: string;
    @ApiProperty()
    type: string;
}

