import md5 from 'md5';

export function hash(string) {
    return md5(string);
}
