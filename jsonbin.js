function JSONBinAPI(access, master) {
	
  const store = new Map();
  const url_root = "https://api.jsonbin.io/v3/";
  const mockapi_prefix = "mock-api-";
  const api_crypto_storagekey = "jsbin-api-crypto-key";
  const maxLatency =100;
  let shadowStorage;
  let myMasterKey;
  let myAccessKey;
  let cryptoKey;
  let autoEncrypt;

  const fakeREST = new Map([
	[url_root + "b", mockRESThandler],
	[url_root + "c/uncategorized/bins",mockLISTINGHander]
  ]);

  function store_set(k, v) {
	if (shadowStorage) {
	  shadowStorage.setItem(mockapi_prefix + k, JSON.stringify(v));
	}
	return store.set(k, v);
  }

  function store_delete(k) {
	if (shadowStorage) {
	  shadowStorage.removeItem(mockapi_prefix + k);
	}
	return store.delete(k);
  }

  function mockRESThandler({ POST }) {
	if (POST) {
	  const id =
		Math.random().toString(36).substring(3) +
		Date.now().toString(16).substring(6);
	  return mockPOSThandler(id, POST);
	} else {
	  return error("Expecting POST data");
	}
  }
  
  function mockLISTINGHander( { GET }) {
	  const listing = [];
	  store.forEach(function(v,id){
		  listing.push({
			  "snippetMeta": {},
			  "private": true,
			  "record": id,
			  "createdAt": Date.now(),
		  });
	  });
	  return fakeAresponse(listing);
  }

  function mockPOSThandler(id, POST) {
	store_set(id, POST);
	fakeREST.set(url_root + "b/" + id, function ({ GET, PUT, DELETE }) {
	  if (!store.has(id)) {
		return error("Invalid Bin Id provided");
	  }
	  if (GET !== undefined) {
		return fakeAresponse({
		  record: store.get(id),
		  metadata: {
			id: id,
			private: true,
		  },
		});
	  }
	  if (PUT !== undefined) {
		store_set(id, PUT);
		return fakeAresponse({
		  record: PUT,
		  metadata: {
			id: id,
			private: true,
		  },
		});
	  }
	  if (DELETE !== undefined) {
		store_delete(id);
		fakeREST.delete(url_root + "b/" + id);
		return fakeAresponse({
		  metadata: {
			id: id,
			versionsDeleted: 0,
		  },
		  message: "Bin deleted successfully",
		});
	  }
	});
	return fakeAresponse({
	  record: POST,
	  metadata: {
		id: id,
		createdAt: Date.now(),
		private: true,
	  },
	});
  }

  function loadFromStorage() {
	store.clear();
	fakeREST.clear();
	shadowStorage = null;
	fakeREST.set(url_root + "b", mockRESThandler);
	fakeREST.set(url_root + "c/uncategorized/bins",mockLISTINGHander);
	
	const re = new RegExp(`^${mockapi_prefix}`);
	const ids = Object.keys(localStorage).filter((key) => re.test(key));
	ids.forEach((key) => {
	  const id = key.replace(re, "");
	  const data = JSON.parse(localStorage.getItem(key));
	  mockPOSThandler(id, data);
	});
	shadowStorage = localStorage;
  }

  function clear() {
	store.clear();
	fakeREST.clear();
	fakeREST.set(url_root + "b", mockRESThandler);
	fakeREST.set(url_root + "c/uncategorized/bins",mockLISTINGHander);
	const re = new RegExp(`^${mockapi_prefix}`);
	if (shadowStorage) {
	  const ids = Object.keys(localStorage).filter((key) => re.test(key));
	  ids.forEach((key) => {
		localStorage.removeItem(key);
	  });
	}
  }

  let api = api_mock;

  function api_mock(id, method, payload) {
	const cmd = {};
	method=method.toUpperCase();
	cmd[ method ] = payload===undefined ? {} : payload;
	const endpoint = url_root + (  id ? ("b/"+id) : (method==="POST" ? "b" :"c/uncategorized/bins" )) ;
	if (fakeREST.has(endpoint)) {
	  return fakeREST.get(endpoint)(cmd);
	} else {
	  return error("Invalid endpoint");
	}
  }

  function api_real(id, method, payload) {
	const cmd = {
	  mode: "cors",
	  method: method,
	  headers: myMasterKey
		? {
			"Content-Type": "application/json",
			"X-Master-Key": myMasterKey,
		  }
		: {
			"Content-Type": "application/json",
			"X-Access-Key": myAccessKey,
		  },
	};

	if (payload) cmd.body = JSON.stringify(payload);
   const endpoint = url_root + (  id ? ("b/"+id) : (method==="POST" ? "b" :"c/uncategorized/bins" )) ;
	
	return fetch(endpoint, cmd).then((response) => {
	  if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	  }
	  return response.json();
	});
  }

  function error(message) {
	return new Promise(function (resolve, reject) {
	  setTimeout(reject, 10 + Math.random() * 1000, new Error(message));
	});
  }

  function fakeAresponse(payload) {
	return new Promise(function (resolve) {
	  setTimeout(resolve, 1 + Math.random() * maxLatency-1, payload);
	});
  }

  function createStorageBin(data) {
	return api(undefined, "POST", data);
  }
  function listBinIds(){
	return api(undefined, "GET");
  }

  function retrieveStorageBin(id) {
	return api(id, "GET").then(function(data){
		console.log({GET:data});
		if (data.record &&data.record.e&&data.record.iv&&cryptoKey) {  
			
			return  decrypt(data.record).then(function(dec){
				data.metadata.decrypted=true;
				data.record = dec;
				return data;
				
			});
		}
		return data;
	});
  }

  function updateStorageBin(id, data) {
	return api(id, "PUT", data);
  }

  function deleteStorageBin(id) {
	return api(id, "DELETE");
  }

  // Add the onstorage event listener to sync changes across tabs
  window.addEventListener("storage", (event) => {
	if (event.key && event.key.startsWith(mockapi_prefix)) {
	  const id = event.key.replace(mockapi_prefix, "");
	  if (event.newValue) {
		const data = JSON.parse(event.newValue);
		mockPOSThandler(id, data);
	  } else {
		store_delete(id);
		fakeREST.delete(url_root + "b/" + id);
	  }
	}
  });

  // Generate encryption keys and store them in localStorage
  async function genKeys(reuseOk) {
	const previous = reuseOk && localStorage.getItem(api_crypto_storagekey);
	if (previous) return previous;
	cryptoKey = await window.crypto.subtle.generateKey(
	  {
		name: "AES-GCM",
		length: 256,
	  },
	  true,
	  ["encrypt", "decrypt"]
	);
	const exportedKey = await window.crypto.subtle.exportKey("jwk", cryptoKey);
	const keyData = JSON.stringify(exportedKey);
	localStorage.setItem(api_crypto_storagekey, keyData);
	return keyData;
  }

  // Revoke encryption keys
  function revokeKeys() {
	localStorage.removeItem(api_crypto_storagekey);
	cryptoKey = null;
  }

  // Load encryption keys from localStorage or provided keyData
  async function loadKeys(keyData) {
	  
	keyData = keyData || localStorage.getItem(api_crypto_storagekey);
	
	if (keyData) {
	  
	  cryptoKey = await window.crypto.subtle.importKey(
		"jwk",
		JSON.parse(keyData),
		{
		  name: "AES-GCM",
		},
		true,
		["encrypt", "decrypt"]
	  );
	  
	}
	
  }

  // Encrypt data
  async function encrypt(data) {
	  
	if (!cryptoKey) await loadKeys();
	
	const encoder = new TextEncoder();
	const encodedData = encoder.encode(JSON.stringify(data));
	const iv = window.crypto.getRandomValues(new Uint8Array(12));
	const encryptedData = await window.crypto.subtle.encrypt(
	  {
		name: "AES-GCM",
		iv: iv,
	  },
	  cryptoKey,
	  encodedData
	);
	
	return {
	  e: btoa(String.fromCharCode(...new Uint8Array(encryptedData))),
	  iv: btoa(String.fromCharCode(...iv)),
	};
  }
  
  async function setAutoEncrypt (enable) {
	  autoEncrypt = enable;
	  if (enable) {
		  await loadKeys();
		  if (!cryptoKey) {
			  await genKeys();
		  }
	  } else {
		  cryptoKey = null;
	  }
  } 

  // Decrypt data
  async function decrypt(encrypted) {
	if (!cryptoKey) await loadKeys();
	const iv = new Uint8Array(
	  atob(encrypted.iv).split("").map((c) => c.charCodeAt(0))
	);
	const data = new Uint8Array(
	  atob(encrypted.e).split("").map((c) => c.charCodeAt(0))
	);
	const decryptedData = await window.crypto.subtle.decrypt(
	  {
		name: "AES-GCM",
		iv: iv,
	  },
	  cryptoKey,
	  data
	);
	const decoder = new TextDecoder();
	return JSON.parse(decoder.decode(decryptedData));
  }

  if (access) {
	api = api_real;
	myAccessKey = access;
  }
  if (master) {
	api = api_real;
	myAccessKey = undefined;
	myMasterKey = master;
  }
  return {
	setAutoEncrypt,
	createStorageBin,
	retrieveStorageBin,
	updateStorageBin,
	deleteStorageBin,
	loadFromStorage,
	listBinIds,
	clear,
	genKeys,
	revokeKeys,
	loadKeys,
	encrypt,
	decrypt,
  };
}

(function () {
  // Check if running in a Node.js environment
  if (typeof module === "object") {
	module.exports = JSONBinAPI;
  } else {
	window.JSONBinAPI = JSONBinAPI;
  }
})();
