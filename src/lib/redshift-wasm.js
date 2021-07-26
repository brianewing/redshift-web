const scriptTag = document.createElement('script')
scriptTag.setAttribute('src', '/assets/wasm_exec.js')
scriptTag.async = false
scriptTag.onload = run

document.body.appendChild(scriptTag)

function run() {
    const go = new Go();
    WebAssembly.instantiateStreaming(fetch('/assets/main.wasm'), go.importObject).then(result => {
        go.run(result.instance);
    });
}

window.RedshiftWasm = class RedshiftWasm {
    
}