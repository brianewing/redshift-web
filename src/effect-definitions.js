import WebDAV from './lib/webdav';
import Config from './config';

const EFFECTS_URL = `http://${Config.host}:9393`

const webDavFs = new WebDAV.Fs(EFFECTS_URL)

export function fetch() {
  // todo: error handling
	return new Promise((resolve, reject) => {
		webDavFs.dir('/').children((files) => {
      if(String.prototype.localeCompare)
        files.sort((a, b) => a.name.localeCompare(b.name))

			resolve(files)
		})
	})
}

export function load(filename) {
  // todo: error handling
	return new Promise((resolve, reject) => {
		webDavFs.dir('/').file(filename).read((contents) => resolve(contents))
	})
}

export function save(filename, contents) {
  // todo: error handling
	return new Promise((resolve, reject) => {
		webDavFs.dir('/').file(filename).write(contents, () => resolve())
	})
}
