import WebDAV from './lib/webdav';
import Config from './config';

const EFFECTS_URL = `http://${Config.host}:9393`

const webDavFs = new WebDAV.Fs(EFFECTS_URL)

export function fetch() {
	return new Promise((resolve, reject) => {
		webDavFs.dir('/').children((files) => {
			''.localeCompare && files.sort((a, b) => a.name.localeCompare(b.name))

			resolve(files)
		})
	})
}

export function load(filename) {
	console.log('load', filename)
	return new Promise((resolve, reject) => {
		webDavFs.dir('/').file(filename).read((contents) => resolve(contents))
	})
}

export function save(filename, contents) {
	console.log('save', filename)
	return new Promise((resolve, reject) => {
		webDavFs.dir('/').file(filename).write(contents, () => resolve())
	})
}
