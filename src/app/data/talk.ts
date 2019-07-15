import Tag from './tag';

export default interface Talk {
    name: string;
    description: string;
    language?: string;
    tags: Tag[];
}
