class Config {
	get host() {
		return localStorage.getItem('redshift.host') || location.hostname
	}

	set host(ip) {
		return localStorage.setItem('redshift.host', ip)
	}
}

export default new Config
